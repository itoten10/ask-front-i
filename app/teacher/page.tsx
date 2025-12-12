// app/teacher/page.tsx

"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { LeftNavigationBar } from "@/components/teacher/LeftNavigationBar";
import { TeacherHomeView } from "@/components/teacher/TeacherHomeView";
import { TeacherMessageView } from "@/components/teacher/TeacherMessageView";

// BACKEND_INTEGRATION: 将来的にはAPIから先生情報を取得
// API_CONTRACT: GET /api/teacher/me
// NOTE(MOCK): MVP用のハードコーディング
const MOCK_TEACHER = {
  id: "T001",
  name: "濵田隼斗",
  role: "teacher" as const,
  avatar: "/avatars/05.jpg",
  class: "2年4組",
  subject: "メディアラボ",
};

export default function TeacherPage() {
  // 左ナビゲーションの状態管理
  const [activeView, setActiveView] = useState<"home" | "message" | "letter" | "check">("home");
  // レスポンシブ用のモバイルメニュー開閉状態
  const [isLeftNavOpen, setIsLeftNavOpen] = useState(false);

  return (
    // ★修正箇所: min-h-screen ではなく h-screen に変更してください！
    // これで「画面全体のスクロール」がなくなり、サイドバーが固定されます。
    <div className="flex h-screen bg-background w-full overflow-hidden">
      
      {/* 左固定ナビゲーションバー */}
      <LeftNavigationBar 
        activeView={activeView} 
        onNavigate={(view) => {
          setActiveView(view);
          setIsLeftNavOpen(false);
        }}
      />
      
      {/* サイドバー（PCのみ表示） */}
      <div className="hidden lg:block lg:ml-16 shrink-0 h-full">
        <Sidebar 
          userRole="teacher" 
          userName={MOCK_TEACHER.name}
          userAvatar={MOCK_TEACHER.avatar}
        />
      </div>
      
      {/* メインコンテンツエリア */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        <Header 
          userName={MOCK_TEACHER.name}
          userAvatar={MOCK_TEACHER.avatar}
          userRole="teacher"
        />

        {/* 
          ここがスクロール領域になります (overflow-y-auto)
          親が h-screen で固定されているため、ここだけが独立してスクロールします
        */}
        <main id="teacher-main-scroll" className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto pb-20 lg:pb-0">
            {activeView === "home" && <TeacherHomeView />}
            {activeView === "message" && <TeacherMessageView />}
            {activeView === "letter" && (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">感謝の手紙</h2>
                <p className="text-slate-500">この機能は準備中です（MVP Phase 2で実装予定）</p>
              </div>
            )}
            {activeView === "check" && (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">投稿チェック</h2>
                <p className="text-slate-500">この機能は準備中です（MVP Phase 2で実装予定）</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}