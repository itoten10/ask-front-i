// ask-front-i/app/teacher/page.tsx

"use client";

import { useState, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { LeftNavigationBar } from "@/components/teacher/LeftNavigationBar";
import { TeacherHomeView } from "@/components/teacher/TeacherHomeView";
import { TeacherMessageView } from "@/components/teacher/TeacherMessageView";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

// BACKEND_INTEGRATION: 将来的にはAPIから先生情報を取得
// API_CONTRACT: GET /api/teacher/me
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

  // フィルターの状態
  const [filters, setFilters] = useState({
    class: "all",
    phase: "all",
    questionChange: "all",
    order: "all",
  });

  // スクロールトップボタン制御用
  const [showScrollTop, setShowScrollTop] = useState(false);
  const mainScrollRef = useRef<HTMLDivElement>(null);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // スクロールイベントハンドラ
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop > 300) {
      setShowScrollTop(true);
    } else {
      setShowScrollTop(false);
    }
  };

  // トップへ戻る関数
  const scrollToTop = () => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="flex h-screen bg-background w-full overflow-hidden">
      
      <LeftNavigationBar 
        activeView={activeView} 
        onNavigate={(view) => {
          setActiveView(view);
          setIsLeftNavOpen(false);
        }}
      />
      
      <div className="hidden lg:block lg:ml-16 shrink-0 h-full">
        <Sidebar 
          userRole="teacher" 
          userName={MOCK_TEACHER.name}
          userAvatar={MOCK_TEACHER.avatar}
          teacherFilters={filters}
          onFilterChange={handleFilterChange}
          activeView={activeView} 
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
        />

        <main 
          id="teacher-main-scroll" 
          ref={mainScrollRef}
          onScroll={handleScroll}
          className="flex-1 p-4 lg:p-8 overflow-y-auto scroll-smooth"
        >
          <div className="max-w-[1800px] mx-auto pb-20 lg:pb-0">
            {activeView === "home" && (
              <TeacherHomeView filters={filters} />
            )}
            
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

        {/* ★追加: トップへ戻るボタン */}
        {/* Mobile: bottom-24 (下部ナビ回避), PC: bottom-6 */}
        <div className={`fixed right-6 z-50 transition-all duration-300 ${showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"} bottom-24 lg:bottom-6`}>
          <Button 
            onClick={scrollToTop} 
            className="rounded-full w-12 h-12 bg-primary text-white shadow-lg hover:bg-primary/90 hover:scale-110 transition-all" 
            size="icon"
          >
            <ArrowUp className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}