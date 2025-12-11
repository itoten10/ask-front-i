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
  HeartPulse, Palette, MapPin, Heart, Star, LayoutGrid 
} from "lucide-react";
import { useState } from "react";
import { FeatureInfoModal } from "@/components/student/FeatureInfoModal";

interface UserProfile {
  name: string;
  class: string;
  lab: string;
  avatarUrl: string;
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  userRole?: "student" | "teacher";
}

export function SidebarContent() {
  const [showFeatureInfo, setShowFeatureInfo] = useState(false);

  const studentData: UserProfile = {
    name: "髙橋 由華",
    class: "2年4組",
    lab: "メディアラボ",
    avatarUrl: "/avatars/01.jpg",
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
    { name: "メディカルラボ", icon: Heart, count: 1 },
    { name: "1 - 1 地域共創", icon: LayoutGrid, count: 7 },
    { name: "1 - 2 地域共創", icon: Star, count: 8 },
    { name: "生徒会執行部", icon: Users, count: 12 },
    { name: "図書委員会", icon: Users, count: 4 },
    { name: "放送委員会", icon: Users, count: 6 },
    { name: "保健委員会", icon: Users, count: 2 },
  ];

  // ホームボタンクリック時のハンドラ
  const handleHomeClick = () => {
    // page.tsx で設定したIDを持つ要素を取得
    const mainContainer = document.getElementById("student-main-scroll");
    if (mainContainer) {
      mainContainer.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

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

      <div className="flex flex-col h-full min-h-0 bg-white text-slate-900">
         {/* 1. ヘッダーロゴエリア */}
         <div className="px-6 pt-8 pb-4 shrink-0">
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-primary tracking-wider mb-1 opacity-90">
              下妻第一高校
            </h2>
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-primary fill-current opacity-80" />
              <h1 className="text-3xl font-black text-primary tracking-tight">
                カタリバ
              </h1>
            </div>
          </div>
        </div>

        {/* 2. ユーザープロフィールエリア */}
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
              
              <div className="flex justify-center items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm" />
                <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-sm" />
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm" />
                <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-sm" />
                
                <TooltipProvider>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <div className="ml-1 w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-slate-400 cursor-help hover:bg-slate-100 transition-colors">
                        ?
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[200px] text-xs bg-slate-800 text-white border-slate-700">
                      <p>投稿の「量（回数）」、「質（AI評価）」、「感謝の手紙（他者評価）」を合計して一定期間毎に算出してます</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="text-sm font-medium text-slate-500 leading-relaxed">
                <p>{studentData.class}</p>
                <p>{studentData.lab}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. メインナビゲーション */}
        <div className="px-4 mb-4 space-y-3 shrink-0">
          <Button 
            variant="outline" 
            onClick={handleHomeClick}
            className="w-full justify-start h-12 text-base font-bold border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg shadow-sm"
          >
            <Home className="mr-3 h-5 w-5" />
            ホーム
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-start h-10 text-sm font-medium text-slate-600 hover:bg-slate-50 px-4"
          >
            <Mail className="mr-3 h-5 w-5" />
            感謝の手紙を書く
            <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm">
              1
            </span>
          </Button>
        </div>

        <div className="px-6 shrink-0">
          <div className="h-px bg-slate-200 w-full my-2" />
        </div>

        {/* 4. クラス・ゼミリスト */}
        <div className="flex-1 min-h-0 flex flex-col">
          <h4 className="px-6 py-2 text-xs font-semibold text-slate-400 tracking-wider shrink-0">
            クラス・ゼミ
          </h4>
          
          <ScrollArea className="h-full px-4 pb-4">
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
        </div>
      </div>
    </>
  );
}

export function Sidebar({ className, userRole = "student" }: SidebarProps) {
  return (
    <div className={cn("w-[280px] bg-white border-r border-slate-200 h-full overflow-hidden", className)}>
      <SidebarContent />
    </div>
  );
}