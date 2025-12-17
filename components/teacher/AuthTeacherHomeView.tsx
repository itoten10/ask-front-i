// ask-front/components/teacher/AuthTeacherHomeView.tsx
// API接続版の教師ホームビュー

"use client";

import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Filter, Download, Flag, Info, ChevronLeft, ChevronRight, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { FeatureInfoModal } from "@/components/student/FeatureInfoModal";
import { EvaluationCriteriaModal } from "@/components/teacher/EvaluationCriteriaModal";
import { StudentDetailSheet } from "@/components/teacher/StudentDetailSheet";
import { StudentHistoryView } from "@/components/teacher/StudentHistoryView";
import { useState, useMemo, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";

// ==========================================
// Types (APIレスポンス型)
// ==========================================

// /dashboard/learning-progress のレスポンス型
interface LearningProgressItem {
  user_id: number;
  full_name: string;
  grade: number | null;
  class_name: string | null;
  phase: string;
  post_count: number;
  question_change_count: number;
  last_posted_at: string | null;
  intervention_flag: boolean;
}

// /dashboard/non-cognitive-abilities のレスポンス型
interface NonCognitiveAbilityItem {
  user_id: number;
  full_name: string;
  grade: number | null;
  class_name: string | null;
  post_count: number;
  received_letters_count: number;
  sent_letters_count: number;
  abilities: {
    [key: string]: number;  // ability_code: score
  };
}

// 能力コードと日本語名のマッピング（DBのcodeと一致させる）
const ABILITY_LABELS: Record<string, string> = {
  problem_setting: "課題設定力",
  information_gathering: "情報収集力",
  involvement: "巻き込む力",
  communication: "対話する力",
  humility: "謙虚である力",
  execution: "実行する力",
  completion: "完遂する力",
};

// 能力コードの順序（DBのcodeと一致させる）
const ABILITY_ORDER = ["problem_setting", "information_gathering", "involvement", "communication", "humility", "execution", "completion"];

interface AuthTeacherHomeViewProps {
  accessToken: string | null;
  filters?: {
    class: string;
    phase: string;
    questionChange: string;
    order: string;
  };
  onFilterReset?: () => void;
}

// シグナルカラーを計算（パーセンタイルベース、同点考慮）
function calculateSignalColor(score: number, allScores: number[]): "green" | "yellow" | "red" {
  if (allScores.length === 0) return "yellow";
  if (allScores.length === 1) return score > 0 ? "green" : "red";

  // スコアが0の場合は赤（データなし）
  if (score === 0) return "red";

  const sortedScores = [...allScores].sort((a, b) => a - b);

  // 0以外のスコアで比較（0は除外してパーセンタイル計算）
  const nonZeroScores = sortedScores.filter(s => s > 0);
  if (nonZeroScores.length === 0) return "yellow";
  if (nonZeroScores.length === 1) return "green";

  // 同点を考慮したパーセンタイル計算
  // 自分より下のスコア数 + 同点の半分 を使用（中央値方式）
  const belowCount = nonZeroScores.filter(s => s < score).length;
  const equalCount = nonZeroScores.filter(s => s === score).length;
  const rank = belowCount + (equalCount - 1) / 2;
  const percentile = (rank / (nonZeroScores.length - 1)) * 100;

  if (percentile >= 66.6) return "green";
  if (percentile >= 33.3) return "yellow";
  return "red";
}

// 全体スコアのシグナルを計算
function calculateOverallSignal(abilities: Record<string, number>, allStudentAbilities: Array<Record<string, number>>): "green" | "yellow" | "red" {
  const totalScore = Object.values(abilities).reduce((sum, s) => sum + s, 0);
  const allTotalScores = allStudentAbilities.map(a => Object.values(a).reduce((sum, s) => sum + s, 0));
  return calculateSignalColor(totalScore, allTotalScores);
}

const downloadCSV = (data: any[], fileName: string) => {
  const csvContent = [
    Object.keys(data[0]).join(","),
    ...data.map(row => Object.values(row).map(v => `"${v}"`).join(","))
  ].join("\n");

  const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export function AuthTeacherHomeView({ accessToken, filters, onFilterReset }: AuthTeacherHomeViewProps) {
  const [showMobileFilterInfo, setShowMobileFilterInfo] = useState(false);
  const [showLogicInfo, setShowLogicInfo] = useState(false);

  // データ取得状態
  const [progressData, setProgressData] = useState<LearningProgressItem[]>([]);
  const [abilityData, setAbilityData] = useState<NonCognitiveAbilityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 詳細シート・履歴表示用のState
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedStudentName, setSelectedStudentName] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // タブの状態管理 (デフォルトは "progress")
  const [activeTab, setActiveTab] = useState<string>("progress");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8000";

  // データ取得
  const fetchData = useCallback(async () => {
    if (!accessToken) return;

    setIsLoading(true);
    setError(null);

    try {
      // 並行してデータを取得
      const [progressResponse, abilityResponse] = await Promise.all([
        fetch(`${API_ENDPOINT}/dashboard/learning-progress`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          credentials: "include",
        }),
        fetch(`${API_ENDPOINT}/dashboard/non-cognitive-abilities`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          credentials: "include",
        }),
      ]);

      if (!progressResponse.ok || !abilityResponse.ok) {
        throw new Error("データの取得に失敗しました");
      }

      const progressJson = await progressResponse.json();
      const abilityJson = await abilityResponse.json();

      setProgressData(progressJson);
      setAbilityData(abilityJson);
    } catch (err) {
      console.error("データ取得エラー:", err);
      setError("データの取得に失敗しました。再読み込みしてください。");
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, API_ENDPOINT]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // フィルタリング済みの進捗データ
  const filteredProgressData = useMemo(() => {
    let data = [...progressData];

    if (filters) {
      // クラスフィルター
      if (filters.class !== "all") {
        const gradeClassMatch = filters.class.match(/^(\d+)-(.+)$/);
        if (gradeClassMatch) {
          const grade = parseInt(gradeClassMatch[1]);
          const className = gradeClassMatch[2];
          data = data.filter(d => d.grade === grade && d.class_name === className);
        }
      }

      // フェーズフィルター
      if (filters.phase !== "all") {
        if (filters.phase === "setting") data = data.filter(d => d.phase.includes("課題") || d.phase.includes("テーマ"));
        if (filters.phase === "gathering") data = data.filter(d => d.phase.includes("情報") || d.phase.includes("整理"));
        if (filters.phase === "analysis") data = data.filter(d => d.phase.includes("分析") || d.phase.includes("まとめ"));
      }

      // 問い変更回数フィルター
      if (filters.questionChange !== "all") {
        if (filters.questionChange === "0") data = data.filter(d => d.question_change_count === 0);
        if (filters.questionChange === "1") data = data.filter(d => d.question_change_count >= 1);
        if (filters.questionChange === "3") data = data.filter(d => d.question_change_count >= 3);
      }

      // 並び順
      if (filters.order !== "all") {
        if (filters.order === "desc") data.sort((a, b) => b.post_count - a.post_count);
        if (filters.order === "asc") data.sort((a, b) => a.post_count - b.post_count);
      }
    }
    return data;
  }, [progressData, filters]);

  // 非認知能力データ（全生徒の能力データを元にシグナルを計算）
  const processedAbilityData = useMemo(() => {
    const allAbilities = abilityData.map(d => d.abilities);

    return filteredProgressData.map(progress => {
      const ability = abilityData.find(a => a.user_id === progress.user_id);
      if (!ability) {
        return {
          user_id: progress.user_id,
          full_name: progress.full_name,
          grade: progress.grade,
          class_name: progress.class_name,
          overall: "yellow" as const,
          abilities: {} as Record<string, "green" | "yellow" | "red">,
        };
      }

      // 各能力のシグナルを計算
      const abilitySignals: Record<string, "green" | "yellow" | "red"> = {};
      for (const code of ABILITY_ORDER) {
        const score = ability.abilities[code] || 0;
        const allScoresForAbility = allAbilities.map(a => a[code] || 0);
        abilitySignals[code] = calculateSignalColor(score, allScoresForAbility);
      }

      return {
        user_id: progress.user_id,
        full_name: progress.full_name,
        grade: progress.grade,
        class_name: progress.class_name,
        overall: calculateOverallSignal(ability.abilities, allAbilities),
        abilities: abilitySignals,
      };
    });
  }, [filteredProgressData, abilityData]);

  const totalItems = filteredProgressData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const currentProgressData = filteredProgressData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const currentAbilityData = processedAbilityData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // 選択された生徒の学年・クラスを保持
  const [selectedStudentGrade, setSelectedStudentGrade] = useState<number | null>(null);
  const [selectedStudentClass, setSelectedStudentClass] = useState<string | null>(null);

  const handleRowClick = (studentId: number, studentName: string, grade?: number | null, className?: string | null) => {
    setSelectedStudentId(studentId);
    setSelectedStudentName(studentName);
    setSelectedStudentGrade(grade ?? null);
    setSelectedStudentClass(className ?? null);
  };

  const getSignalDot = (color: "green" | "yellow" | "red") => {
    const colorClass =
      color === "green" ? "bg-green-500" :
      color === "yellow" ? "bg-yellow-400" :
      "bg-red-500";
    return <div className={`h-4 w-4 rounded-full mx-auto ${colorClass}`} />;
  };

  // 履歴表示用のstudentIdを保持（シートを閉じた後も維持）
  const [historyStudentId, setHistoryStudentId] = useState<number | null>(null);

  const handleShowHistory = () => {
    setHistoryStudentId(selectedStudentId);
    setSelectedStudentId(null);
    setShowHistory(true);
  };

  const handleBackToTable = () => {
    setShowHistory(false);
    setSelectedStudentName(null);
    setHistoryStudentId(null);
  };

  // ローディング中
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-slate-500">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  // エラー時
  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <p className="text-slate-700">{error}</p>
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            再読み込み
          </Button>
        </div>
      </div>
    );
  }

  // 履歴表示
  if (showHistory && selectedStudentName && historyStudentId) {
    return (
      <StudentHistoryView
        studentName={selectedStudentName}
        studentId={historyStudentId}
        accessToken={accessToken}
        onBack={handleBackToTable}
      />
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* モバイルフィルターの注意書きモーダル */}
      <FeatureInfoModal
        open={showMobileFilterInfo}
        onClose={() => setShowMobileFilterInfo(false)}
        title="フィルター機能"
        description="モバイル版での詳細な絞り込み機能は、フェーズ2以降で最適化して実装予定です。現在はPC版をご利用ください。"
      />

      {/* 評価基準の詳細モーダル */}
      <EvaluationCriteriaModal
        open={showLogicInfo}
        onClose={() => setShowLogicInfo(false)}
      />

      {/* 生徒詳細シート (選択状態に応じて表示) */}
      {/* activeTab を渡し、進捗タブ/非認知タブのどちらから開かれたかを判別して表示を切り替える */}
      <StudentDetailSheet
        isOpen={!!selectedStudentId}
        onClose={() => setSelectedStudentId(null)}
        studentId={selectedStudentId}
        studentName={selectedStudentName}
        studentGrade={selectedStudentGrade}
        studentClass={selectedStudentClass}
        accessToken={accessToken}
        onHistoryClick={handleShowHistory}
        activeTab={activeTab}
      />

      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => setShowLogicInfo(true)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors group">
            <Info className="w-4 h-4" />
            <span className="border-b border-dotted border-slate-400 group-hover:border-primary">評価基準詳細</span>
          </button>
          <button onClick={fetchData} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors">
            <RefreshCw className="w-4 h-4" />
            <span>更新</span>
          </button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setShowMobileFilterInfo(true)}>
            <Filter className="mr-2 h-4 w-4" /> 絞り込み
          </Button>
          <Button variant="outline" size="sm" onClick={() => downloadCSV(filteredProgressData as any[], `ask_data_${format(new Date(), "yyyyMMdd")}.csv`)} className="bg-white hover:bg-slate-50 text-slate-700 border-slate-300">
            <Download className="mr-2 h-4 w-4" /> CSV出力
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-white shadow-sm" onClick={onFilterReset}>
            すべての選択を解除
          </Button>
        </div>
      </div>

      {/* Tabs の状態を管理し、onValueChange で activeTab を更新 */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val)} className="flex-1 flex flex-col min-h-0 gap-0">
        <div className="flex w-full items-end gap-0 shrink-0">
          <TabsList className="flex-1 justify-start p-0 gap-0 mb-0 h-auto bg-white border border-slate-200 border-b-0 rounded-none overflow-hidden shadow-none">
            <TabsTrigger value="progress" className="rounded-none px-6 py-3 font-bold text-sm data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-primary transition-all border-0">
              探究学習 進捗状況
            </TabsTrigger>
            <TabsTrigger value="non-cognitive" className="rounded-none px-6 py-3 font-bold text-sm data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-primary transition-all border-0">
              非認知能力データ
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: 進捗状況 */}
        <TabsContent value="progress" className="flex-1 flex flex-col min-h-0 m-0 border-x border-b border-slate-200 rounded-b-md bg-white">
          <div className="flex-1 overflow-auto relative">
            <table className="w-full text-sm caption-bottom">
              <TableHeader className="bg-primary hover:bg-primary sticky top-0 z-40 shadow-sm">
                <TableRow className="hover:bg-primary border-b-0">
                  <TableHead className="font-bold text-white h-12 w-[120px] sticky left-0 z-50 bg-primary shadow-[2px_0_5px_rgba(0,0,0,0.1)]">氏名</TableHead>
                  <TableHead className="text-center font-bold text-white h-12 w-[100px]">学年/クラス</TableHead>
                  <TableHead className="text-center font-bold text-white h-12 w-[100px]">介入フラグ</TableHead>
                  <TableHead className="text-center font-bold text-white h-12 w-[120px]">フェーズ</TableHead>
                  <TableHead className="text-center font-bold text-white h-12 w-[120px]">課題変更回数</TableHead>
                  <TableHead className="text-center font-bold text-white h-12 w-[100px]">投稿数</TableHead>
                  <TableHead className="text-center font-bold text-white h-12 w-[120px]">最終投稿日</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentProgressData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                      データがありません
                    </TableCell>
                  </TableRow>
                ) : (
                  currentProgressData.map((student, index) => {
                    const lastPostedDate = student.last_posted_at
                      ? format(parseISO(student.last_posted_at), "M/d", { locale: ja })
                      : "-";

                    return (
                      <TableRow
                        key={student.user_id}
                        onClick={() => handleRowClick(student.user_id, student.full_name, student.grade, student.class_name)}
                        className={cn(
                          "transition-colors border-slate-200 cursor-pointer hover:bg-purple-50 group",
                          index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                        )}
                      >
                        <TableCell className={cn(
                          "font-bold py-3 pl-4 sticky left-0 z-30 shadow-[2px_0_5px_rgba(0,0,0,0.05)] border-r border-slate-100 transition-colors text-primary underline decoration-primary/30 underline-offset-4",
                          index % 2 === 0 ? "bg-white" : "bg-[#f9fafb]",
                          "group-hover:bg-purple-50"
                        )}>
                          {student.full_name}
                        </TableCell>
                        <TableCell className="text-center text-xs font-bold text-slate-600 py-3">
                          {student.grade && student.class_name
                            ? `${student.grade}-${student.class_name}`
                            : student.grade
                              ? `${student.grade}年`
                              : "-"
                          }
                        </TableCell>
                        <TableCell className="text-center py-3">
                          {student.intervention_flag && (
                            <div className="flex justify-center" title="要介入">
                              <Flag className="w-5 h-5 text-primary fill-primary animate-pulse" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-center font-medium text-slate-700 py-3">{student.phase}</TableCell>
                        <TableCell className="text-center font-medium text-slate-700 py-3">{student.question_change_count}</TableCell>
                        <TableCell className="text-center font-bold text-slate-900 py-3 text-lg">{student.post_count}</TableCell>
                        <TableCell className="text-center font-medium text-slate-600 py-3">{lastPostedDate}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </table>
          </div>
        </TabsContent>

        {/* Tab 2: 非認知能力 */}
        <TabsContent value="non-cognitive" className="flex-1 flex flex-col min-h-0 m-0 border-x border-b border-slate-200 rounded-b-md bg-white">
           <div className="flex-1 overflow-auto relative">
            <table className="w-full text-sm caption-bottom">
              <TableHeader className="bg-primary hover:bg-primary sticky top-0 z-40 shadow-sm">
                <TableRow className="hover:bg-primary border-b-0">
                  <TableHead className="font-bold text-white h-12 min-w-[120px] sticky left-0 z-50 bg-primary shadow-[2px_0_5px_rgba(0,0,0,0.1)]">氏名</TableHead>
                  {ABILITY_ORDER.map(code => (
                    <TableHead key={code} className="text-center font-bold text-white h-12 min-w-[100px]">
                      {ABILITY_LABELS[code]}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentAbilityData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                      データがありません
                    </TableCell>
                  </TableRow>
                ) : (
                  currentAbilityData.map((student, index) => (
                    <TableRow
                      key={student.user_id}
                      onClick={() => handleRowClick(student.user_id, student.full_name, student.grade, student.class_name)}
                      className={cn(
                        "transition-colors border-slate-200 cursor-pointer hover:bg-purple-50 group",
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                      )}
                    >
                      <TableCell className={cn(
                        "font-bold py-3 pl-4 sticky left-0 z-30 shadow-[2px_0_5px_rgba(0,0,0,0.05)] border-r border-slate-100 transition-colors text-primary underline decoration-primary/30 underline-offset-4",
                        index % 2 === 0 ? "bg-white" : "bg-[#f9fafb]",
                        "group-hover:bg-purple-50"
                      )}>
                        {student.full_name}
                      </TableCell>
                      {ABILITY_ORDER.map(code => (
                        <TableCell key={code} className="text-center py-3">
                          {getSignalDot(student.abilities[code] || "yellow")}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer Pagination */}
      <div className="flex items-center justify-between pt-1 px-1 shrink-0 h-1">
        <div className="text-[10px] sm:text-xs text-slate-500 font-medium">
          全 {totalItems} 件中 <span className="font-bold text-slate-800">{totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> - <span className="font-bold text-slate-800">{Math.min(currentPage * itemsPerPage, totalItems)}</span> 件を表示
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-7 w-7 p-0"
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <div className="text-xs font-bold text-slate-700 px-2">
            {currentPage} / {totalPages || 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="h-7 w-7 p-0"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
