"use client";

import { X, Sparkles } from "lucide-react";

interface ThankYouModalProps {
  open: boolean;
  onClose: () => void;
}

export function ThankYouModal({ open, onClose }: ThankYouModalProps) {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 text-center transform animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border-2 border-slate-100 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
        
        <div className="mb-6 flex justify-center">
           <div className="relative">
             <span className="text-6xl animate-bounce delay-100 inline-block">🎉</span>
             <Sparkles className="absolute -top-2 -right-4 text-yellow-400 w-8 h-8 animate-pulse" />
             <Sparkles className="absolute top-4 -left-6 text-yellow-400 w-6 h-6 animate-pulse delay-75" />
           </div>
        </div>

        <h3 className="text-2xl font-bold text-slate-800 mb-2 font-en">Thank you!</h3>
        <p className="text-slate-500 mb-8 text-lg leading-relaxed">
          あなたのその言葉が、<br/>
          仲間の背中を押します
        </p>
        
        <div className="flex justify-center">
           <button 
             onClick={onClose} 
             className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm font-medium transition-colors"
           >
             Close <X className="w-4 h-4" />
           </button>
        </div>
      </div>
    </div>
  );
}