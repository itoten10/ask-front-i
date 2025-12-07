"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";

import { apiFetch } from "../../lib/api-client";
import { setAccessToken } from "../../lib/auth-client";

type TwoFASetupResponse = {
  secret: string;
  otpauth_url: string;
};

type TwoFAVerifyRequest = {
  code: string;
};

type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

export default function TwoFASetupPage() {
  const router = useRouter();
  const [qrData, setQrData] = useState<TwoFASetupResponse | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [setupLoading, setSetupLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const setup2FA = async () => {
      const tempToken = sessionStorage.getItem("temp_token");
      if (!tempToken) {
        router.push("/login");
        return;
      }

      try {
        const data = await apiFetch<TwoFASetupResponse>(
          "/api/2fa/setup",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${tempToken}`,
            },
          },
          null
        );
        // デバッグ: 取得したデータを確認
        console.log("2FA setup data:", data);
        console.log("otpauth_url:", data.otpauth_url);
        console.log("secret:", data.secret);
        setQrData(data);
      } catch (err) {
        console.error("2FA setup error:", err);
        setError("2FA設定情報の取得に失敗しました。");
      } finally {
        setSetupLoading(false);
      }
    };

    setup2FA();
  }, [router]);

  useEffect(() => {
    if (qrData?.otpauth_url && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, qrData.otpauth_url, {
        width: 256,
        margin: 2,
      });
    }
  }, [qrData]);

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
        "/api/2fa/verify",
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

  if (setupLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">読み込み中...</p>
      </div>
    );
  }

  if (!qrData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">エラーが発生しました。</p>
          <button
            onClick={() => router.push("/login")}
            className="mt-4 text-blue-600 hover:underline"
          >
            ログインページに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-2xl font-semibold text-slate-900">2要素認証の設定</h1>
        <p className="mt-2 text-sm text-slate-600">
          Google Authenticatorなどの認証アプリでQRコードをスキャンしてください。
        </p>

        <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center">
            {qrData.otpauth_url ? (
              <canvas ref={canvasRef} />
            ) : (
              <div className="w-64 h-64 bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">QRコードを読み込み中...</p>
              </div>
            )}
            <p className="mt-4 text-sm text-slate-600">
              または、以下のシークレットキーを手動で入力してください：
            </p>
            <code className="mt-2 rounded bg-slate-100 px-3 py-2 text-sm font-mono">
              {qrData.secret}
            </code>
          </div>

          <form onSubmit={handleVerify} className="mt-8">
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
              {loading ? "検証中..." : "設定を完了する"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

