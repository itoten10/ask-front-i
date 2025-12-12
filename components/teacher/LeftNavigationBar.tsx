// components/teacher/LeftNavigationBar.tsx

"use client";

import { Home, MessageSquare, Mail, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { FeatureInfoModal } from "@/components/student/FeatureInfoModal";

// 左側固定ナビゲーションバー（先生専用）
// BACKEND_INTEGRATION: 将来的にはアクティブアイコンの状態をURLパラメータと同期させる

interface LeftNavigationBarProps {
  activeView: "home" | "message" | "letter" | "check";
  onNavigate: (view: "home" | "message" | "letter" | "check") => void;
  className?: string;
}

export function LeftNavigationBar({ activeView, onNavigate, className }: LeftNavigationBarProps) {
  const navItems = [
    { id: "home" as const, icon: Home, label: "ホーム", enabled: true },
    { id: "message" as const, icon: MessageSquare, label: "メッセージ", enabled: true },
    // NOTE(MOCK): 以下はMVP Phase2で提供予定。クリックで説明モーダルを開く
    { id: "letter" as const, icon: Mail, label: "感謝の手紙", enabled: false },
    { id: "check" as const, icon: CheckSquare, label: "みたよチェック", enabled: false },
  ];

  const [showInfo, setShowInfo] = useState(false);
  const [infoKey, setInfoKey] = useState<null | "letter" | "check">(null);

  const handleClick = (item: typeof navItems[0]) => {
    // メインコンテンツをトップへスクロール
    const mainEl = document.getElementById("teacher-main-scroll");
    if (mainEl) {
      try {
        mainEl.scrollTo({ top: 0, behavior: "smooth" });
      } catch (e) {
        mainEl.scrollTo(0, 0);
      }
    }

    if (item.enabled) return onNavigate(item.id);
    // 未実装アイテムは説明モーダルを開く
    setInfoKey(item.id as "letter" | "check");
    setShowInfo(true);
  };

  return (
    <>
      {/* PC用: 左固定縦並びナビゲーション (z-40) */}
      <div className={cn(
        "hidden lg:flex fixed left-0 top-0 h-screen w-16 bg-primary flex-col items-start py-6 z-40",
        className
      )}>
        <nav className="flex flex-col gap-4 w-full items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleClick(item)}
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all cursor-pointer bg-transparent hover:bg-transparent"
                aria-label={item.label}
                aria-pressed={isActive}
              >
                <span className={cn(
                  "rounded-full flex items-center justify-center",
                  isActive ? "p-2 bg-white" : "p-0"
                )}>
                  <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-white")} />
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile用: 下部固定横並びナビゲーション */}
      {/* z-index: 40 (モーダルの100より低く設定) */}
      <div className="flex lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-primary z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <nav className="flex flex-row justify-around items-center w-full px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleClick(item)}
                className="flex items-center justify-center w-16 h-16 cursor-pointer"
                aria-label={item.label}
                aria-pressed={isActive}
              >
                <Icon className={cn(
                  "w-7 h-7",
                  isActive ? "text-white" : "text-white/60"
                )} />
              </button>
            );
          })}
        </nav>
      </div>

      {/* 準備中アイテム用の説明モーダル */}
      <FeatureInfoModal
        open={showInfo}
        onClose={() => {
          setShowInfo(false);
          setInfoKey(null);
        }}
        title="機能のお知らせ"
        description={
          infoKey === "letter" ? (
            <>
              「感謝の手紙」の機能は、生徒同士でのメッセージを促進する機能です。フェーズ2での実装を予定しています。
            </>
          ) : (
            <>
              教師が未確認の生徒の投稿を確認するサポートする機能です。フェーズ2での実装を予定しています。
            </>
          )
        }
      />
    </>
  );
}