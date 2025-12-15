// ask-front/components/teacher/StudentDetailSheet.tsx
// DB接続版：生徒の詳細シート（レーダーチャート）

"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FileText, Mail, Bot, X, ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";

// Recharts
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// ==========================================
// Types
// ==========================================
type AbilityCode =
  | "setting" | "gathering" | "involving" | "communication"
  | "humility" | "execution" | "completion";

interface StudentDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: number | null;
  studentName: string | null;
  studentGrade?: number | null;
  studentClass?: string | null;
  accessToken: string | null;
  onHistoryClick: () => void;
}

// 能力コードと日本語名のマッピング
const ABILITY_LABELS: Record<string, string> = {
  setting: "課題設定",
  gathering: "情報収集",
  involving: "巻込力",
  communication: "対話力",
  humility: "謙虚さ",
  execution: "実行力",
  completion: "完遂力",
};

const ABILITY_ORDER: AbilityCode[] = ["setting", "gathering", "involving", "communication", "humility", "execution", "completion"];

const chartConfig = {
  score: {
    label: "能力値",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

// APIレスポンス型
interface NonCognitiveAbilityItem {
  user_id: number;
  full_name: string;
  grade: number | null;
  class_name: string | null;
  post_count: number;
  received_letters_count: number;
  sent_letters_count: number;
  abilities: Record<string, number>;
}

export function StudentDetailSheet({
  isOpen,
  onClose,
  studentId,
  studentName,
  studentGrade,
  studentClass,
  accessToken,
  onHistoryClick
}: StudentDetailSheetProps) {

  const [abilityData, setAbilityData] = useState<Record<string, number> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8000";

  // 非認知能力データを取得
  const fetchAbilityData = useCallback(async () => {
    if (!accessToken || !studentId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINT}/dashboard/non-cognitive-abilities`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("データの取得に失敗しました");
      }

      const data: NonCognitiveAbilityItem[] = await response.json();
      const studentData = data.find(item => item.user_id === studentId);

      if (studentData) {
        setAbilityData(studentData.abilities);
      }
    } catch (err) {
      console.error("非認知能力データ取得エラー:", err);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, studentId, API_ENDPOINT]);

  useEffect(() => {
    if (isOpen && studentId) {
      fetchAbilityData();
    }
  }, [isOpen, studentId, fetchAbilityData]);

  // スコアを5段階に正規化（最大値を5として計算）
  const normalizeScore = (score: number): number => {
    // スコアが10以上なら5、0以下なら0、それ以外は比例計算
    if (score >= 10) return 5;
    if (score <= 0) return 0;
    return Math.round((score / 10) * 5 * 10) / 10; // 0-5の範囲で小数点1桁
  };

  const chartData = abilityData ? ABILITY_ORDER.map(code => ({
    subject: ABILITY_LABELS[code],
    score: normalizeScore(abilityData[code] || 0),
  })) : [];

  const gradeClass = studentGrade && studentClass
    ? `${studentGrade}年${studentClass}組`
    : studentGrade
      ? `${studentGrade}年`
      : "-";

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-[70vw] sm:max-w-md md:max-w-lg p-0 border-none shadow-2xl flex flex-col h-full bg-white rounded-none overflow-hidden focus:outline-none"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-50 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {studentName ? (
          <>
            <div className="flex-none bg-white px-6 py-1 border-b border-primary/20 z-10 relative shadow-sm h-16 flex items-center">
              <SheetHeader className="w-full">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-slate-100">
                    <AvatarImage src="/avatars/placeholder.png" className="object-cover" />
                    <AvatarFallback>{studentName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <SheetTitle className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                      {studentName}
                    </SheetTitle>
                    <div className="flex gap-1.5 mt-0.5">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-normal px-1.5 py-0 text-[10px] h-4">
                        {gradeClass}
                      </Badge>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-normal px-1.5 py-0 text-[10px] h-4">
                        探究学習
                      </Badge>
                    </div>
                  </div>
                </div>
              </SheetHeader>
            </div>

            <div className="flex-1 overflow-y-auto">

              <div className="px-6 pt-6 pb-2">
                <h3 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-2">
                  <span className="w-1 h-3 bg-primary rounded-full" />
                  非認知能力スコア
                </h3>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : chartData.length > 0 ? (
                  <div className="w-full flex justify-center">
                    <ChartContainer
                      config={chartConfig}
                      className="aspect-square w-full max-w-[280px]"
                    >
                      <RadarChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent />}
                        />
                        <PolarGrid
                          gridType="polygon"
                          className="stroke-slate-200"
                          strokeWidth={1}
                        />
                        <PolarAngleAxis
                          dataKey="subject"
                          tick={{ fill: 'hsl(var(--foreground))', fontSize: 11, fontWeight: '600' }}
                        />
                        <PolarRadiusAxis domain={[0, 5]} tickCount={6} tick={false} axisLine={false} />
                        <Radar
                          dataKey="score"
                          fill="var(--color-score)"
                          fillOpacity={0.3}
                          stroke="var(--color-score)"
                          strokeWidth={2.5}
                          dot={{ r: 3, fillOpacity: 1, strokeWidth: 0 }}
                        />
                      </RadarChart>
                    </ChartContainer>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    データがありません
                  </div>
                )}
              </div>

              <div className="px-6 pb-10 space-y-6">

                <section>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-purple-50 p-1 rounded-md">
                      <Bot className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm">AIによる活動サマリー</h3>
                  </div>
                  <div className="bg-slate-50 p-5 border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                    <p className="text-sm text-slate-700 leading-relaxed text-justify">
                      この機能はMVP Phase 2で実装予定です。投稿内容やフェーズの進み方をもとに、生徒の活動傾向や強み・改善点をAIが分析してサマリーを生成します。
                    </p>
                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex justify-end">
                      <span className="text-[10px] text-slate-400 font-medium">集計期間: 2025/04/01 - 現在</span>
                    </div>
                  </div>
                </section>

                <section className="space-y-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={onHistoryClick}
                    className="w-full justify-between h-12 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all group rounded-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 p-1.5 rounded-full group-hover:bg-white transition-colors">
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                      <div className="text-left">
                        <span className="block text-xs font-bold text-slate-700">行動ログをすべてみる</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                  </Button>

                  <Button variant="outline" className="w-full justify-between h-12 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all group rounded-none" disabled>
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 p-1.5 rounded-full group-hover:bg-white transition-colors">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                      <div className="text-left">
                        <span className="block text-xs font-bold text-slate-700">感謝の手紙をすべてみる</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200 text-[10px] font-normal rounded-sm">Coming Soon</Badge>
                  </Button>
                </section>

              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 bg-white">
            データがありません
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}