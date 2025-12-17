// components/common/MvpMenuButton.tsx

"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Wrench, X, GraduationCap, School, Lock, ChevronRight, User, LayoutDashboard, BarChart3, LucideIcon } from "lucide-react";

// --- 内部コンポーネント定義 ---

// セクションの区切りヘッダー（修正：線が文字の下を通らないように左右に分割、余白を短縮）
const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex items-center gap-2 my-2 w-full px-1">
    {/* 左側の線 */}
    <div className="h-px bg-primary/20 flex-1" />
    
    {/* 中央のラベル */}
    <span className="flex-shrink-0 bg-primary/5 px-3 py-0.5 rounded text-[10px] font-bold text-primary tracking-wide border border-primary/10">
      {title}
    </span>
    
    {/* 右側の線 */}
    <div className="h-px bg-primary/20 flex-1" />
  </div>
);

// メニューアイテムボタン
interface MenuButtonProps {
  icon: LucideIcon;
  label: string;
  path: string;
  onClick: (path: string) => void;
}

const MenuButton = ({ icon: Icon, label, path, onClick }: MenuButtonProps) => (
  <button
    onClick={() => onClick(path)}
    className="w-full flex items-center p-3 bg-white hover:bg-primary/5 border border-slate-200 hover:border-primary/30 rounded-xl group transition-all duration-200 mb-2 shadow-sm hover:shadow-md"
  >
    {/* アイコン部分 */}
    <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 group-hover:text-primary group-hover:border-primary/30 group-hover:bg-white transition-colors flex-shrink-0 mr-3">
      <Icon className="w-5 h-5" />
    </div>
    
    {/* テキスト部分 */}
    <div className="flex-1 text-left">
      <div className="font-bold text-slate-700 group-hover:text-primary transition-colors text-sm">
        {label}
      </div>
      <div className="text-[10px] text-slate-400 group-hover:text-primary/60 transition-colors font-mono">
        {path}
      </div>
    </div>
    
    {/* 矢印 */}
    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary/50 transition-colors" />
  </button>
);

// --- Main Component ---

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
      <div 
        className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 border-2 border-primary/20 transform animate-in zoom-in-95 slide-in-from-bottom-4 duration-200 relative overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 装飾用の背景 */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
        
        {/* 閉じるボタン */}
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-full transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ヘッダー */}
        <div className="flex flex-col items-center justify-center mb-2 relative z-10 text-center">
          <div className="mb-2">
            <span className="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
              MVP DEV TOOLS
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-800">画面切り替えショートカット</h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            MVP専用機能です。ロールごとの画面へ<br/>
            一部認証をスキップして直接移動可能です。
          </p>
        </div>

        {/* コンテンツエリア */}
        <div className="mt-2">
          
          {/* セクション1: コア機能体験 */}
          <SectionHeader title="コア機能体験" />
          <MenuButton 
            icon={GraduationCap} 
            label="生徒ページ" 
            path="/student" 
            onClick={handleNavigate} 
          />
          <MenuButton 
            icon={School} 
            label="教師ページ" 
            path="/teacher" 
            onClick={handleNavigate} 
          />
          <MenuButton 
            icon={Lock} 
            label="Google/2要素認証" 
            path="/login" 
            onClick={handleNavigate} 
          />

          {/* セクション2: 認証後挙動確認 */}
          <SectionHeader title="認証後" />
          <MenuButton 
            icon={GraduationCap} 
            label="生徒ページ（要認証）" 
            path="/student-dashboard" 
            onClick={handleNavigate} 
          />
          <MenuButton 
            icon={School} 
            label="教師ページ（要認証）" 
            path="/teacher-dashboard" 
            onClick={handleNavigate} 
          />

          {/* セクション3: 内部データ確認 */}
          <SectionHeader title="内部データ確認" />
          <MenuButton 
            icon={BarChart3} 
            label="AI能力判定" 
            path="/test/ability-analysis" 
            onClick={handleNavigate} 
          />
          <MenuButton 
            icon={User} 
            label="マイページ（要認証）" 
            path="/me?stay=true" 
            onClick={handleNavigate} 
          />

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