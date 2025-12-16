// ask-front-i/components/teacher/StudentDetailSheet.tsx

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
import { FileText, Mail, Bot, X, ArrowRight } from "lucide-react";
import { useMemo } from "react";

// Recharts
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts";
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

interface StudentAnalysisData {
  student_id: number;
  name: string;
  avatar_url: string;
  grade_class: string;
  seminar: string;
  summary: string;
  scores: Record<AbilityCode, number>;
}

interface StudentDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: number | null;
  studentName: string | null;
  onHistoryClick: () => void; // ★追加
}

const chartConfig = {
  score: {
    label: "能力値",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function StudentDetailSheet({ 
  isOpen, 
  onClose, 
  studentId, 
  studentName, 
  onHistoryClick 
}: StudentDetailSheetProps) {
  
  const mockAnalysisData: Record<string, StudentAnalysisData> = useMemo(() => ({
    "髙橋 由華": {
      student_id: 1,
      name: "髙橋 由華",
      avatar_url: "/avatars/01.jpg",
      grade_class: "2年4組",
      seminar: "メディアラボ",
      summary: "高い「課題設定能力」を発揮し、独自の視点から問いを深めています。特に今月はインタビュー調査を通じて「対話力」が大きく向上しました。一方で、アイデアを形にする「実行力」のフェーズで少し停滞が見られるため、スモールステップでの試作を促すと良いでしょう。",
      scores: {
        setting: 5, gathering: 4, involving: 3, communication: 5,
        humility: 4, execution: 2, completion: 3
      }
    },
    "江藤 泰平": {
      student_id: 2,
      name: "江藤 泰平",
      avatar_url: "/avatars/02.jpg",
      grade_class: "2年4組",
      seminar: "メディアラボ",
      summary: "チーム全体を「巻込力」が非常に高く、停滞していた議論を前に進めるリーダーシップが見られます。自身の意見だけでなく、他者の意見を尊重する「謙虚さ」も評価されており、クラスの心理的安全性に貢献しています。",
      scores: {
        setting: 3, gathering: 3, involving: 5, communication: 4,
        humility: 5, execution: 4, completion: 4
      }
    },
    "由井 理月": {
      student_id: 3,
      name: "由井 理月",
      avatar_url: "/avatars/04.jpg",
      grade_class: "2年4組",
      seminar: "メディアラボ",
      summary: "文献調査における「情報収集」能力が卓越しており、質の高い一次情報を確保できています。ただし、集めた情報を整理しきる前に次の調査へ移る傾向があり、「完遂力」に課題があります。アウトプットの期限を細かく設定する支援が有効です。",
      scores: {
        setting: 4, gathering: 5, involving: 2, communication: 3,
        humility: 3, execution: 3, completion: 2
      }
    },
    "伊藤 誠人": {
      student_id: 4,
      name: "伊藤 誠人",
      avatar_url: "/avatars/03.jpg",
      grade_class: "2年4組",
      seminar: "メディアラボ",
      summary: "「実行力」が高く、まずはやってみる姿勢が素晴らしいです。失敗を恐れずに挑戦できていますが、振り返りの時間が不足しており、同じミスを繰り返す傾向があります。「課題設定」の段階で仮説の精度を高めるようアドバイスが必要です。",
      scores: {
        setting: 2, gathering: 3, involving: 4, communication: 4,
        humility: 4, execution: 5, completion: 3
      }
    }
  }), []);

  const data = studentName ? mockAnalysisData[studentName] : null;

  const chartData = data ? [
    { subject: '課題設定', score: data.scores.setting },
    { subject: '情報収集', score: data.scores.gathering },
    { subject: '巻込力',   score: data.scores.involving },
    { subject: '対話力',   score: data.scores.communication },
    { subject: '謙虚さ',   score: data.scores.humility },
    { subject: '実行力',   score: data.scores.execution },
    { subject: '完遂力',   score: data.scores.completion },
  ] : [];

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

        {data ? (
          <>
            <div className="flex-none bg-white px-6 py-1 border-b border-primary/20 z-10 relative shadow-sm h-16 flex items-center">
              <SheetHeader className="w-full">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-slate-100">
                    <AvatarImage src={data.avatar_url} className="object-cover" />
                    <AvatarFallback>{data.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <SheetTitle className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                      {data.name}
                    </SheetTitle>
                    <div className="flex gap-1.5 mt-0.5">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-normal px-1.5 py-0 text-[10px] h-4">
                        {data.grade_class}
                      </Badge>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-normal px-1.5 py-0 text-[10px] h-4">
                        {data.seminar}
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
                      {data.summary}
                    </p>
                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex justify-end">
                      <span className="text-[10px] text-slate-400 font-medium">集計期間: 2025/04/01 - 現在</span>
                    </div>
                  </div>
                </section>

                <section className="space-y-2 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={onHistoryClick} // ★追加: クリックイベント
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