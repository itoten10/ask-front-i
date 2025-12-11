"use client";

import { useState, useRef, useEffect } from "react"; // useRef, useEffect 追加
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Megaphone, Check, X, Sparkles } from "lucide-react";

// (中略: PostData, PostFormProps, ThankYouModal は変更なし)
interface PostData {
  content: string;
  theme: string;
  phases: string[];
  questionState: string;
  isAnonymous: boolean;
}

interface PostFormProps {
  onSubmit: (data: PostData) => void;
}

// ... ThankYouModalのコードはそのまま ...
function ThankYouModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-200">
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
          あなたの小さな一歩が、<br/>
          新しい発見につながります
        </p>
        <div className="flex justify-center">
           <button onClick={onClose} className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm font-medium transition-colors">
             Close <X className="w-4 h-4" />
           </button>
        </div>
      </div>
    </div>
  );
}

export function PostForm({ onSubmit }: PostFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  
  // ★ 追加: 外部クリック検知用のRef
  const formRef = useRef<HTMLDivElement>(null);

  // ★ 追加: 外部クリック検知ロジック
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        // フォームが開いていて、かつクリックされたのがフォームの外側なら閉じる
        if (isExpanded) {
          setIsExpanded(false);
        }
      }
    }
    // イベントリスナーを追加
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // クリーンアップ
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  // Form States (変更なし)
  const [selectedPhases, setSelectedPhases] = useState<string[]>([]);
  const [themeInput, setThemeInput] = useState("");
  const [content1, setContent1] = useState("");
  const [content2, setContent2] = useState("");
  const [content3, setContent3] = useState("");
  const [questionState, setQuestionState] = useState("");
  const [isNamePublic, setIsNamePublic] = useState(false);

  const togglePhase = (phase: string) => {
    if (selectedPhases.includes(phase)) {
      setSelectedPhases(selectedPhases.filter(p => p !== phase));
    } else {
      setSelectedPhases([...selectedPhases, phase]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content1.trim()) return;

    onSubmit({
      content: [content1, content2, content3].filter(Boolean).join("\n\n"),
      theme: themeInput,
      phases: selectedPhases,
      questionState: questionState,
      isAnonymous: !isNamePublic,
    });

    setContent1(""); setContent2(""); setContent3("");
    setThemeInput(""); setSelectedPhases([]); setQuestionState("");
    setIsNamePublic(false);
    setIsExpanded(false);
    
    setShowThankYou(true);
  };

  return (
    <>
      <ThankYouModal open={showThankYou} onClose={() => setShowThankYou(false)} />
      
      {/* ★ 変更: RefをCardに割り当て */}
      <Card ref={formRef} className={`
        border shadow-sm bg-white overflow-hidden transition-all duration-300 ease-in-out
        ${isExpanded ? "border-primary/50 ring-1 ring-primary/20 shadow-md" : "border-slate-200 hover:border-primary/30"}
      `}>
        <CardContent className="p-0">
          {!isExpanded ? (
            <div 
              onClick={() => setIsExpanded(true)}
              className="flex items-center p-4 cursor-text group"
            >
               <Avatar className="h-12 w-12 border-2 border-slate-100 mr-4">
                  <AvatarImage src="/avatars/01.jpg" alt="My Avatar" />
                  <AvatarFallback>私</AvatarFallback>
                </Avatar>
                <div className="flex-1 relative">
                  <div className="text-slate-400 text-lg">
                    あなたの小さな &quot;やってみた&quot; を共有しよう！
                  </div>
                </div>
                <div className="flex gap-2 text-slate-400 group-hover:text-primary transition-colors">
                  <Pencil className="h-5 w-5" />
                  <Megaphone className="h-5 w-5" />
                </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col animate-in fade-in slide-in-from-top-2 duration-300">
              {/* 中身は変更なし */}
              <div className="flex p-6 gap-6">
                <div className="shrink-0">
                  <Avatar className="h-14 w-14 border-2 border-slate-100">
                    <AvatarImage src="/avatars/01.jpg" alt="My Avatar" />
                    <AvatarFallback>私</AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1 space-y-6">
                  {/* フェーズ選択 */}
                  <div className="space-y-2 relative">
                     <div className="flex justify-between items-center">
                       <label className="text-sm font-bold text-slate-800">
                         現在の探究学習のフェーズを教えてください。<span className="text-xs font-normal text-slate-500 ml-2">(複数選択可)</span>
                       </label>
                       {/* ボタンでの折りたたみも維持 */}
                       <button type="button" onClick={() => setIsExpanded(false)} className="text-xs text-primary font-bold hover:underline">
                         折りたたむ
                       </button>
                     </div>
                     <div className="flex flex-wrap gap-3">
                       {["テーマ設定", "課題設定", "情報収集", "実験・調査", "分析", "発表準備"].map((phase) => (
                         <label key={phase} className="flex items-center gap-2 cursor-pointer select-none">
                           <div 
                             className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${selectedPhases.includes(phase) ? "bg-slate-800 border-slate-800 text-white" : "border-slate-300 bg-white"}`}
                             onClick={(e) => { e.preventDefault(); togglePhase(phase); }}
                           >
                             {selectedPhases.includes(phase) && <Check className="w-3 h-3" />}
                           </div>
                           <span className="text-sm text-slate-600">{phase}</span>
                         </label>
                       ))}
                     </div>
                  </div>

                  {/* テーマ */}
                  <div className="space-y-2">
                     <label className="text-sm font-bold text-slate-800">
                       取り組んでいるテーマ・問いを教えてください。
                     </label>
                     <Input 
                       value={themeInput}
                       onChange={(e) => setThemeInput(e.target.value)}
                       placeholder="例：なぜ○○は効果的なのだろうか？"
                       className="bg-white border-slate-300 focus-visible:ring-primary/30"
                     />
                  </div>

                  {/* 3段構成入力 */}
                  <div className="space-y-3">
                     <div className="space-y-1">
                       <label className="text-sm font-bold text-slate-800">
                         何をやってみた？なぜそれをやったの？どんな気づきがあった？詳しく書いてみよう*
                       </label>
                       <p className="text-xs text-slate-500 font-medium">
                         結果の良し悪しは問いません。あなたの&quot;やってみた&quot;に価値があります！
                       </p>
                     </div>
                     <div className="flex gap-2">
                       <span className="text-slate-300 font-serif italic pt-1">①</span>
                       <Textarea 
                         value={content1}
                         onChange={(e) => setContent1(e.target.value)}
                         placeholder="例：今日少し調べたこと、チームで話したこと..."
                         className="min-h-[80px] resize-none border-slate-300 focus-visible:ring-primary/30"
                       />
                     </div>
                     <div className="flex gap-2">
                       <span className="text-slate-300 font-serif italic pt-1">②</span>
                       <Textarea 
                         value={content2}
                         onChange={(e) => setContent2(e.target.value)}
                         placeholder="他にもあれば"
                         className="min-h-[60px] resize-none border-slate-300 focus-visible:ring-primary/30"
                       />
                     </div>
                     <div className="flex gap-2">
                       <span className="text-slate-300 font-serif italic pt-1">③</span>
                       <Textarea 
                         value={content3}
                         onChange={(e) => setContent3(e.target.value)}
                         placeholder="他にもあれば"
                         className="min-h-[60px] resize-none border-slate-300 focus-visible:ring-primary/30"
                       />
                     </div>
                  </div>

                  {/* 問いの変化 */}
                  <div className="space-y-2">
                     <label className="text-sm font-bold text-slate-800">
                       もともと設定していた問いはどうなりましたか？
                     </label>
                     <div className="space-y-2">
                       {["問いが深まった・変化した", "問いの検証が進んだ", "周辺の準備作業をした"].map((qState) => (
                         <label key={qState} className="flex items-center gap-2 cursor-pointer group">
                           <div 
                             className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${questionState === qState ? "border-primary" : "border-slate-300 group-hover:border-slate-400"}`}
                             onClick={() => setQuestionState(qState)}
                           >
                             {questionState === qState && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                           </div>
                           <span className="text-sm text-slate-700">{qState}</span>
                         </label>
                       ))}
                     </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 bg-slate-50/50 p-4 flex justify-end items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                   <div 
                     className={`w-5 h-5 border rounded flex items-center justify-center bg-white transition-colors ${isNamePublic ? "border-slate-800 text-slate-800" : "border-slate-300"}`}
                     onClick={(e) => { e.preventDefault(); setIsNamePublic(!isNamePublic); }}
                   >
                     {isNamePublic && <Check className="w-3.5 h-3.5" />}
                   </div>
                   <span className="text-sm font-bold text-slate-700">氏名を公開する</span>
                </label>
                <Button 
                  type="submit" 
                  disabled={!content1.trim()}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-2 rounded shadow-sm transition-transform active:scale-95"
                >
                  投稿
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </>
  );
}