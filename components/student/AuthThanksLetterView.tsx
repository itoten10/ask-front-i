// ask-front/components/student/AuthThanksLetterView.tsx
// 認証済み用の感謝の手紙ビュー（DB接続版）

"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Check, ArrowLeft, Home, Loader2, AlertCircle } from "lucide-react";
import { ThankYouModal } from "@/components/student/ThankYouModal";
import { apiFetch } from "@/app/lib/api-client";
import { ensureAccessToken } from "@/app/lib/session";

interface Member {
  id: number;
  full_name: string;
  role: string;
  grade: string | null;
  class_name: string | null;
  avatar_url: string | null;
}

interface AuthThanksLetterViewProps {
  onBack?: () => void;
  onComplete?: () => void;
}

// 非認知能力のマッピング（コード -> 表示名）
const ABILITIES_LIST = [
  { code: "problem_setting", name: "課題設定力" },
  { code: "information_gathering", name: "情報収集力" },
  { code: "involvement", name: "巻き込む力" },
  { code: "communication", name: "対話する力" },
  { code: "humility", name: "謙虚である力" },
  { code: "execution", name: "実行する力" },
  { code: "completion", name: "完遂する力" },
];

export function AuthThanksLetterView({ onBack, onComplete }: AuthThanksLetterViewProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [remainingMembers, setRemainingMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);

  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [abilities, setAbilities] = useState<string[]>([]);

  const selectedMember = remainingMembers.find((m) => m.id === selectedMemberId);

  // メンバー一覧を取得
  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = await ensureAccessToken();
        if (!token) {
          setError("認証が必要です");
          return;
        }

        const response = await apiFetch<Member[]>(
          "/thanks-letters/users",
          {},
          token
        );

        setMembers(response);
        setRemainingMembers(response);
        if (response.length > 0) {
          setSelectedMemberId(response[0].id);
        }
      } catch (err) {
        console.error("メンバー取得エラー:", err);
        setError("メンバーの取得に失敗しました");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const handleAbilityChange = (abilityCode: string) => {
    setAbilities((prev) =>
      prev.includes(abilityCode) ? prev.filter((a) => a !== abilityCode) : [...prev, abilityCode]
    );
  };

  const handleSubmit = async () => {
    if (!selectedMemberId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const token = await ensureAccessToken();
      if (!token) {
        setError("認証が必要です");
        return;
      }

      await apiFetch(
        "/thanks-letters",
        {
          method: "POST",
          body: JSON.stringify({
            receiver_user_id: selectedMemberId,
            content_1: q1,
            content_2: q2,
            ability_codes: abilities,
          }),
        },
        token
      );

      // 送信成功
      setShowThankYou(true);

      setTimeout(() => {
        // 送信した相手をリストから削除
        setRemainingMembers((prev) => {
          const nextMembers = prev.filter((m) => m.id !== selectedMemberId);
          if (nextMembers.length > 0) {
            setSelectedMemberId(nextMembers[0].id);
          } else {
            setSelectedMemberId(null);
          }
          return nextMembers;
        });

        // フォームをリセット
        setQ1("");
        setQ2("");
        setAbilities([]);

        // 親コンポーネントへ完了通知
        if (onComplete) {
          onComplete();
        }
      }, 1500);
    } catch (err) {
      console.error("送信エラー:", err);
      setError("感謝の手紙の送信に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  // アバターURLを取得（DBにあればそれを使い、なければフォールバック）
  const getAvatarUrl = (member: Member) => {
    if (member.avatar_url) return member.avatar_url;
    // フォールバック: placeholderを使用
    return "/avatars/placeholder.png";
  };

  // 役職情報を生成
  const getRoleText = (member: Member) => {
    const parts = [];
    if (member.grade) parts.push(`${member.grade}年`);
    if (member.class_name) parts.push(`${member.class_name}組`);
    if (member.role === "teacher") {
      parts.push("先生");
    } else if (member.role === "student") {
      parts.push("生徒");
    }
    return parts.join(" ");
  };

  // ローディング中
  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-slate-500">メンバーを読み込み中...</p>
      </div>
    );
  }

  // エラー
  if (error && remainingMembers.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={onBack} variant="outline">
          ホームへ戻る
        </Button>
      </div>
    );
  }

  // すべて完了
  if (remainingMembers.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500 bg-white">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <Check className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">すべて完了しました！</h2>
        <p className="text-slate-500 mb-8">
          チーム全員への感謝の手紙を書き終えました。<br/>
          素晴らしいチームワークです！
        </p>
        <Button
          onClick={onBack}
          className="bg-primary hover:bg-primary/90 text-white gap-2 px-8 h-12 text-base shadow-md transition-transform active:scale-95"
        >
          <Home className="w-5 h-5" />
          ホームへ戻る
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-full bg-white animate-in slide-in-from-left-4 duration-500">

      <ThankYouModal open={showThankYou} onClose={() => setShowThankYou(false)} />

      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200 bg-white flex flex-col shrink-0 md:h-full z-20">
        <div className="p-2 md:p-4 border-b border-slate-100 bg-white sticky top-0 z-10">
           <Button
             variant="ghost"
             onClick={onBack}
             className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 gap-2 px-2 md:px-4 h-10 w-full justify-start"
           >
             <ArrowLeft className="w-5 h-5" />
             <span className="font-bold text-sm md:text-base">ホームに戻る</span>
           </Button>
        </div>

        <div className="flex flex-col md:flex-1 md:overflow-hidden">
          <div className="px-4 pt-3 pb-2 md:pt-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              手紙を書く相手を選択
            </h3>
          </div>

          <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto p-2 md:p-3 gap-2 md:space-y-2 bg-slate-50/30 md:h-full scrollbar-hide">
            {remainingMembers.map((member) => (
              <div
                key={member.id}
                onClick={() => setSelectedMemberId(member.id)}
                className={`
                  min-w-[200px] md:min-w-0 p-3 rounded-lg flex items-center gap-3 cursor-pointer transition-all duration-200 border shrink-0
                  ${selectedMemberId === member.id
                    ? "bg-purple-50 border-primary shadow-sm ring-1 ring-primary/20"
                    : "bg-white border-transparent hover:border-slate-200 hover:shadow-sm"}
                `}
              >
                <Avatar className="h-10 w-10 border border-slate-100 bg-slate-50">
                  <AvatarImage src={getAvatarUrl(member)} />
                  <AvatarFallback className="bg-slate-200 text-slate-500">{member.full_name[0]}</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="font-bold text-sm text-slate-900 leading-tight">{member.full_name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{getRoleText(member)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-white">
        {selectedMember ? (
          <>
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">

                {/* エラー表示 */}
                {error && (
                  <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg">
                    <AlertCircle className="h-5 w-5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                  <Avatar className="h-16 w-16 border-2 border-slate-100 shadow-sm">
                    <AvatarImage src={getAvatarUrl(selectedMember)} />
                    <AvatarFallback>{selectedMember.full_name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">{selectedMember.full_name} <span className="text-base font-normal text-slate-500">さんへ</span></h2>
                    <p className="text-sm text-slate-500">感謝の気持ちを伝えましょう</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-base font-bold text-slate-800 block">
                      Q1. この方の感謝したい行動を教えてください。<span className="text-xs font-normal text-slate-500 ml-2">(最低50字)</span>
                    </label>
                    <Textarea
                      value={q1}
                      onChange={(e) => setQ1(e.target.value)}
                      placeholder="例：積極的に情報収集してくれました。アンケートを実施する対象のグループを探してきてくれました。ありがとう！"
                      className="min-h-[120px] text-base p-4 resize-none border-slate-300 focus-visible:ring-primary/30 rounded-lg bg-slate-50/30 focus:bg-white transition-colors"
                    />
                    <p className="text-xs text-slate-400 text-right">{q1.length} 文字</p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-base font-bold text-slate-800 block">
                      Q2. 上記の行動は、どうチーム活動に役立ちましたか？<span className="text-xs font-normal text-slate-500 ml-2">(最低50字)</span>
                    </label>
                    <Textarea
                      value={q2}
                      onChange={(e) => setQ2(e.target.value)}
                      placeholder="例：誰からアンケートを取るべきか分からず、知っている人もいなかったので、調査が進展するきっかけになりました。"
                      className="min-h-[120px] text-base p-4 resize-none border-slate-300 focus-visible:ring-primary/30 rounded-lg bg-slate-50/30 focus:bg-white transition-colors"
                    />
                    <p className="text-xs text-slate-400 text-right">{q2.length} 文字</p>
                  </div>

                  <div className="space-y-4 pt-2">
                    <label className="text-base font-bold text-slate-800 flex items-center gap-2">
                      Q3. 上記の行動は、どの能力に当てはまると思いますか？
                      <span className="text-xs font-normal text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/20 cursor-help hover:bg-primary/10 transition-colors">
                        i 能力内容詳細
                      </span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 md:gap-y-4 md:gap-x-8 bg-slate-50 p-6 rounded-xl border border-slate-100">
                      {ABILITIES_LIST.map((ability) => (
                        <div key={ability.code} className="flex items-center space-x-3 group">
                          <Checkbox
                            id={ability.code}
                            className="w-5 h-5 border-slate-400 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            checked={abilities.includes(ability.code)}
                            onCheckedChange={() => handleAbilityChange(ability.code)}
                          />
                          <label
                            htmlFor={ability.code}
                            className="text-sm font-medium leading-none cursor-pointer text-slate-700 group-hover:text-slate-900 select-none py-1"
                          >
                            {ability.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-8 flex justify-end gap-4 border-t border-slate-100 pb-20 md:pb-10">
                  <Button
                    variant="ghost"
                    onClick={onBack}
                    className="text-slate-500 hover:text-slate-800 h-12 px-6"
                    disabled={isSubmitting}
                  >
                    キャンセル
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!q1 || !q2 || abilities.length === 0 || isSubmitting}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-10 h-12 text-base font-bold shadow-md transition-all hover:shadow-lg disabled:opacity-50 disabled:shadow-none"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        送信中...
                      </>
                    ) : (
                      "送信する"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
            <User className="w-16 h-16 mb-4 text-slate-200" />
            <p className="text-lg font-medium">左のリストから<br/>感謝を伝えたいメンバーを選択してください</p>
          </div>
        )}
      </div>
    </div>
  );
}
