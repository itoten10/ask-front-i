import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const NEXT_PUBLIC_API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8000";

// 環境変数の検証
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

// デバッグ用: 環境変数の状態を確認
console.log("🔍 NextAuth Config Check:");
console.log("  GOOGLE_CLIENT_ID:", googleClientId ? `${googleClientId.substring(0, 10)}...` : "NOT SET");
console.log("  GOOGLE_CLIENT_SECRET:", googleClientSecret ? "SET" : "NOT SET");
console.log("  NEXTAUTH_URL:", process.env.NEXTAUTH_URL || "NOT SET");
console.log("  NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET ? "SET" : "NOT SET");

// Google認証情報が設定されているかチェック
const isGoogleConfigured = googleClientId && 
                          googleClientSecret && 
                          googleClientId !== "your-google-client-id-here" &&
                          googleClientSecret !== "your-google-client-secret-here";

if (!isGoogleConfigured) {
  console.error("❌ Google OAuth credentials are not configured!");
  console.error("Please create .env.local file and set:");
  console.error("  GOOGLE_CLIENT_ID=your-actual-client-id");
  console.error("  GOOGLE_CLIENT_SECRET=your-actual-client-secret");
  console.error("Get credentials from: https://console.cloud.google.com/apis/credentials");
} else {
  console.log("✅ Google OAuth credentials are configured");
}

// GoogleProviderを初期化
let googleProviderInstance = null;
if (isGoogleConfigured) {
  try {
    googleProviderInstance = GoogleProvider({
      clientId: googleClientId!,
      clientSecret: googleClientSecret!,
      authorization: {
        params: {
          prompt: "select_account", // 必ずアカウント選択画面を表示
        },
      },
    });
    console.log("✅ GoogleProvider initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize GoogleProvider:", error);
  }
}

const providersArray = googleProviderInstance ? [googleProviderInstance] : [];
console.log("📋 Providers array length:", providersArray.length);
console.log("📋 Providers array:", providersArray.map(p => p.id || p.name || "unknown"));

export const authOptions: NextAuthOptions = {
  providers: providersArray,
  callbacks: {
    async signIn({ user, account, profile }) {
      // Google認証成功後の処理
      if (account?.provider === "google" && account.id_token) {
        try {
          // バックエンドにGoogle ID Tokenを送信
          const response = await fetch(`${NEXT_PUBLIC_API_ENDPOINT}/api/auth/google-login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: 'include', // クッキーを含める
            body: JSON.stringify({
              id_token: account.id_token,
              email: user.email || "",
            }),
          });

          if (!response.ok) {
            return false;
          }

          const data = await response.json();

          // データをuserオブジェクトに保存（jwtコールバックで使用）
          (user as any).temp_token = data.temp_token;
          (user as any).is_2fa_enabled = data.is_2fa_enabled;
          (user as any).user_id = data.user_id;

          // 2FA無効の場合は直接access_tokenを保存
          if (!data.is_2fa_enabled && data.access_token) {
            (user as any).access_token = data.access_token;
            (user as any).token_type = data.token_type;
            (user as any).expires_in = data.expires_in;
          }

          return true;
        } catch (error) {
          console.error("Google login error:", error);
          return false;
        }
      }
      return false;
    },
    async jwt({ token, user, account }) {
      // 初回ログイン時、userオブジェクトからデータを取得してトークンに保存
      if (user) {
        if ((user as any).temp_token) {
          token.temp_token = (user as any).temp_token;
        }
        if ((user as any).is_2fa_enabled !== undefined) {
          token.is_2fa_enabled = (user as any).is_2fa_enabled;
        }
        if ((user as any).user_id) {
          token.user_id = (user as any).user_id;
        }
        // 2FA無効の場合、access_tokenを保存
        if ((user as any).access_token) {
          token.access_token = (user as any).access_token;
          token.token_type = (user as any).token_type;
          token.expires_in = (user as any).expires_in;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // セッションに2FA関連データまたはaccess_tokenを追加
      if (token.temp_token) {
        (session as any).temp_token = token.temp_token;
        (session as any).is_2fa_enabled = token.is_2fa_enabled;
        (session as any).user_id = token.user_id;
      }
      // 2FA無効の場合、access_tokenをセッションに追加
      if (token.access_token) {
        (session as any).access_token = token.access_token;
        (session as any).token_type = token.token_type;
        (session as any).expires_in = token.expires_in;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // 認証後のリダイレクト処理
      return `${baseUrl}/auth/callback`;
    },
  },
  pages: {
    signIn: "/login",
  },
};
