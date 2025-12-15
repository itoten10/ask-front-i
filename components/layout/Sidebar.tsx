// ask-front-i/components/layout/Sidebar.tsx

"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Home, Mail, Users, FlaskConical, Globe, Cpu, Scale, 
  HeartPulse, Palette, MapPin, Heart, Star, LayoutGrid, Filter 
} from "lucide-react";
import { useState } from "react";
import { FeatureInfoModal } from "@/components/student/FeatureInfoModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import Image from "next/image";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  userRole?: "student" | "teacher";
  onNavigate?: (view: "home" | "thanks") => void;
  badgeCount?: number;
  userName?: string;
  userAvatar?: string;
  teacherFilters?: {
    class: string;
    phase: string;
    questionChange: string;
    order: string;
  };
  onFilterChange?: (key: string, value: string) => void;
  activeView?: string; 
}

interface SidebarContentProps {
  onNavigate?: (view: "home" | "thanks") => void;
  badgeCount?: number;
  userName?: string;
  userAvatar?: string;
  userRole?: "student" | "teacher";
  teacherFilters?: SidebarProps["teacherFilters"];
  onFilterChange?: SidebarProps["onFilterChange"];
  activeView?: string; 
}

export function SidebarContent({ 
  onNavigate, 
  badgeCount = 0, 
  userName, 
  userAvatar, 
  userRole = "student",
  teacherFilters,
  onFilterChange,
  activeView 
}: SidebarContentProps) {
  const [showFeatureInfo, setShowFeatureInfo] = useState(false);

  const studentData = {
    name: userName || "髙橋 由華",
    class: "2年4組",
    lab: "メディアラボ",
    avatarUrl: userAvatar || "/avatars/01.jpg",
  };

  const classes = [
    { name: "メディアラボ", icon: Users, count: 9 },
    { name: "サイエンスラボ", icon: FlaskConical, count: 5 },
    { name: "国際ゼミ", icon: Globe, count: 3 },
    { name: "工学ラボ", icon: Cpu, count: 2 },
    { name: "社会科学ゼミ", icon: Scale, count: 8 },
    { name: "フィジカルラボ", icon: HeartPulse, count: 4 },
    { name: "文化教育ゼミ", icon: Palette, count: 6 },
    { name: "地域ビジネスゼミ", icon: MapPin, count: 7 },
    { name: "1 - 1 地域共創", icon: LayoutGrid, count: 7 },
    { name: "1 - 2 地域共創", icon: Star, count: 8 },
    { name: "生徒会執行部", icon: Users, count: 12 },
    { name: "図書委員会", icon: Users, count: 4 },
    { name: "放送委員会", icon: Users, count: 6 },
    { name: "保健委員会", icon: Users, count: 2 },
  ];

  const handleHomeClick = () => {
    if (onNavigate) onNavigate("home");
    setTimeout(() => {
        const studentMain = document.getElementById("student-main-scroll");
        const teacherMain = document.getElementById("teacher-main-scroll");
        if (studentMain) studentMain.scrollTo({ top: 0, behavior: "smooth" });
        if (teacherMain) teacherMain.scrollTo({ top: 0, behavior: "smooth" });
    }, 10);
  };

  const handleThanksClick = () => {
    if (onNavigate) onNavigate("thanks");
  };

  const showFilters = userRole === "teacher" && activeView === "home";

  return (
    <>
      <FeatureInfoModal
        open={showFeatureInfo}
        onClose={() => setShowFeatureInfo(false)}
        title="機能のお知らせ"
        description={
          <>
            MVP内ではクラス・ゼミの絞り込み機能は<br />
            非表示ですが、フェーズ2以降で<br />
            <strong>各ゼミごとの活動履歴</strong>や<br />
            <strong>メンバー一覧</strong>が見られるようになります。
          </>
        }
      />

      <div className="flex flex-col h-screen min-h-0 bg-white text-slate-900">
         {/* ヘッダーロゴエリア */}
         <div className="px-6 pt-8 pb-4 shrink-0">
          <div className="flex flex-col">
            <h2 className="text-xs font-bold text-primary tracking-widest mb-1 opacity-80 ml-1">
              下妻第一高校
            </h2>
            <div className="flex items-center gap-1">
              <Image 
                src="/app-icon.svg" 
                alt="Logo" 
                width={56} 
                height={56} 
                className="w-8 h-8 object-contain opacity-90 shrink-0" 
              />
              <h1 className="text-3xl font-black text-primary tracking-tight leading-none">
                KATARIBA
              </h1>
            </div>
          </div>
        </div>

        {/* ユーザープロフィールエリア */}
        <div className="px-6 mb-6 shrink-0">
          <div className="flex flex-col items-center">
            <Avatar className="h-24 w-24 border-4 border-white shadow-sm mb-3">
              <AvatarImage src={studentData.avatarUrl} alt={studentData.name} className="object-cover" />
              <AvatarFallback className="text-3xl font-bold bg-slate-100 text-slate-400">
                {studentData.name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="text-center w-full">
              <h3 className="text-xl font-bold text-slate-900 tracking-wide mb-2">
                {studentData.name}
              </h3>
              
              {userRole === "student" && (
                <div className="flex justify-center items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-sm" />
                  <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-sm" />
                  <TooltipProvider>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <div className="ml-1 w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-slate-400 cursor-help hover:bg-slate-100 transition-colors">?</div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[200px] text-xs bg-slate-800 text-white border-slate-700">
                        <p>投稿の「量（回数）」、「質（AI評価）」、「感謝の手紙（他者評価）」を合計して一定期間毎に算出してます</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}

              <div className="text-sm font-medium text-slate-500 leading-relaxed">
                <p>{studentData.class}</p>
                {userRole === "teacher" ? (
                  <p>担当: {studentData.lab}</p>
                ) : (
                  <p>{studentData.lab}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* メインナビゲーション */}
        <div className="px-4 mb-4 space-y-3 shrink-0">
          <Button 
            variant="outline" 
            onClick={handleHomeClick}
            className="w-full justify-start h-12 text-base font-bold border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg shadow-sm"
          >
            <Home className="mr-3 h-5 w-5" />
            ホーム
          </Button>

          {userRole === "student" && (
            <Button 
              variant="ghost" 
              onClick={handleThanksClick}
              className={cn(
                "w-full justify-start h-12 text-base font-bold px-4 transition-all duration-300 group relative overflow-hidden",
                badgeCount > 0 
                  ? "text-slate-800 bg-yellow-50 border-2 border-yellow-400 hover:bg-yellow-100 hover:border-yellow-500 shadow-[0_0_15px_rgba(250,204,21,0.3)]" 
                  : "text-slate-600 hover:bg-slate-50 border-2 border-transparent"
              )}
            >
              <Mail className={cn(
                "mr-3 h-5 w-5 transition-colors",
                badgeCount > 0 ? "text-yellow-600 group-hover:text-yellow-700" : "opacity-70"
              )} />
              感謝の手紙を書く
              {badgeCount > 0 && (
                <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-sm animate-bounce">
                  {badgeCount}
                </span>
              )}
            </Button>
          )}
        </div>

        <div className="px-6 shrink-0">
          <div className="h-px bg-slate-200 w-full my-2" />
        </div>

        {/* 
          フィルター / リスト表示エリア
        */}
        <div className="flex-1 min-h-0 flex flex-col">
          {showFilters ? (
            // --- 先生用フィルター ---
            <ScrollArea className="flex-1 min-h-0 px-6 pb-6">
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <Filter className="w-4 h-4" />
                  <span className="text-xs font-bold tracking-wider">絞り込み条件</span>
                </div>

                {/* 1. ゼミ・クラス（選択肢更新） */}
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-xs font-bold text-slate-600 shrink-0">ゼミ・クラス</Label>
                  <Select 
                    value={teacherFilters?.class || "all"} 
                    onValueChange={(val) => onFilterChange?.("class", val)}
                  >
                    <SelectTrigger className="w-[140px] h-8 bg-slate-50 border-slate-200 text-xs">
                      <SelectValue placeholder="選択" />
                    </SelectTrigger>
                    {/* ★修正箇所: 選択肢を指定リストに更新 */}
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="media">メディアラボ</SelectItem>
                      <SelectItem value="science">サイエンスラボ</SelectItem>
                      <SelectItem value="international">国際ゼミ</SelectItem>
                      <SelectItem value="engineering">工学ラボ</SelectItem>
                      <SelectItem value="social">社会科学ゼミ</SelectItem>
                      <SelectItem value="physical">フィジカルラボ</SelectItem>
                      <SelectItem value="culture">文化教育ゼミ</SelectItem>
                      <SelectItem value="business">地域ビジネスゼミ</SelectItem>
                      <SelectItem value="region_1_1">1 - 1 地域共創</SelectItem>
                      <SelectItem value="region_1_2">1 - 2 地域共創</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 2. フェーズ */}
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-xs font-bold text-slate-600 shrink-0">フェーズ</Label>
                  <Select 
                    value={teacherFilters?.phase || "all"} 
                    onValueChange={(val) => onFilterChange?.("phase", val)}
                  >
                    <SelectTrigger className="w-[140px] h-8 bg-slate-50 border-slate-200 text-xs">
                      <SelectValue placeholder="選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="setting">課題設定</SelectItem>
                      <SelectItem value="gathering">情報収集</SelectItem>
                      <SelectItem value="analysis">整理・分析</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 3. 課題変更回数 */}
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-xs font-bold text-slate-600 shrink-0">課題変更</Label>
                  <Select 
                    value={teacherFilters?.questionChange || "all"} 
                    onValueChange={(val) => onFilterChange?.("questionChange", val)}
                  >
                    <SelectTrigger className="w-[140px] h-8 bg-slate-50 border-slate-200 text-xs">
                      <SelectValue placeholder="選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="0">0回</SelectItem>
                      <SelectItem value="1">1回以上</SelectItem>
                      <SelectItem value="3">3回以上</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 4. 投稿数 */}
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-xs font-bold text-slate-600 shrink-0">投稿数</Label>
                  <Select 
                    value={teacherFilters?.order || "all"} 
                    onValueChange={(val) => onFilterChange?.("order", val)}
                  >
                    <SelectTrigger className="w-[140px] h-8 bg-slate-50 border-slate-200 text-xs">
                      <SelectValue placeholder="選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="desc">多い順</SelectItem>
                      <SelectItem value="asc">少ない順</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="pt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs text-slate-500 hover:text-slate-800"
                    onClick={() => {
                        onFilterChange?.("class", "all");
                        onFilterChange?.("phase", "all");
                        onFilterChange?.("questionChange", "all");
                        onFilterChange?.("order", "all");
                    }}
                  >
                    条件をリセット
                  </Button>
                </div>
              </div>
            </ScrollArea>
          ) : (
            // --- クラスリスト表示 ---
            <>
              <h4 className="px-6 py-2 text-xs font-semibold text-slate-400 tracking-wider shrink-0">
                クラス・ゼミ
              </h4>
              <ScrollArea className="flex-1 min-h-0 px-4 pb-4">
                <div className="space-y-1 pb-4">
                  {classes.map((item, i) => (
                    <Button
                      key={i}
                      variant="ghost"
                      onClick={() => setShowFeatureInfo(true)}
                      className="w-full justify-start h-10 font-normal text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    >
                      <item.icon className="mr-3 h-4 w-4 opacity-70" />
                      <span className="flex-1 text-left truncate">{item.name}</span>
                      <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-[10px] font-bold text-sky-600">
                        {item.count}
                      </span>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export function Sidebar(props: SidebarProps) {
  return (
    <div className={cn("w-[280px] bg-white border-r border-slate-200 h-screen sticky top-0 overflow-hidden", props.className)}>
      <SidebarContent {...props} />
    </div>
  );
}