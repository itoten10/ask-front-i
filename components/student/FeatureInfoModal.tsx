"use client";

import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* 修正: border-t-4 border-slate-600 を削除しました */}
      <div 
        className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4 transform animate-in zoom-in-95 duration-200"
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
    </div>
  );
}