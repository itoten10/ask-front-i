"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MvpMenuButton } from "@/components/common/MvpMenuButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, ExternalLink, ChevronRight, Settings, Loader2 } from "lucide-react";

import { apiFetch } from "@/app/lib/api-client";
import { clearAccessToken, setAccessToken } from "@/app/lib/auth-client";
import { fetchMe, MeUser } from "@/app/lib/session";

const roleLabel: Record<MeUser["role"], string> = {
  student: "生徒",
  teacher: "先生",
  admin: "管理者",
};

function MePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<MeUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // ?stay=true パラメータがある場合はこのページに留まる
  const shouldStay = searchParams.get("stay") === "true";

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        // NextAuthのセッションからaccess_tokenを取得してexchange-tokenを試みる
        try {
          const sessionResponse = await fetch("/api/auth/session");
          if (sessionResponse.ok) {
            const session = await sessionResponse.json();
            const accessToken = (session as any)?.access_token;

            if (accessToken && !localStorage.getItem("access_token")) {
              console.log("Found access_token in session, storing and exchanging for refresh_token");
              setAccessToken(accessToken);

              // exchange-tokenを呼び出してrefresh_tokenクッキーを設定
              const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8000";
              const exchangeResponse = await fetch(`${API_ENDPOINT}/api/auth/exchange-token`, {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${accessToken}`,
                },
                credentials: "include",
              });

              if (exchangeResponse.ok) {
                const exchangeData = await exchangeResponse.json();
                if (exchangeData.access_token) {
                  setAccessToken(exchangeData.access_token);
                }
                console.log("Successfully set refresh_token cookie");
              }
            }
          }
        } catch (sessionErr) {
          console.error("Session check error:", sessionErr);
        }

        const me = await fetchMe();
        setUser(me);

        // ログイン後の自動リダイレクト（?stay=true でない場合）
        if (!shouldStay) {
          setIsRedirecting(true);
          if (me.role === "student") {
            router.replace("/student-dashboard");
            return;
          } else if (me.role === "teacher") {
            router.replace("/teacher-dashboard");
            return;
          } else if (me.role === "admin") {
            // 管理者は教師ダッシュボードへ（または管理者ページへ）
            router.replace("/teacher-dashboard");
            return;
          }
        }
      } catch (err) {
        console.error(err);
        setError("情報の取得に失敗しました。再度ログインしてください。");
        clearAccessToken();
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [router, shouldStay]);

  const handleLogout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" }, null);
    } catch (err) {
      console.error(err);
    } finally {
      clearAccessToken();
      router.replace("/login");
    }
  };

  // ダッシュボードリンク先を決定
  const getDashboardHref = () => {
    if (user?.role === "student") return "/student-dashboard";
    if (user?.role === "teacher") return "/teacher-dashboard";
    if (user?.role === "admin") return "/teacher-dashboard";
    return "/";
  };

  // リダイレクト中またはローディング中はローディング画面を表示
  if (isRedirecting || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-slate-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-900">マイページ</h1>
          <div className="flex items-center gap-2 sm:gap-3">
            <MvpMenuButton />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">ログアウト</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-32">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {user && (
          <div className="space-y-6">
            {/* プロフィールカード */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {/* 上部の装飾ライン */}
              <div className="h-2 bg-gradient-to-r from-primary via-purple-400 to-primary/60" />

              <div className="p-6 sm:p-8">
                {/* アバター＆名前 */}
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                  <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-white shadow-lg ring-2 ring-slate-100">
                    <AvatarImage
                      src={user.avatar_url || "/avatars/placeholder.png"}
                      alt={user.full_name}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
                      {user.full_name[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="text-center sm:text-left flex-1">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
                      {user.full_name}
                    </h2>
                    <p className="text-slate-500 mb-3">
                      {user.full_name_kana || ""}
                    </p>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {roleLabel[user.role]}
                      </span>
                      {user.grade && user.class_name && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          {user.grade}年{user.class_name}組
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ダッシュボードへボタン */}
                  <Link href={getDashboardHref()} className="shrink-0">
                    <Button className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-sm">
                      ダッシュボードへ
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* 基本情報 */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                基本情報
              </h3>
              <dl className="grid gap-4 sm:grid-cols-2">
                <Info label="メールアドレス" value={user.email} />
                <Info label="学校内ID" value={user.school_person_id ?? "未設定"} />
                <Info label="学年" value={user.grade ? `${user.grade}年` : "—"} />
                <Info label="クラス" value={user.class_name ? `${user.class_name}組` : "—"} />
                <Info label="性別" value={user.gender === "male" ? "男性" : user.gender === "female" ? "女性" : user.gender} />
                <Info label="生年月日" value={user.date_of_birth ?? "—"} />
              </dl>
            </div>

            {/* 開発用メニュー（下部に配置） */}
            <div className="bg-slate-100/50 rounded-2xl border border-slate-200/60 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="h-4 w-4 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                  開発用メニュー
                </h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {/* 生徒用 */}
                {(user.role === "student" || user.role === "admin") && (
                  <Link href="/student-dashboard">
                    <Button variant="outline" className="w-full justify-start gap-2 h-11 bg-white hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700">
                      <ExternalLink className="h-4 w-4" />
                      生徒ダッシュボード
                    </Button>
                  </Link>
                )}
                {/* 教師用 */}
                {(user.role === "teacher" || user.role === "admin") && (
                  <Link href="/teacher-dashboard">
                    <Button variant="outline" className="w-full justify-start gap-2 h-11 bg-white hover:bg-green-50 hover:border-green-200 hover:text-green-700">
                      <ExternalLink className="h-4 w-4" />
                      教師ダッシュボード
                    </Button>
                  </Link>
                )}
                {/* 管理者用 */}
                {user.role === "admin" && (
                  <Link href="/admin">
                    <Button variant="outline" className="w-full justify-start gap-2 h-11 bg-white hover:bg-slate-100">
                      <ExternalLink className="h-4 w-4" />
                      管理者ページ
                    </Button>
                  </Link>
                )}
                {/* 共通 */}
                <Link href="/posts">
                  <Button variant="outline" className="w-full justify-start gap-2 h-11 bg-white hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700">
                    <ExternalLink className="h-4 w-4" />
                    投稿一覧
                  </Button>
                </Link>
                <Link href="/thanks-letters">
                  <Button variant="outline" className="w-full justify-start gap-2 h-11 bg-white hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700">
                    <ExternalLink className="h-4 w-4" />
                    感謝の手紙
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-slate-50/80 border border-slate-100 p-4">
      <dt className="text-xs font-medium text-slate-400 mb-1">{label}</dt>
      <dd className="text-sm font-medium text-slate-900">{value}</dd>
    </div>
  );
}

export default function MePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="flex flex-col items-center gap-4"><Loader2 className="h-10 w-10 animate-spin text-primary" /><p className="text-sm text-slate-500">読み込み中...</p></div></div>}>
      <MePageContent />
    </Suspense>
  );
}
