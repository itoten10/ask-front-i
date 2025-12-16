// app/top/page.tsx

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { User, Eye, EyeOff, AlertTriangle, CheckCircle2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
// 既存のモーダルコンポーネントをインポート
import { FeatureInfoModal } from "@/components/student/FeatureInfoModal";

// --- Utility for Tailwind classes ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Icons ---
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
      <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
        <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
        <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.424 63.239 -14.754 63.239 Z" />
        <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.734 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
        <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.424 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
      </g>
    </svg>
  );
}

// --- Page Component ---
export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"teacher" | "student">("teacher");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // モーダルの状態管理
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  // ロール切り替え時にID/Passを自動セット
  useEffect(() => {
    if (role === "teacher") {
      setUsername("teacher01");
      setPassword("tech01");
    } else {
      setUsername("student01");
      setPassword("tech01");
    }
  }, [role]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Mock Login Logic
      await new Promise((resolve) => setTimeout(resolve, 800));
      console.log(`Login as ${role}:`, { username, password });
      
      if (role === "teacher") {
        router.push("/teacher");
      } else {
        router.push("/student");
      }
    } catch (error) {
      console.error("Login failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Googleログインボタンクリック時にモーダルを表示
    setShowGoogleModal(true);
  };

  const handleHelpClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Forgot/Helpクリック時にモーダルを表示
    setShowHelpModal(true);
  };

  return (
    <>
      {/* 全体背景 */}
      <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#F5F2F9] p-4 text-[#5D5A88]">
        
        {/* 背景画像 */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/background.svg" 
            alt="Background Pattern" 
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        {/* メインカード */}
        <div className="z-10 flex h-auto w-full max-w-sm flex-col overflow-hidden rounded-[2.5rem] bg-white/60 backdrop-blur-xl border border-white/50 shadow-2xl md:h-[600px] md:max-w-[950px] md:flex-row">
          
          {/* 左側：ロゴエリア */}
          <div className="relative flex w-full flex-col items-center justify-center p-4 md:p-6 md:w-1/2">
            <div className="relative z-10 flex flex-col items-center">
              {/* 炎アイコン */}
              <div className="relative mb-0 h-32 w-32 md:h-[450px] md:w-[450px]">
                <Image 
                  src="/app-icon.svg" 
                  alt="KATARIBA Icon" 
                  fill 
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>

          {/* 右側：フォームエリア */}
          <div className="flex w-full flex-col justify-center p-6 md:w-1/2 md:px-12 md:py-10">
            
            <h2 className="mb-6 text-center text-3xl font-bold text-[#9370DB]">LOGIN</h2>

            {/* タブ */}
            <div className="mb-6 flex w-full border-b border-gray-200">
              <button
                type="button"
                onClick={() => setRole("teacher")}
                className={cn(
                  "relative flex-1 pb-2 text-center text-sm font-semibold transition-colors duration-300",
                  role === "teacher" 
                    ? "text-[#9370DB] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[#9370DB]" 
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                Teacher
              </button>
              <button
                type="button"
                onClick={() => setRole("student")}
                className={cn(
                  "relative flex-1 pb-2 text-center text-sm font-semibold transition-colors duration-300",
                  role === "student" 
                    ? "text-[#9370DB] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[#9370DB]" 
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                Student
              </button>
            </div>

            {/* フォーム */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="group relative">
                <label htmlFor="username" className="block text-sm font-bold text-[#9370DB] opacity-80">
                  Username
                </label>
                <div className="relative mt-1">
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full border-b-2 border-[#9370DB]/30 bg-transparent py-2 pr-8 text-base text-gray-700 placeholder-transparent focus:border-[#9370DB] focus:outline-none transition-colors"
                    placeholder="Enter your username"
                    required
                  />
                  <User className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-5 text-[#9370DB] opacity-70" />
                </div>
              </div>

              <div className="group relative">
                <label htmlFor="password" className="block text-sm font-bold text-[#9370DB] opacity-80">
                  Password
                </label>
                <div className="relative mt-1">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border-b-2 border-[#9370DB]/30 bg-transparent py-2 pr-8 text-base text-gray-700 placeholder-transparent focus:border-[#9370DB] focus:outline-none transition-colors"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-[#9370DB] opacity-70 hover:opacity-100 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full rounded-full bg-[#9370DB] py-3 text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="mt-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#9E9E9E] py-3 text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
              >
                <GoogleIcon className="h-5 w-5 bg-white rounded-full p-0.5" />
                <span className="text-sm font-medium">Sign in with Google</span>
              </button>
            </div>

            <div className="mt-6 flex flex-col items-end gap-1 text-sm font-semibold text-[#9370DB]">
              <button onClick={handleHelpClick} className="hover:underline opacity-80 hover:opacity-100">
                Forgot
              </button>
              <button onClick={handleHelpClick} className="hover:underline opacity-80 hover:opacity-100">
                Help
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Forgot / Help 用モーダル */}
      <FeatureInfoModal 
        open={showHelpModal} 
        onClose={() => setShowHelpModal(false)}
        title="ログイン案内"
        description={
          <div className="flex flex-col gap-4 text-left">
            <div className="rounded-lg bg-purple-50 border border-purple-100 p-4">
              <p className="text-sm text-purple-900 leading-relaxed">
                <span className="font-bold text-purple-700">デモ用ID・パスワード</span>が事前に入力されています。
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-600">
                上部の <span className="font-bold text-[#9370DB]">Teacher / Student</span> タブを切り替えて、<br />
                そのままログインボタンを押してください。
              </p>
            </div>
          </div>
        }
      />

      {/* Google Login 用モーダル（デザイン修正版：紫統一） */}
      <FeatureInfoModal 
        open={showGoogleModal} 
        onClose={() => setShowGoogleModal(false)}
        title="Googleログインについて"
        description={
          <div className="flex flex-col gap-4 text-left">
            {/* 警告・条件エリア */}
            <div className="rounded-lg bg-purple-50 border border-purple-200 p-4 shadow-sm">
              <h4 className="font-bold text-purple-800 mb-2 flex flex-col items-center gap-2 text-sm text-center">
                <span className="flex items-center gap-2 justify-center w-full">
                  <AlertTriangle className="h-4 w-4" />
                  ログインに必要な下記条件を
                </span>
                全て満たす必要があります
              </h4>
              <ul className="list-inside space-y-1 text-sm text-purple-900/80">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                  <span>管理者による事前のユーザー登録</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                  <span>学校指定のGoogleアカウント</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                  <span>Authenticator（2要素）認証</span>
                </li>
              </ul>
            </div>
            
            {/* アクション誘導エリア */}
            <div className="flex flex-col items-center gap-2 py-2">
              <div className="flex items-center gap-2 text-[#9370DB] font-bold">
                <CheckCircle2 className="h-5 w-5" />
                <span>まずはデモ用IDでお試しください</span>
              </div>
              <p className="text-xs text-slate-500 text-center">
                フォームに入力済みのID/パスワードで<br />
                すぐにログイン可能です。<br />
                MFA認証はデモIDでログイン後体験できます。
              </p>
            </div>
          </div>
        }
      />
    </>
  );
}