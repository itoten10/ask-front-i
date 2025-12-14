// ask-front-i/app/teacher/page.tsx

"use client";

import { useState, useRef, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { LeftNavigationBar } from "@/components/teacher/LeftNavigationBar";
import { TeacherHomeView } from "@/components/teacher/TeacherHomeView";
import { TeacherMessageView } from "@/components/teacher/TeacherMessageView";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const MOCK_TEACHER = {
  id: "T001",
  name: "濵田 理事長",
  role: "teacher" as const,
  avatar: "/avatars/05.jpg",
  class: "2年4組",
  subject: "メディアラボ",
};

export default function TeacherPage() {
  const [activeView, setActiveView] = useState<"home" | "message" | "letter" | "check">("home");
  const [isLeftNavOpen, setIsLeftNavOpen] = useState(false);
  
  // ★リセット用キー (ホーム画面を強制再レンダリングするため)
  const [homeViewKey, setHomeViewKey] = useState(0);

  const [filters, setFilters] = useState({
    class: "all",
    phase: "all",
    questionChange: "all",
    order: "all",
  });

  const [showScrollTop, setShowScrollTop] = useState(false);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleFilterReset = () => {
    setFilters({
      class: "all",
      phase: "all",
      questionChange: "all",
      order: "all",
    });
  };

  // ★修正: ナビゲーションハンドラ
  const handleNavigate = useCallback((view: "home" | "message" | "letter" | "check") => {
    if (view === "home") {
      // 既にホームにいる場合でも、キーを更新して強制的に初期画面（表）に戻す
      // これにより、詳細履歴画面から表画面へ戻ることができる
      setHomeViewKey(prev => prev + 1);
    }
    setActiveView(view);
    setIsLeftNavOpen(false);
    setShowScrollTop(false);
  }, []);

  const handleMessageScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop > 300) {
      setShowScrollTop(true);
    } else {
      setShowScrollTop(false);
    }
  };

  const scrollToTop = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="flex h-screen bg-background w-full overflow-hidden">
      
      <LeftNavigationBar 
        activeView={activeView} 
        onNavigate={handleNavigate} 
      />
      
      <div className="hidden lg:block lg:ml-16 shrink-0 h-full">
        <Sidebar 
          userRole="teacher" 
          userName={MOCK_TEACHER.name}
          userAvatar={MOCK_TEACHER.avatar}
          teacherFilters={filters}
          onFilterChange={handleFilterChange}
          activeView={activeView}
          // ★修正: 型不整合を防ぐために as any でキャスト
          // Sidebarは student 用の型定義を持っているため、teacher用の関数を渡すとエラーになる
          onNavigate={(v) => handleNavigate(v as any)}
        />
      </div>
      
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        <Header 
          userName={MOCK_TEACHER.name}
          userAvatar={MOCK_TEACHER.avatar}
          userRole="teacher"
          activeView={activeView}
          teacherFilters={filters}
          onFilterChange={handleFilterChange}
          // ★修正: こちらも同様に as any でキャスト
          onNavigate={(v) => handleNavigate(v as any)}
        />

        <main className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
          <div className="flex-1 flex flex-col h-full w-full p-4 lg:p-6 pb-20 lg:pb-6 max-w-[1800px] mx-auto relative">
            
            {activeView === "home" && (
              <TeacherHomeView 
                key={homeViewKey} // ★重要: キー変更でリセット
                filters={filters} 
                onFilterReset={handleFilterReset}
              />
            )}
            
            {activeView === "message" && (
              <div 
                ref={messageContainerRef}
                onScroll={handleMessageScroll}
                className="h-full overflow-y-auto overflow-x-hidden pr-2 scroll-smooth"
              >
                 <TeacherMessageView />
              </div>
            )}
            
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

            {activeView === "message" && (
              <div className={`fixed right-6 bottom-24 lg:bottom-6 z-50 transition-all duration-300 ${showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}`}>
                <Button 
                  onClick={scrollToTop} 
                  className="rounded-full w-12 h-12 bg-primary text-white shadow-lg hover:bg-primary/90 hover:scale-110 transition-all" 
                  size="icon"
                >
                  <ArrowUp className="w-6 h-6" />
                </Button>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}