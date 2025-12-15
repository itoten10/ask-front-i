// ask-front/app/teacher-dashboard/page.tsx
// 認証済み教師用ダッシュボード（DB接続版）

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { LeftNavigationBar } from "@/components/teacher/LeftNavigationBar";
import { AuthTeacherHomeView } from "@/components/teacher/AuthTeacherHomeView";
import { TeacherMessageView } from "@/components/teacher/TeacherMessageView";
import { ArrowUp, Loader2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ensureAccessToken, fetchMe, MeUser } from "@/app/lib/session";

export default function TeacherDashboardPage() {
  const router = useRouter();

  // ユーザー情報
  const [user, setUser] = useState<MeUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

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

  // ユーザー情報の取得
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await ensureAccessToken();
        if (!token) {
          router.push("/login");
          return;
        }
        setAccessToken(token);

        const userData = await fetchMe();
        setUser(userData);

        // 教師・管理者以外はリダイレクト
        if (userData.role === "student") {
          router.push("/student-dashboard");
          return;
        }
      } catch (error) {
        console.error("ユーザー情報の取得に失敗:", error);
        router.push("/login");
      } finally {
        setIsLoadingUser(false);
      }
    };

    loadUser();
  }, [router]);

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

  // ローディング中
  if (isLoadingUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-slate-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  // ユーザー情報がない場合
  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background w-full overflow-hidden">

      <LeftNavigationBar
        activeView={activeView}
        onNavigate={handleNavigate}
      />

      <div className="hidden lg:block lg:ml-16 shrink-0 h-full">
        <Sidebar
          userRole="teacher"
          userName={user.full_name}
          userAvatar={user.avatar_url || undefined}
          userGrade={user.grade?.toString() ?? null}
          userClass={user.class_name}
          teacherFilters={filters}
          onFilterChange={handleFilterChange}
          activeView={activeView}
          onNavigate={(v) => handleNavigate(v as any)}
        />
      </div>

      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        <Header
          userName={user.full_name}
          userAvatar={user.avatar_url || undefined}
          userRole="teacher"
          activeView={activeView}
          teacherFilters={filters}
          onFilterChange={handleFilterChange}
          onNavigate={(v) => handleNavigate(v as any)}
        />

        {/* ユーザー情報バー */}
        <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-3 flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
              <AvatarImage src={user.avatar_url || "/avatars/placeholder.png"} alt={user.full_name} className="object-cover" />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">{user.full_name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold text-slate-900">{user.full_name}</p>
              <p className="text-xs text-slate-500">
                {user.role === "admin" ? "管理者" : "教師"}
              </p>
            </div>
          </div>
        </div>

        <main className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
          <div className="flex-1 flex flex-col h-full w-full p-4 lg:p-6 pb-20 lg:pb-6 max-w-[1800px] mx-auto relative">

            {activeView === "home" && (
              <AuthTeacherHomeView
                key={homeViewKey}
                accessToken={accessToken}
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
                 <TeacherMessageView accessToken={accessToken} />
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
