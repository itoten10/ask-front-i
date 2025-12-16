// ask-front-i/components/student/ThanksLetterView.tsx

"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Check, ArrowLeft, Home } from "lucide-react"; 
import { ThankYouModal } from "@/components/student-dummy/ThankYouModal";

interface Member {
  id: number;
  name: string;
  role: string;
  avatarUrl: string;
}

interface ThanksLetterViewProps {
  onBack?: () => void;
  onComplete?: () => void; // ★ 追加: 1通送るたびに呼ばれるコールバック
}

export function ThanksLetterView({ onBack, onComplete }: ThanksLetterViewProps) {
  const [members, setMembers] = useState<Member[]>([
    { id: 1, name: "江藤 泰平", role: "2年4組 メディアラボ", avatarUrl: "/avatars/02.jpg" },
    { id: 2, name: "伊藤 誠人", role: "2年4組 メディアラボ", avatarUrl: "/avatars/03.jpg" },
    { id: 3, name: "由井 理月", role: "2年4組 メディアラボ", avatarUrl: "/avatars/04.jpg" },
  ]);

  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(members.length > 0 ? members[0].id : null);
  const [showThankYou, setShowThankYou] = useState(false);

  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [abilities, setAbilities] = useState<string[]>([]);

  const selectedMember = members.find((m) => m.id === selectedMemberId);

  const abilitiesList = [
    "課題設定能力",
    "情報収集能力",
    "巻き込む力",
    "対話する力",
    "実行する力",
    "謙虚である力",
    "完遂する力",
  ];

  const handleAbilityChange = (ability: string) => {
    setAbilities((prev) =>
      prev.includes(ability) ? prev.filter((a) => a !== ability) : [...prev, ability]
    );
  };

  const handleSubmit = () => {
    if (!selectedMemberId) return;
    setShowThankYou(true);
    setTimeout(() => {
      setMembers((prev) => {
        const nextMembers = prev.filter((m) => m.id !== selectedMemberId);
        if (nextMembers.length > 0) {
          setSelectedMemberId(nextMembers[0].id);
        } else {
          setSelectedMemberId(null);
        }
        return nextMembers;
      });
      setQ1("");
      setQ2("");
      setAbilities([]);
      
      // ★ 追加: 親コンポーネントへ完了通知
      if (onComplete) {
        onComplete();
      }
    }, 1500);
  };

  if (members.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500 bg-white">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <Check className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">すべて完了しました！</h2>
        <p className="text-slate-500 mb-8">
          チーム全員への感謝の手紙を書き終えました。<br/>
          素晴らしいチームワークです！👏
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

  // (以下、returnの中身は前回のレイアウト修正版のまま変更なしなので省略します。前回のコードを使ってください)
  // ...
  // ...
  
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
            {members.map((member) => (
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
                  <AvatarImage src={member.avatarUrl} />
                  <AvatarFallback className="bg-slate-200 text-slate-500">{member.name[0]}</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="font-bold text-sm text-slate-900 leading-tight">{member.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{member.role}</p>
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
                
                <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                  <Avatar className="h-16 w-16 border-2 border-slate-100 shadow-sm">
                    <AvatarImage src={selectedMember.avatarUrl} />
                    <AvatarFallback>{selectedMember.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">{selectedMember.name} <span className="text-base font-normal text-slate-500">さんへ</span></h2>
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
                  </div>

                  <div className="space-y-4 pt-2">
                    <label className="text-base font-bold text-slate-800 flex items-center gap-2">
                      Q3. 上記の行動は、どの能力に当てはまると思いますか？
                      <span className="text-xs font-normal text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/20 cursor-help hover:bg-primary/10 transition-colors">
                        i 能力内容詳細
                      </span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 md:gap-y-4 md:gap-x-8 bg-slate-50 p-6 rounded-xl border border-slate-100">
                      {abilitiesList.map((ability) => (
                        <div key={ability} className="flex items-center space-x-3 group">
                          <Checkbox 
                            id={ability} 
                            className="w-5 h-5 border-slate-400 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            checked={abilities.includes(ability)}
                            onCheckedChange={() => handleAbilityChange(ability)}
                          />
                          <label
                            htmlFor={ability}
                            className="text-sm font-medium leading-none cursor-pointer text-slate-700 group-hover:text-slate-900 select-none py-1"
                          >
                            {ability}
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
                  >
                    キャンセル
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={!q1 || !q2 || abilities.length === 0}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-10 h-12 text-base font-bold shadow-md transition-all hover:shadow-lg disabled:opacity-50 disabled:shadow-none"
                  >
                    送信する
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