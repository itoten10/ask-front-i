"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // 認証後の2FA状態をチェックして適切なページにリダイレクト
    const check2FAAndRedirect = async () => {
      try {
        const sessionResponse = await fetch("/api/auth/session");
        if (sessionResponse.ok) {
          const session = await sessionResponse.json();
          const tempToken = (session as any)?.temp_token;
          const is2FAEnabled = (session as any)?.is_2fa_enabled;
          
          // デバッグ: セッション情報を確認
          console.log("Auth callback - session:", session);
          console.log("Auth callback - tempToken:", tempToken);
          console.log("Auth callback - is2FAEnabled:", is2FAEnabled, "Type:", typeof is2FAEnabled);
          
          if (tempToken) {
            // sessionStorageにも保存（2FAページで使用するため）
            sessionStorage.setItem("temp_token", tempToken);
            sessionStorage.setItem("is_2fa_enabled", String(is2FAEnabled));
            if ((session as any)?.user_id) {
              sessionStorage.setItem("user_id", String((session as any).user_id));
            }
            
            // 2FA設定状態に応じてリダイレクト
            // is2FAEnabledがfalse（未設定）の場合はsetup、true（設定済み）の場合はverify
            if (is2FAEnabled === false || is2FAEnabled === "false") {
              console.log("Redirecting to /2fa/setup");
              router.replace("/2fa/setup");
              return;
            } else if (is2FAEnabled === true || is2FAEnabled === "true") {
              console.log("Redirecting to /2fa/verify");
              router.replace("/2fa/verify");
              return;
            }
          }
        }
      } catch (err) {
        console.error("Session check error:", err);
      }
      
      // temp_tokenがない場合、通常の認証済みユーザーとして/meにリダイレクト
      // または、認証に失敗した場合は/loginにリダイレクト
      console.log("Redirecting to /me (no temp_token or 2FA state)");
      router.replace("/me");
    };

    check2FAAndRedirect();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-slate-600">認証を処理しています...</p>
    </div>
  );
}

