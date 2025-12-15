// components/layout/Header.tsx

"use client";

import { Menu, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SidebarContent } from "@/components/layout/Sidebar";
import { useState } from "react";
import { MvpMenuButton } from "@/components/common/MvpMenuButton";
// ★追加: モーダルコンポーネントをインポート
import { FeatureInfoModal } from "@/components/student/FeatureInfoModal";

interface HeaderProps {
  onNavigate?: (view: "home" | "thanks") => void;
  badgeCount?: number;
  userName?: string;
  userAvatar?: string;
  userRole?: "student" | "teacher";
  activeView?: string;
  teacherFilters?: {
    class: string;
    phase: string;
    questionChange: string; 
    order: string;
  };
  onFilterChange?: (key: string, value: string) => void;
}

export function Header({ 
  onNavigate, 
  badgeCount = 0, 
  userName, 
  userAvatar, 
  userRole = "student",
  activeView,
  teacherFilters,
  onFilterChange
}: HeaderProps) {
  const [open, setOpen] = useState(false);
  
  // ★追加: 各機能のモーダル表示状態
  const [showNotifInfo, setShowNotifInfo] = useState(false);
  const [showSearchInfo, setShowSearchInfo] = useState(false);

  return (
    <>
      {/* ★追加: 通知機能のお知らせモーダル */}
      <FeatureInfoModal
        open={showNotifInfo}
        onClose={() => setShowNotifInfo(false)}
        title="通知機能"
        description={
          <>
            現在、新着通知機能は準備中です。<br />
            フェーズ2以降で、<strong>自分へのコメント</strong>や<br />
            <strong>先生からのフィードバック</strong>がここに届く予定です。
          </>
        }
      />

      {/* ★追加: 検索機能のお知らせモーダル */}
      <FeatureInfoModal
        open={showSearchInfo}
        onClose={() => setShowSearchInfo(false)}
        title="検索機能"
        description={
          <>
            キーワード検索機能は準備中です。<br />
            フェーズ2以降で、<strong>過去の投稿</strong>や<br />
            <strong>他のクラスの探究事例</strong>を検索できるようになります。
          </>
        }
      />

      <header className="h-16 border-b border-slate-200 bg-primary text-white flex items-center px-4 justify-between shrink-0 z-30 sticky top-0 shadow-sm">
        <div className="flex items-center gap-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-white/10 -ml-2">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px]">
              <SheetHeader>
                <SheetTitle className="sr-only">メニュー</SheetTitle>
              </SheetHeader>

              <SidebarContent 
                onNavigate={(view) => {
                  if (onNavigate) onNavigate(view);
                  setOpen(false);
                }}
                badgeCount={badgeCount}
                userName={userName}
                userAvatar={userAvatar}
                userRole={userRole}
                activeView={activeView}
                teacherFilters={teacherFilters}
                onFilterChange={onFilterChange}
              />
            </SheetContent>
          </Sheet>

          <div className="flex flex-col">
            <h2 className="text-[10px] font-medium opacity-80 leading-tight">下妻第一高校</h2>
            <h1 className="text-xl font-bold leading-tight">KATARIBA</h1>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-4 hidden md:block">
          {/* ★修正: 検索エリア全体をクリック可能にしてモーダルを表示 */}
          <div className="relative cursor-pointer" onClick={() => setShowSearchInfo(true)}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
            <Input 
              placeholder="検索" 
              readOnly // 入力を防ぐ
              className="pl-9 bg-white/10 border-none text-white placeholder:text-white/60 h-9 focus-visible:ring-1 focus-visible:ring-white/30 cursor-pointer" 
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <MvpMenuButton />

          {/* ★修正: ベルボタンクリックでモーダル表示 */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowNotifInfo(true)}
            className="text-white hover:bg-white/10 relative"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-primary" />
          </Button>
        </div>
      </header>
    </>
  );
}