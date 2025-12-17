// ask-front-i/components/teacher/TeacherHomeView.tsx

"use client";

import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Filter, Download, Flag, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { FeatureInfoModal } from "@/components/student-dummy/FeatureInfoModal";
import { EvaluationCriteriaModal } from "@/components/teacher-dummy/EvaluationCriteriaModal";
import { StudentDetailSheet } from "@/components/teacher-dummy/StudentDetailSheet";
import { StudentHistoryView } from "@/components/teacher-dummy/StudentHistoryView";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

// ==========================================
// Types & Backend Integration
// ==========================================

interface StudentProgressData {
  user_id: number;
  name: string;
  seminar: string;
  intervention_flag: boolean;
  current_phase: string;
  question_change_count: number;
  post_count: number;
  last_posted_at: string;
  overall_signal: "green" | "yellow" | "red";
}

interface NonCognitiveData {
  user_id: number;
  name: string;
  overall: "green" | "yellow" | "red";
  p1_setting: "green" | "yellow" | "red";
  p2_gathering: "green" | "yellow" | "red";
  p3_involving: "green" | "yellow" | "red";
  p4_communication: "green" | "yellow" | "red";
  p5_humility: "green" | "yellow" | "red";
  p6_execution: "green" | "yellow" | "red";
  p7_completion: "green" | "yellow" | "red";
}

interface TeacherHomeViewProps {
  filters?: {
    class: string;
    phase: string;
    questionChange: string;
    order: string;
  };
  onFilterReset?: () => void;
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

export function TeacherHomeView({ filters, onFilterReset }: TeacherHomeViewProps) {
  const [showMobileFilterInfo, setShowMobileFilterInfo] = useState(false);
  const [showLogicInfo, setShowLogicInfo] = useState(false);
  
  // 詳細シート・履歴表示用のState
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedStudentName, setSelectedStudentName] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const seminarList = [
    "メディアラボ", "サイエンスラボ", "国際ゼミ", "工学ラボ", "社会科学ゼミ",
    "フィジカルラボ", "文化教育ゼミ", "地域ビジネスゼミ", "１－１ 地域共創", "１－２ 地域共創"
  ];

