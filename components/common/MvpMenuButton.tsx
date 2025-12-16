// components/common/MvpMenuButton.tsx

"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Wrench, X, GraduationCap, Users, Lock, ChevronRight, User, LayoutDashboard, BarChart3 } from "lucide-react";

export function MvpMenuButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  // MVPメニューの中身（ポータルで描画）
  const Modal = mounted && isOpen ? createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-200"
      onClick={() => setIsOpen(false)}
    >
      {/* 
        修正: border-indigo-500 -> border-primary (テーマ色に統一)
      */}
      <div 
        className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 border-2 border-primary/20 transform animate-in zoom-in-95 slide-in-from-bottom-4 duration-200 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 装飾用の背景: indigo -> primary (薄い紫) */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex justify-between items-start mb-6 relative">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {/* 修正: indigo -> primary */}
              <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                MVP DEV TOOLS
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-800">画面切り替えショートカット</h3>
            <p className="text-xs text-slate-500 mt-1">
              MVP専用機能です。ロールごとの画面へ<br/>
              認証をスキップして直接移動します。
            </p>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 relative">
          {/* デモページ（認証なし） */}
          <button
            onClick={() => handleNavigate("/student")}
            className="w-full flex items-center p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-lg group transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-slate-600 group-hover:border-slate-300 shadow-sm mr-4 transition-colors">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-bold text-slate-800 group-hover:text-slate-600 transition-colors">生徒ページ（ログイン不要）</div>
              <div className="text-[10px] text-slate-500">/student</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
          </button>

          <button
            onClick={() => handleNavigate("/teacher")}
            className="w-full flex items-center p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-lg group transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-slate-600 group-hover:border-slate-300 shadow-sm mr-4 transition-colors">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-bold text-slate-800 group-hover:text-slate-600 transition-colors">教師ページ（ログイン不要）</div>
              <div className="text-[10px] text-slate-500">/teacher</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
          </button>

          <button
            onClick={() => handleNavigate("/login")}
            className="w-full flex items-center p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-lg group transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-slate-600 group-hover:border-slate-300 shadow-sm mr-4 transition-colors">
              <Lock className="w-5 h-5" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-bold text-slate-800 group-hover:text-slate-600 transition-colors">Google/2要素認証</div>
              <div className="text-[10px] text-slate-500">/login</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
          </button>

          <div className="border-t border-slate-200 my-2" />

          {/* 能力分析（ログイン不要） */}
          <button
            onClick={() => handleNavigate("/test/ability-analysis")}
            className="w-full flex items-center p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-lg group transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-slate-600 group-hover:border-slate-300 shadow-sm mr-4 transition-colors">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-bold text-slate-800 group-hover:text-slate-600 transition-colors">能力分析（ログイン不要）</div>
              <div className="text-[10px] text-slate-500">/test/ability-analysis</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
          </button>

          <div className="border-t border-slate-200 my-2" />

          {/* 認証済みダッシュボード */}
          <button
            onClick={() => handleNavigate("/student-dashboard")}
            className="w-full flex items-center p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-lg group transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-slate-600 group-hover:border-slate-300 shadow-sm mr-4 transition-colors">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-bold text-slate-800 group-hover:text-slate-600 transition-colors">生徒ページ（ログイン必要）</div>
              <div className="text-[10px] text-slate-500">/student-dashboard</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
          </button>

          <button
            onClick={() => handleNavigate("/teacher-dashboard")}
            className="w-full flex items-center p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-lg group transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-slate-600 group-hover:border-slate-300 shadow-sm mr-4 transition-colors">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-bold text-slate-800 group-hover:text-slate-600 transition-colors">教師ページ（ログイン必要）</div>
              <div className="text-[10px] text-slate-500">/teacher-dashboard</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
          </button>

          {/* マイページ */}
          <button
            onClick={() => handleNavigate("/me?stay=true")}
            className="w-full flex items-center p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-lg group transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-slate-600 group-hover:border-slate-300 shadow-sm mr-4 transition-colors">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-bold text-slate-800 group-hover:text-slate-600 transition-colors">マイページ（ログイン必要）</div>
              <div className="text-[10px] text-slate-500">/me</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      {/* トリガーボタン（デスクトップ用） */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-white hover:text-white hover:bg-white/10 gap-2 border border-white/20 bg-white/5 hidden sm:inline-flex items-center justify-center"
      >
        <Wrench className="h-4 w-4 flex-shrink-0" />
        <span className="text-xs font-medium">MVP Menu</span>
      </Button>

      {/* モバイル用 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-white hover:text-white hover:bg-white/10 sm:hidden px-3 gap-1.5 border border-white/20 bg-white/5 rounded-md inline-flex items-center justify-center"
      >
        <Wrench className="h-4 w-4 flex-shrink-0" />
        <span className="text-[15px] font-bold">MVP</span>
      </Button>

      {Modal}
    </>
  );
}