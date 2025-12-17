// ask-front/components/student/AuthPostForm.tsx
// API接続版の投稿フォーム（フェーズは単一選択）

"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Megaphone, Check, Loader2 } from "lucide-react";
import { ThankYouModal } from "@/components/student/ThankYouModal";

// DB連携用のフェーズラベル（バックエンド定義と一致させる）
const PHASE_LABELS = [
  "テーマ設定",
  "課題設定",
  "情報収集",
  "整理・分析",
  "まとめ・表現",
  "発表準備",
] as const;

// 問いの状態変更タイプ
const QUESTION_STATE_OPTIONS = [
  { value: "deepened", label: "問いが深まった・変化した" },
  { value: "verified", label: "問いの検証が進んだ" },
  { value: "preparation", label: "周辺の準備作業をした" },
] as const;

interface AuthPostFormProps {
  userName: string;
  userAvatar?: string;
  onSubmit: (data: PostFormData) => Promise<void>;
  isLoading?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface PostFormData {
  problem: string;  // テーマ・問い
  content_1: string;
  content_2?: string;
  content_3?: string;
  phase_label: string;  // 単一選択
  question_state_change_type: string;
  ability_codes?: string[];  // 非認知能力コード（自動判定用、今は空）
}

export function AuthPostForm({ userName, userAvatar, onSubmit, isLoading = false, isOpen, onOpenChange }: AuthPostFormProps) {
  const avatarSrc = userAvatar || "/avatars/placeholder.png";
  const [internalExpanded, setInternalExpanded] = useState(false);

  // 外部制御と内部制御の両方をサポート
  const isExpanded = isOpen !== undefined ? isOpen : internalExpanded;
  const setIsExpanded = (value: boolean) => {
    if (onOpenChange) {
      onOpenChange(value);
    }
    setInternalExpanded(value);
  };
  const [showThankYou, setShowThankYou] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        if (isExpanded && !isSubmitting) {
          setIsExpanded(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded, isSubmitting]);

  // Form States
  const [selectedPhase, setSelectedPhase] = useState<string>("");  // 単一選択に変更
  const [themeInput, setThemeInput] = useState("");
  const [content1, setContent1] = useState("");
  const [content2, setContent2] = useState("");
  const [content3, setContent3] = useState("");
  const [questionState, setQuestionState] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content1.trim() || !selectedPhase) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        problem: themeInput,
        content_1: content1,
        content_2: content2 || undefined,
        content_3: content3 || undefined,
        phase_label: selectedPhase,
        question_state_change_type: questionState || "none",
        ability_codes: [],
      });

      // フォームをリセット
      setContent1(""); setContent2(""); setContent3("");
      setThemeInput(""); setSelectedPhase(""); setQuestionState("");
      setIsExpanded(false);

      setShowThankYou(true);
    } catch (error) {
      console.error("投稿に失敗しました:", error);
      alert("投稿に失敗しました。もう一度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = content1.trim() && selectedPhase;

  return (
    <>
      <ThankYouModal open={showThankYou} onClose={() => setShowThankYou(false)} />

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
                  <AvatarImage src={avatarSrc} alt="My Avatar" />
                  <AvatarFallback>{userName?.[0] || "私"}</AvatarFallback>
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
              <div className="flex p-4 md:p-6 gap-3 md:gap-6">
                <div className="shrink-0 hidden sm:block">
                  <Avatar className="h-12 w-12 md:h-14 md:w-14 border-2 border-slate-100">
                    <AvatarImage src={avatarSrc} alt="My Avatar" />
                    <AvatarFallback>{userName?.[0] || "私"}</AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1 space-y-4 md:space-y-6">
                  {/* フェーズ選択（単一選択に変更） */}
                  <div className="space-y-2 relative">
                     <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                       <label className="text-xs sm:text-sm font-bold text-slate-800">
                         現在の探究学習のフェーズを教えてください。<span className="text-red-500">*</span>
                       </label>
                       <button
                         type="button"
                         onClick={() => setIsExpanded(false)}
                         className="text-xs text-primary font-bold hover:underline self-end sm:self-auto"
                         disabled={isSubmitting}
                       >
                         折りたたむ
                       </button>
                     </div>
                     <div className="flex flex-wrap gap-2 sm:gap-3">
                       {PHASE_LABELS.map((phase) => (
                         <label key={phase} className="flex items-center gap-1.5 sm:gap-2 cursor-pointer select-none">
                           <div
                             className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                               selectedPhase === phase
                                 ? "border-primary"
                                 : "border-slate-300 hover:border-slate-400"
                             }`}
                             onClick={(e) => { e.preventDefault(); setSelectedPhase(phase); }}
                           >
                             {selectedPhase === phase && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                           </div>
                           <span className="text-xs sm:text-sm text-slate-600">{phase}</span>
                         </label>
                       ))}
                     </div>
                  </div>

                  {/* テーマ */}
                  <div className="space-y-2">
                     <label className="text-xs sm:text-sm font-bold text-slate-800">
                       取り組んでいるテーマ・問いを教えてください。
                     </label>
                     <Input
                       value={themeInput}
                       onChange={(e) => setThemeInput(e.target.value)}
                       placeholder="例：なぜ○○は効果的なのだろうか？"
                       className="bg-white border-slate-300 focus-visible:ring-primary/30 text-sm"
                       disabled={isSubmitting}
                     />
                  </div>

                  {/* 3段構成入力 */}
                  <div className="space-y-2 sm:space-y-3">
                     <div className="space-y-1">
                       <label className="text-xs sm:text-sm font-bold text-slate-800">
                         何をやってみた？なぜそれをやったの？どんな気づきがあった？詳しく書いてみよう<span className="text-red-500">*</span>
                       </label>
                       <p className="text-[10px] sm:text-xs text-slate-500 font-medium">
                         結果の良し悪しは問いません。あなたの&quot;やってみた&quot;に価値があります！
                       </p>
                     </div>
                     <div className="flex gap-2">
                       <span className="text-slate-300 font-serif italic pt-1 text-sm sm:text-base">①</span>
                       <Textarea
                         value={content1}
                         onChange={(e) => setContent1(e.target.value)}
                         placeholder="例：今日少し調べたこと、チームで話したこと..."
                         className="min-h-[70px] sm:min-h-[80px] resize-none border-slate-300 focus-visible:ring-primary/30 text-sm"
                         disabled={isSubmitting}
                       />
                     </div>
                     <div className="flex gap-2">
                       <span className="text-slate-300 font-serif italic pt-1 text-sm sm:text-base">②</span>
                       <Textarea
                         value={content2}
                         onChange={(e) => setContent2(e.target.value)}
                         placeholder="他にもあれば"
                         className="min-h-[50px] sm:min-h-[60px] resize-none border-slate-300 focus-visible:ring-primary/30 text-sm"
                         disabled={isSubmitting}
                       />
                     </div>
                     <div className="flex gap-2">
                       <span className="text-slate-300 font-serif italic pt-1 text-sm sm:text-base">③</span>
                       <Textarea
                         value={content3}
                         onChange={(e) => setContent3(e.target.value)}
                         placeholder="他にもあれば"
                         className="min-h-[50px] sm:min-h-[60px] resize-none border-slate-300 focus-visible:ring-primary/30 text-sm"
                         disabled={isSubmitting}
                       />
                     </div>
                  </div>

                  {/* 問いの変化 */}
                  <div className="space-y-2">
                     <label className="text-xs sm:text-sm font-bold text-slate-800">
                       もともと設定していた問いはどうなりましたか？
                     </label>
                     <div className="space-y-1.5 sm:space-y-2">
                       {QUESTION_STATE_OPTIONS.map((option) => (
                         <label key={option.value} className="flex items-center gap-2 cursor-pointer group">
                           <div
                             className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                               questionState === option.value
                                 ? "border-primary"
                                 : "border-slate-300 group-hover:border-slate-400"
                             }`}
                             onClick={() => setQuestionState(option.value)}
                           >
                             {questionState === option.value && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                           </div>
                           <span className="text-xs sm:text-sm text-slate-700">{option.label}</span>
                         </label>
                       ))}
                     </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 bg-slate-50/50 p-4 flex justify-end items-center gap-4">
                <Button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-2 rounded shadow-sm transition-transform active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      投稿中...
                    </>
                  ) : (
                    "投稿"
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </>
  );
}
