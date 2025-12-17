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
  summary: string; // 既存の短いサマリー (非認知能力ビュー用)
  processSummary: string; // ★新規: 探究プロセスとしてのサマリー (進捗ビュー用)
  scores: Record<AbilityCode, number>;
}

interface StudentDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: number | null;
  studentName: string | null;
  onHistoryClick: () => void;
  activeTab?: string; // ★追加: どのタブから開かれたかを判別する
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
  onHistoryClick,
  activeTab = "progress" // デフォルト
}: StudentDetailSheetProps) {
  
  const mockAnalysisData: Record<string, StudentAnalysisData> = useMemo(() => ({
    "髙橋 由華": {
      student_id: 1,
      name: "髙橋 由華",
      avatar_url: "/avatars/01.jpg",
      grade_class: "2年4組",
      seminar: "メディアラボ",
      summary: "高い「課題設定能力」を発揮し、独自の視点から問いを深めています。特に今月はインタビュー調査を通じて「対話力」が大きく向上しました。一方で、アイデアを形にする「実行力」のフェーズで少し停滞が見られるため、スモールステップでの試作を促すと良いでしょう。",
      processSummary: `初期段階では「ストレスと運動」という広いテーマに関心を持っていましたが、文献調査を通じて「短時間の有酸素運動とメンタルヘルスの相関」へと問いを具体化させるプロセスが非常にスムーズでした。

特に11月に行われた運動部の顧問へのインタビュー調査では、当初の仮説とは異なる現場の実情に触れ、一度立ち止まって問いを見直す柔軟性が見られました。これは探究学習において重要な「アンラーニング（学びほぐし）」のプロセスを体現しています。

現在は実験計画の策定フェーズですが、協力者の確保にやや苦戦しており、実行段階で足踏みしている印象です。完璧なデータを求めすぎず、まずはスモールスタートで予備実験を行うようアドバイスすることで、停滞を打破できるでしょう。`,
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
      processSummary: `「心理的安全性」をテーマにしたグループワークにおいて、当初はメンバー間の意見対立をまとめることに苦労していましたが、ファシリテーションの手法を自ら学び、実践することでチームの雰囲気を劇的に改善させました。

特筆すべきは、自分自身が「失敗談」を率先して共有することで、他のメンバーが発言しやすい空気を作った点です。この行動は、単なる司会進行役を超えた、サーバントリーダーシップの発揮と言えます。

現在はプロジェクトの中盤に差し掛かり、具体的な成果物のアウトプットが求められる段階です。議論を拡散させる力は十分にあるため、今後は収束させ、形にする「完遂力」を意識したタイムマネジメントへの支援が鍵となります。`,
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
      processSummary: `地域情報のアーカイブ化というテーマに対し、図書館での文献調査だけでなく、実際に古地図を持ってフィールドワークを行うなど、極めて質の高い一次情報の収集を行っています。情報の「深さ」を追求する姿勢は研究者顔負けです。

一方で、集めた情報量が膨大になりすぎてしまい、整理・分析のフェーズで情報の海に溺れかけている様子が見受けられます。「あれもこれも」と網羅性を求めすぎるあまり、本質的な問いの検証がおろそかになりがちです。

プロセスとしては「発散」から「収束」への切り替えが必要です。「まずはこの地区に絞って公開する」といった具体的なマイルストーンを設定し、不完全でも一度形にして世に出す経験を積ませることが、次の成長につながるでしょう。`,
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
      processSummary: `廃棄野菜の活用というテーマに対し、机上の空論で終わらせず、すぐに試作品作りや農家への訪問を行うバイタリティは圧倒的です。「まずはやってみる」というプロトタイピングのサイクルを高速で回しており、行動量はクラス随一です。

しかし、行動先行型であるがゆえに、「なぜうまくいかなかったのか」という省察（リフレクション）のプロセスが浅くなりがちです。失敗から学びを得て次の仮説に活かすサイクルが弱いため、同じような試行錯誤を繰り返してしまう場面も見られます。

今後は、行動の後に必ず「振り返りシート」を記入させるなど、意図的に立ち止まる時間を設けることが有効です。思考と言語化のプロセスを強化することで、持ち前の行動力がより成果に結びつくようになるでしょう。`,
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

  // ★分岐ロジック: 表示モードの判定
  const isProgressMode = activeTab === "progress";
  const summaryTitle = isProgressMode ? "探究活動プロセスのとしての活動サマリー" : "AIによる活動サマリー";
  const summaryText = isProgressMode && data ? data.processSummary : (data ? data.summary : "");

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
                {/* ★条件分岐: 非認知能力タブの時のみレーダーチャートを表示 */}
                {!isProgressMode && (
                  <>
                    <h3 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-2">
                      <span className="w-1 h-3 bg-primary rounded-full" />
                      非認知能力スコア
                    </h3>
                    <div className="w-full flex justify-center mb-6">
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
                  </>
                )}
                
                {/* サマリーセクション (タイトルとテキストはモードによって変化) */}
                <section className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-purple-50 p-1 rounded-md">
                      <Bot className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm">{summaryTitle}</h3>
                  </div>
                  <div className="bg-slate-50 p-5 border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                    <p className="text-sm text-slate-700 leading-relaxed text-justify whitespace-pre-wrap">
                      {summaryText}
                    </p>
                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex justify-end">
                      <span className="text-[10px] text-slate-400 font-medium">集計期間: 2025/04/01 - 現在</span>
                    </div>
                  </div>
                </section>

                <section className="space-y-2 pt-2 pb-10">
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