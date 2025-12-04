"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { apiFetch } from "../../lib/api-client";
import { setAccessToken } from "../../lib/auth-client";

type TwoFAVerifyRequest = {
  code: string;
};

type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

export default function TwoFAVerifyPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 一時トークンの確認
    const tempToken = sessionStorage.getItem("temp_token");
    if (!tempToken) {
      router.push("/login");
    }
  }, [router]);

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!code || code.length !== 6) {
      setError("6桁のコードを入力してください。");
      return;
    }

    const tempToken = sessionStorage.getItem("temp_token");
    if (!tempToken) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      // デバッグ: 送信するコードを確認
      console.log("Sending code:", code, "Type:", typeof code, "Length:", code.length);
      
      const result = await apiFetch<TokenResponse>(
        "/api/2fa/verify-existing",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tempToken}`,
          },
          body: JSON.stringify({ code: code.trim() }),
        },
        null
      );

      // アクセストークンを保存
      setAccessToken(result.access_token);
      
      // 一時トークンを削除
      sessionStorage.removeItem("temp_token");
      sessionStorage.removeItem("is_2fa_enabled");
      
      // ダッシュボードへリダイレクト
      router.push("/me");
    } catch (err) {
      console.error("2FA verification error:", err);
      // エラーメッセージを詳細に表示
      const errorMessage = err instanceof Error ? err.message : "コードが正しくありません。もう一度お試しください。";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-2xl font-semibold text-slate-900">2要素認証</h1>
        <p className="mt-2 text-sm text-slate-600">
          認証アプリに表示されている6桁のコードを入力してください。
        </p>

        <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
          <form onSubmit={handleVerify}>
            <div>
              <label
                className="block text-sm font-medium text-slate-700"
                htmlFor="code"
              >
                認証コード（6桁）
              </label>
              <input
                type="text"
                id="code"
                name="code"
                value={code}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setCode(value);
                }}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="000000"
                maxLength={6}
                required
                autoFocus
              />
            </div>

            {error && (
              <p className="mt-3 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="mt-6 w-full rounded-md bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "検証中..." : "認証する"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}