  // NOTE(MOCK): 2025年版ダミーデータ (60名)
  const rawData = [
    { name: "髙橋 由華", phase: "情報収集", change: 0, post: 8, date: "11/25", signal: "red" },
    { name: "江藤 泰平", phase: "課題設定", change: 2, post: 15, date: "12/17", signal: "green" },
    { name: "由井 理月", phase: "情報収集", change: 0, post: 12, date: "12/15", signal: "green" },
    { name: "伊藤 誠人", phase: "課題設定", change: 1, post: 6, date: "12/10", signal: "yellow" },
    { name: "佐藤 健太", phase: "情報収集", change: 1, post: 3, date: "11/03", signal: "red" },
    { name: "鈴木 花子", phase: "整理・分析", change: 2, post: 11, date: "12/12", signal: "yellow" },
    { name: "田中 太郎", phase: "まとめ・表現", change: 3, post: 20, date: "12/18", signal: "green" },
    { name: "山田 次郎", phase: "整理・分析", change: 3, post: 10, date: "12/16", signal: "green" },
    { name: "木村 拓哉", phase: "実験・調査", change: 0, post: 15, date: "11/30", signal: "yellow" },
    { name: "斎藤 飛鳥", phase: "発表準備", change: 4, post: 22, date: "12/18", signal: "green" },
    { name: "西野 七瀬", phase: "テーマ設定", change: 0, post: 1, date: "10/01", signal: "red" },
    { name: "白石 麻衣", phase: "情報収集", change: 1, post: 4, date: "11/25", signal: "yellow" },
    { name: "生田 絵梨花", phase: "整理・分析", change: 2, post: 11, date: "12/15", signal: "green" },
    { name: "秋元 真夏", phase: "課題設定", change: 5, post: 8, date: "12/10", signal: "yellow" },
    { name: "山下 美月", phase: "実験・調査", change: 2, post: 14, date: "12/16", signal: "green" },
    { name: "梅澤 美波", phase: "まとめ・表現", change: 3, post: 18, date: "12/17", signal: "green" },
    { name: "久保 史緒里", phase: "情報収集", change: 0, post: 2, date: "10/15", signal: "red" },
    { name: "与田 祐希", phase: "整理・分析", change: 1, post: 7, date: "12/05", signal: "yellow" },
    { name: "遠藤 さくら", phase: "実験・調査", change: 2, post: 10, date: "12/16", signal: "green" },
    { name: "賀喜 遥香", phase: "発表準備", change: 3, post: 20, date: "12/18", signal: "green" },
    { name: "井上 和", phase: "テーマ設定", change: 0, post: 5, date: "12/01", signal: "red" },
    { name: "菅原 咲月", phase: "課題設定", change: 1, post: 12, date: "12/15", signal: "green" },
    { name: "一ノ瀬 美空", phase: "情報収集", change: 0, post: 8, date: "12/10", signal: "yellow" },
    { name: "川﨑 桜", phase: "実験・調査", change: 2, post: 15, date: "12/16", signal: "green" },
    { name: "中西 アルノ", phase: "整理・分析", change: 3, post: 18, date: "12/17", signal: "green" },
    { name: "池田 瑛紗", phase: "まとめ・表現", change: 1, post: 22, date: "12/18", signal: "green" },
    { name: "小川 彩", phase: "発表準備", change: 2, post: 14, date: "12/14", signal: "green" },
    { name: "五百城 茉央", phase: "情報収集", change: 0, post: 3, date: "11/20", signal: "red" },
    { name: "奥田 いろは", phase: "課題設定", change: 1, post: 9, date: "12/08", signal: "yellow" },
    { name: "冨里 奈央", phase: "実験・調査", change: 0, post: 11, date: "12/12", signal: "green" },
    { name: "黒見 明香", phase: "テーマ設定", change: 0, post: 2, date: "11/01", signal: "red" },
    { name: "佐藤 璃果", phase: "情報収集", change: 1, post: 6, date: "12/05", signal: "yellow" },
    { name: "林 瑠奈", phase: "整理・分析", change: 2, post: 13, date: "12/15", signal: "green" },
    { name: "松尾 美佑", phase: "実験・調査", change: 3, post: 16, date: "12/17", signal: "green" },
    { name: "矢久保 美緒", phase: "まとめ・表現", change: 1, post: 8, date: "12/01", signal: "yellow" },
    { name: "清宮 レイ", phase: "課題設定", change: 0, post: 4, date: "11/15", signal: "red" },
    { name: "柴田 柚菜", phase: "情報収集", change: 2, post: 12, date: "12/14", signal: "green" },
    { name: "金川 紗耶", phase: "整理・分析", change: 1, post: 10, date: "12/10", signal: "yellow" },
    { name: "早川 聖来", phase: "発表準備", change: 3, post: 19, date: "12/18", signal: "green" },
    { name: "田村 真佑", phase: "実験・調査", change: 2, post: 15, date: "12/16", signal: "green" },
    { name: "筒井 あやめ", phase: "課題設定", change: 0, post: 7, date: "11/30", signal: "yellow" },
    { name: "掛橋 沙耶香", phase: "情報収集", change: 1, post: 5, date: "11/25", signal: "red" },
    { name: "鈴木 絢音", phase: "整理・分析", change: 2, post: 14, date: "12/15", signal: "green" },
    { name: "山崎 怜奈", phase: "まとめ・表現", change: 4, post: 25, date: "12/18", signal: "green" },
    { name: "渡辺 みり愛", phase: "実験・調査", change: 1, post: 9, date: "12/05", signal: "yellow" },
    { name: "北野 日奈子", phase: "課題設定", change: 0, post: 3, date: "11/10", signal: "red" },
    { name: "新内 眞衣", phase: "情報収集", change: 2, post: 11, date: "12/13", signal: "green" },
    { name: "寺田 蘭世", phase: "整理・分析", change: 1, post: 8, date: "12/08", signal: "yellow" },
    { name: "星野 みなみ", phase: "発表準備", change: 3, post: 17, date: "12/17", signal: "green" },
    { name: "樋口 日奈", phase: "実験・調査", change: 0, post: 6, date: "11/20", signal: "red" },
    { name: "和田 まあや", phase: "テーマ設定", change: 0, post: 1, date: "11/15", signal: "red" },
    { name: "伊藤 純奈", phase: "課題設定", change: 1, post: 5, date: "12/01", signal: "yellow" },
    { name: "佐々木 琴子", phase: "情報収集", change: 0, post: 2, date: "11/10", signal: "red" },
    { name: "伊藤 かりん", phase: "整理・分析", change: 2, post: 13, date: "12/14", signal: "green" },
    { name: "斉藤 優里", phase: "実験・調査", change: 3, post: 16, date: "12/16", signal: "green" },
    { name: "西川 七海", phase: "まとめ・表現", change: 1, post: 9, date: "12/05", signal: "yellow" },
    { name: "能條 愛未", phase: "発表準備", change: 2, post: 18, date: "12/18", signal: "green" },
    { name: "川村 真洋", phase: "情報収集", change: 0, post: 4, date: "11/25", signal: "red" },
    { name: "畠中 清羅", phase: "課題設定", change: 1, post: 7, date: "12/10", signal: "yellow" },
    { name: "大和 里菜", phase: "実験・調査", change: 0, post: 10, date: "12/12", signal: "green" },
  ];

