"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api/client";
import { clearAccessToken, setAccessToken } from "@/lib/auth/client";
import { fetchMe, MeUser } from "@/lib/session";

const roleLabel: Record<MeUser["role"], string> = {
  student: "生徒",
  teacher: "先生",
  admin: "管理者",
};

export default function MePage() {
  const router = useRouter();
  const [user, setUser] = useState<MeUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
  }, [router]);

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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">マイページ</h1>
            <p className="mt-1 text-sm text-slate-600">
              ログイン中の基本情報を表示しています。
            </p>
          </div>
          <div className="flex items-center gap-3">
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
              >
                管理者ページへ
              </Link>
            )}
            <Link
              href="/posts"
              className="rounded-md border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              投稿一覧へ
            </Link>
            <Link
              href="/thanks-letters"
              className="rounded-md border border-purple-600 bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
            >
              感謝の手紙へ
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              ログアウト
            </button>
          </div>
        </div>

        <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
          {loading && <p className="text-sm text-slate-600">読み込み中...</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {user && (
            <dl className="grid gap-4 sm:grid-cols-2">
              <Info label="氏名（漢字）" value={user.full_name} />
              <Info label="氏名（カナ）" value={user.full_name_kana ?? "—"} />
              <Info label="ロール" value={roleLabel[user.role]} />
              <Info label="学校内ID" value={user.school_person_id ?? "未設定"} />
              <Info label="メールアドレス" value={user.email} />
              <Info label="学年" value={user.grade ?? "—"} />
              <Info label="クラス" value={user.class_name ?? "—"} />
              <Info label="性別" value={user.gender} />
              <Info label="生年月日" value={user.date_of_birth ?? "—"} />
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-100 p-4">
      <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900">{value}</dd>
    </div>
  );
}
