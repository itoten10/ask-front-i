// components/student/FeatureInfoModal.tsx

"use client";

import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface FeatureInfoModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description: React.ReactNode;
}

export function FeatureInfoModal({ 
  open, 
  onClose, 
  title = "機能のお知らせ", 
  description 
}: FeatureInfoModalProps) {
  // マウント状態を管理（SSR対策）
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // モーダルが開いている間は、背面のスクロールを禁止する
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    // クリーンアップ
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // マウント前や非表示時は何も描画しない
  if (!open || !mounted) return null;

  // ★修正箇所: createPortal を使用
  // これにより、コンポーネントがどこに書かれていても、
  // 描画は "document.body"（画面の最上位）の直下に行われるため、
  // 他の要素（サイドバーやテーブルヘッダー）のZ-indexの影響を受けずに最前面に表示されます。
  return createPortal(
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4 transform animate-in zoom-in-95 duration-200 border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            <Info className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800 mb-2">{title}</h3>
            <div className="text-sm text-slate-600 leading-relaxed">
              {description}
            </div>
          </div>
          <Button onClick={onClose} className="w-full bg-slate-800 text-white hover:bg-slate-700">
            閉じる
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}