  // ==========================================
  // Logic: Intervention Check
  // ==========================================
  const calculateInterventionFlag = (change: number, post: number, dateStr: string): boolean => {
    if (change === 0) return true;
    if (post < 10) return true;
    const MOCK_CURRENT_DATE = new Date("2025-12-18");
    const [month, day] = dateStr.split('/').map(Number);
    const lastPostDate = new Date(2025, month - 1, day);
    const diffTime = Math.abs(MOCK_CURRENT_DATE.getTime() - lastPostDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    if (diffDays >= 14) return true;
    return false;
  };

  const processedData = useMemo(() => {
    let data = rawData.map((d, i) => ({
      user_id: i + 1,
      name: d.name,
      seminar: i < 4 ? "メディアラボ" : seminarList[i % seminarList.length],
      intervention_flag: calculateInterventionFlag(d.change, d.post, d.date),
      current_phase: d.phase,
      question_change_count: d.change,
      post_count: d.post,
      last_posted_at: d.date,
      overall_signal: d.signal as "green" | "yellow" | "red",
    }));

    if (filters) {
      if (filters.class !== "all") {
        const seminarMap: Record<string, string> = {
          "media": "メディアラボ", "science": "サイエンスラボ", "international": "国際ゼミ",
          "engineering": "工学ラボ", "social": "社会科学ゼミ", "physical": "フィジカルラボ",
          "culture": "文化教育ゼミ", "business": "地域ビジネスゼミ",
          "region_1_1": "１－１ 地域共創", "region_1_2": "１－２ 地域共創"
        };
        const target = seminarMap[filters.class];
        if (target) data = data.filter(d => d.seminar === target);
      }

      if (filters.phase !== "all") {
        if (filters.phase === "setting") data = data.filter(d => d.current_phase.includes("課題") || d.current_phase.includes("テーマ"));
        if (filters.phase === "gathering") data = data.filter(d => d.current_phase.includes("情報") || d.current_phase.includes("実験"));
        if (filters.phase === "analysis") data = data.filter(d => d.current_phase.includes("分析") || d.current_phase.includes("まとめ"));
      }

      if (filters.questionChange !== "all") {
        if (filters.questionChange === "0") data = data.filter(d => d.question_change_count === 0);
        if (filters.questionChange === "1") data = data.filter(d => d.question_change_count >= 1);
        if (filters.questionChange === "3") data = data.filter(d => d.question_change_count >= 3);
      }

      if (filters.order !== "all") {
        if (filters.order === "desc") data.sort((a, b) => b.post_count - a.post_count);
        if (filters.order === "asc") data.sort((a, b) => a.post_count - b.post_count);
      }
    }
    return data;
  }, [filters]);

  const nonCogDataList = useMemo(() => {
    return processedData.map(p => {
      const isGood = p.overall_signal === "green";
      const isBad = p.overall_signal === "red";
      return {
        user_id: p.user_id,
        name: p.name,
        overall: p.overall_signal,
        p1_setting: isGood ? "green" : (isBad ? "red" : "yellow"),
        p2_gathering: isGood ? "green" : (isBad ? "yellow" : "green"),
        p3_involving: isGood ? "yellow" : (isBad ? "red" : "yellow"),
        p4_communication: "green",
        p5_humility: isGood ? "green" : (isBad ? "red" : "yellow"),
        p6_execution: p.post_count > 10 ? "green" : "yellow", 
        p7_completion: isGood ? "green" : (isBad ? "red" : "yellow"),
      } as NonCognitiveData;
    });
  }, [processedData]);

  const totalItems = processedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  useMemo(() => {
    setCurrentPage(1);
  }, [filters]);

  const currentProgressData = processedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const currentNonCogData = nonCogDataList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const isClickableStudent = (name: string) => {
    const targetStudents = ["髙橋 由華", "江藤 泰平", "由井 理月", "伊藤 誠人"];
    return targetStudents.includes(name);
  };

  const handleRowClick = (studentId: number, studentName: string) => {
    if (isClickableStudent(studentName)) {
      setSelectedStudentId(studentId);
      setSelectedStudentName(studentName);
    }
  };

  const getSignalDot = (color: "green" | "yellow" | "red") => {
    const colorClass = 
      color === "green" ? "bg-green-500" : 
      color === "yellow" ? "bg-yellow-400" : 
      "bg-red-500";
    return <div className={`h-4 w-4 rounded-full mx-auto ${colorClass}`} />;
  };

  const handleShowHistory = () => {
    setSelectedStudentId(null);
    setShowHistory(true);
  };

  const handleBackToTable = () => {
    setShowHistory(false);
    setSelectedStudentName(null);
  };

  // ★重要: ここで分岐
  if (showHistory && selectedStudentName) {
    return (
      <StudentHistoryView 
        studentName={selectedStudentName} 
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
      <StudentDetailSheet
        isOpen={!!selectedStudentId}
        onClose={() => setSelectedStudentId(null)}
        studentId={selectedStudentId}
        studentName={selectedStudentName}
        onHistoryClick={handleShowHistory}
      />

      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => setShowLogicInfo(true)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors group">
            <Info className="w-4 h-4" />
            <span className="border-b border-dotted border-slate-400 group-hover:border-primary">評価基準詳細</span>
          </button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setShowMobileFilterInfo(true)}>
            <Filter className="mr-2 h-4 w-4" /> 絞り込み
          </Button>
          <Button variant="outline" size="sm" onClick={() => downloadCSV(processedData, `ask_data_2025.csv`)} className="bg-white hover:bg-slate-50 text-slate-700 border-slate-300">
            <Download className="mr-2 h-4 w-4" /> CSV出力
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-white shadow-sm" onClick={onFilterReset}>
            すべての選択を解除
          </Button>
        </div>
      </div>

      <Tabs defaultValue="progress" className="flex-1 flex flex-col min-h-0 gap-0">
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
                  <TableHead className="text-center font-bold text-white h-12 w-[140px]">ゼミ</TableHead>
                  <TableHead className="text-center font-bold text-white h-12 w-[100px]">介入フラグ</TableHead>
                  <TableHead className="text-center font-bold text-white h-12 w-[120px]">フェーズ</TableHead>
                  <TableHead className="text-center font-bold text-white h-12 w-[120px]">問いの変更回数</TableHead>
                  <TableHead className="text-center font-bold text-white h-12 w-[100px]">投稿数</TableHead>
                  <TableHead className="text-center font-bold text-white h-12 w-[120px]">最終投稿日</TableHead>
                  <TableHead className="text-center font-bold text-white h-12 w-[140px]">非認知知能力<br/>発揮状況</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentProgressData.map((student, index) => {
                  const clickable = isClickableStudent(student.name);
                  return (
                    <TableRow 
                      key={student.user_id} 
                      onClick={() => handleRowClick(student.user_id, student.name)}
                      className={cn(
                        "transition-colors border-slate-200",
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/50",
                        clickable ? "cursor-pointer hover:bg-purple-50 group" : "cursor-default"
                      )}
                    >
                      <TableCell className={cn(
                        "font-bold text-slate-800 py-3 pl-4 sticky left-0 z-30 shadow-[2px_0_5px_rgba(0,0,0,0.05)] border-r border-slate-100 transition-colors",
                        index % 2 === 0 ? "bg-white" : "bg-[#f9fafb]",
                        clickable && "group-hover:bg-purple-50",
                        clickable ? "text-primary underline decoration-primary/30 underline-offset-4" : "text-slate-800"
                      )}>
                        {student.name}
                      </TableCell>
                      <TableCell className="text-center text-xs font-bold text-slate-600 py-3">{student.seminar}</TableCell>
                      <TableCell className="text-center py-3">
                        {student.intervention_flag && (
                          <div className="flex justify-center" title="要介入">
                            <Flag className="w-5 h-5 text-primary fill-primary animate-pulse" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-center font-medium text-slate-700 py-3">{student.current_phase}</TableCell>
                      <TableCell className="text-center font-medium text-slate-700 py-3">{student.question_change_count}</TableCell>
                      <TableCell className="text-center font-bold text-slate-900 py-3 text-lg">{student.post_count}</TableCell>
                      <TableCell className="text-center font-medium text-slate-600 py-3">{student.last_posted_at}</TableCell>
                      <TableCell className="text-center py-3">{getSignalDot(student.overall_signal)}</TableCell>
                    </TableRow>
                  );
                })}
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
                  <TableHead className="text-center font-bold text-white h-12 min-w-[80px]">総合</TableHead>
                  <TableHead className="text-center font-bold text-white h-12 min-w-[100px]">課題設定力</TableHead>
                  <TableHead className="text-center font-bold text-white h-12 min-w-[100px]">情報収集力</TableHead>
                  <TableHead className="text-center font-bold text-white h-12 min-w-[100px]">巻き込む力</TableHead>
                  <TableHead className="text-center font-bold text-white h-12 min-w-[100px]">対話する力</TableHead>
                  <TableHead className="text-center font-bold text-white h-12 min-w-[100px]">謙虚である力</TableHead>
                  <TableHead className="text-center font-bold text-white h-12 min-w-[100px]">実行する力</TableHead>
                  <TableHead className="text-center font-bold text-white h-12 min-w-[100px]">完遂する力</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentNonCogData.map((student, index) => {
                  const clickable = isClickableStudent(student.name);
                  return (
                    <TableRow 
                      key={student.user_id} 
                      onClick={() => handleRowClick(student.user_id, student.name)}
                      className={cn(
                        "transition-colors border-slate-200",
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/50",
                        clickable ? "cursor-pointer hover:bg-purple-50 group" : "cursor-default"
                      )}
                    >
                      <TableCell className={cn(
                        "font-bold text-slate-800 py-3 pl-4 sticky left-0 z-30 shadow-[2px_0_5px_rgba(0,0,0,0.05)] border-r border-slate-100 transition-colors",
                        index % 2 === 0 ? "bg-white" : "bg-[#f9fafb]",
                        clickable && "group-hover:bg-purple-50",
                        clickable ? "text-primary underline decoration-primary/30 underline-offset-4" : "text-slate-800"
                      )}>
                        {student.name}
                      </TableCell>
                      <TableCell className="text-center py-3">{getSignalDot(student.overall)}</TableCell>
                      <TableCell className="text-center py-3">{getSignalDot(student.p1_setting)}</TableCell>
                      <TableCell className="text-center py-3">{getSignalDot(student.p2_gathering)}</TableCell>
                      <TableCell className="text-center py-3">{getSignalDot(student.p3_involving)}</TableCell>
                      <TableCell className="text-center py-3">{getSignalDot(student.p4_communication)}</TableCell>
                      <TableCell className="text-center py-3">{getSignalDot(student.p5_humility)}</TableCell>
                      <TableCell className="text-center py-3">{getSignalDot(student.p6_execution)}</TableCell>
                      <TableCell className="text-center py-3">{getSignalDot(student.p7_completion)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer Pagination */}
      <div className="flex items-center justify-between pt-1 px-1 shrink-0 h-1">
        <div className="text-[10px] sm:text-xs text-slate-500 font-medium">
          全 {totalItems} 件中 <span className="font-bold text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-bold text-slate-800">{Math.min(currentPage * itemsPerPage, totalItems)}</span> 件を表示
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
            {currentPage} / {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-7 w-7 p-0"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}