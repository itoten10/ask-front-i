"use client";

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { CarouselList } from "@/components/student/CarouselList";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil, Megaphone, Eye, QrCode, User } from "lucide-react"; // Userアイコン追加
import { useState, useEffect } from "react";
import QRCode from "qrcode";

// ==========================================
// Types (Backend API Response Type)
// バックエンド担当者様へ:
// API設計時は isAnonymous フラグを含めることを推奨します
// ==========================================

interface Post {
  id: number;
  labName: string;
  authorName: string;
  content: string;
  isViewedByTeacher: boolean; // 先生が見たかどうか
  isAnonymous?: boolean;      // 匿名投稿かどうか
}

interface Notice {
  id: number;
  date: string;
  labName: string;
  title: string;
  deadline: string;
  url: string;
}

// --- Helper: IDに基づいてアバター画像のパスを返す関数 ---
const getAvatarUrl = (id: number) => {
  const num = ((id - 1) % 4) + 1;
  return `/avatars/0${num}.jpg`;
};

export default function StudentPage() {
  // --- State & Data Fetching ---
  // TODO: [API連携] SWRやServer Actionsでデータ取得
  
  const [qrCodes, setQrCodes] = useState<Record<number, string>>({});

  // ダミーデータ: 注目投稿
  const featuredPosts: Post[] = [
    { id: 1, labName: "メディアラボ", authorName: "○○ ○○", content: "文化祭のポスターデザインについて、色使いの心理的効果を調べてみた。青色は信頼感を与えるらしい。", isViewedByTeacher: true },
    // 匿名フラグを追加
    { id: 2, labName: "工学ラボ", authorName: "匿名", content: "3Dプリンターのフィラメント詰まりを解消する方法を試行錯誤した結果、温度設定が鍵だとわかった。", isViewedByTeacher: true, isAnonymous: true },
    { id: 3, labName: "文化教育ラボ", authorName: "匿名", content: "地元の伝統行事について聞き取り調査を行った。意外な歴史的背景が見えてきて面白い。", isViewedByTeacher: false, isAnonymous: true },
    { id: 4, labName: "サイエンスラボ", authorName: "佐藤 健太", content: "川の水質調査を実施。上流と下流でのpH値の変化をグラフにまとめたところ、有意な差が見られた。", isViewedByTeacher: true },
    { id: 5, labName: "国際ゼミ", authorName: "鈴木 花子", content: "模擬国連に向けて、各国の食糧問題に関するスタンスをリサーチ中。各国の利害関係が複雑。", isViewedByTeacher: false },
    { id: 6, labName: "地域ビジネス", authorName: "田中 太郎", content: "商店街の空き店舗活用アイデアをブレインストーミング。高校生向けのカフェという案が出ている。", isViewedByTeacher: true },
    { id: 7, labName: "フィジカルラボ", authorName: "匿名", content: "効率的な筋力トレーニングのセット数について論文を読んだ。週3回の頻度が最適らしい。", isViewedByTeacher: false, isAnonymous: true },
    { id: 8, labName: "社会科学ゼミ", authorName: "山田 次郎", content: "SNSの利用時間と学習意欲の相関関係についてアンケートを作成中。Googleフォーム便利。", isViewedByTeacher: true },
  ];

  // ダミーデータ: 掲示板
  const notices: Notice[] = [
    { id: 1, date: "10/10", labName: "メディアラボ", title: "○○に関するアンケートのご協力お願いします！", deadline: "12/12", url: "https://forms.google.com/example1" },
    { id: 2, date: "10/15", labName: "工学ラボ", title: "ロボットコンテストの観戦者を募集しています", deadline: "12/17", url: "https://example.com/robot-contest" },
    { id: 3, date: "10/29", labName: "文化教育ゼミ", title: "地域ボランティアの参加者説明会について", deadline: "12/29", url: "https://example.com/volunteer" },
    { id: 4, date: "11/02", labName: "生徒会", title: "球技大会の種目希望アンケート", deadline: "11/15", url: "https://forms.google.com/ball-game" },
    { id: 5, date: "11/05", labName: "進路指導部", title: "冬期講習の申し込み開始のお知らせ", deadline: "11/20", url: "https://school.edu/winter-course" },
    { id: 6, date: "11/10", labName: "図書委員会", title: "読書感想文コンクールの作品募集", deadline: "11/30", url: "https://library.example.com/contest" },
  ];

  // --- Effect: QRコード生成 ---
  useEffect(() => {
    const generateQRs = async () => {
      const codes: Record<number, string> = {};
      for (const notice of notices) {
        try {
          codes[notice.id] = await QRCode.toDataURL(notice.url, { errorCorrectionLevel: 'M', margin: 1 });
        } catch (err) {
          console.error("QR Code generation failed", err);
        }
      }
      setQrCodes(codes);
    };
    generateQRs();
  }, []);

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Post submitted (Mock)");
  };

  return (
    <div className="flex min-h-screen bg-background font-sans">
      {/* サイドバー */}
      <Sidebar userRole="student" />

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <div className="w-full max-w-[1600px] mx-auto space-y-12">
            
            {/* 1. 投稿フォームエリア */}
            <Card className="border border-slate-200 shadow-sm bg-white hover:border-primary/30 transition-colors">
              <CardContent className="p-3">
                <form onSubmit={handlePostSubmit} className="flex items-center gap-4 px-2 py-1">
                  <Avatar className="h-12 w-12 border-2 border-slate-100">
                    <AvatarImage src="/avatars/01.jpg" alt="My Avatar" />
                    <AvatarFallback>私</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 relative">
                    <Input 
                      placeholder="あなたの小さな &quot;やってみた&quot; を共有しよう！" 
                      className="border-none shadow-none text-lg placeholder:text-slate-400 focus-visible:ring-0 h-12 bg-transparent"
                    />
                  </div>
                  <div className="flex gap-2 text-slate-400">
                    <Button type="button" variant="ghost" size="icon" className="hover:text-primary hover:bg-primary/10 transition-colors">
                      <Pencil className="h-6 w-6" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="hover:text-primary hover:bg-primary/10 transition-colors">
                      <Megaphone className="h-6 w-6" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* 2. 今週注目のやってみた (Carousel) */}
            <CarouselList 
              title="今週注目の &quot;やってみた&quot;" 
              subTitle="※AIが自動でピックアップしています"
              icon="👏"
            >
              {featuredPosts.map((post) => (
                <Card 
                  key={post.id} 
                  className="
                    h-full 
                    border border-slate-200 
                    bg-white 
                    transition-all duration-300 
                    hover:border-primary hover:bg-primary/5 hover:shadow-lg
                    cursor-pointer group flex flex-col
                  "
                >
                  <CardContent className="p-6 flex-1 flex flex-col space-y-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 border border-slate-200 bg-white">
                        {/* 匿名なら画像を出さない、そうでなければ画像を表示 */}
                        {!post.isAnonymous && <AvatarImage src={getAvatarUrl(post.id)} />}
                        
                        <AvatarFallback className="bg-slate-100 text-slate-400">
                          {/* 匿名ならUserアイコン、そうでなければイニシャル */}
                          {post.isAnonymous ? <User className="h-5 w-5" /> : post.labName[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <p className="text-xs font-bold text-slate-500">{post.labName}</p>
                        <p className="font-bold text-sm text-slate-800">{post.authorName}</p>
                      </div>
                    </div>
                    
                    <p className="text-sm font-medium text-slate-700 leading-relaxed flex-1 line-clamp-3">
                      {post.content}
                    </p>
                    
                    <div className="flex justify-end pt-2 min-h-[28px]">
                      {post.isViewedByTeacher && (
                         <div className="flex items-center text-primary/80 animate-in fade-in duration-500" title="先生が確認しました">
                           <Eye className="h-5 w-5" />
                         </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CarouselList>

            {/* 3. 校内掲示板 (Carousel) */}
            <CarouselList 
              title="校内掲示板" 
              icon="📋"
            >
              {notices.map((notice) => (
                <Card 
                  key={notice.id} 
                  className="
                    h-full 
                    border border-slate-200 
                    bg-white
                    transition-all duration-300
                    hover:border-primary hover:bg-primary/5 hover:shadow-lg
                    cursor-pointer flex flex-col
                  "
                >
                  <CardContent className="p-5 flex gap-5 h-full items-start">
                    
                    {/* 左側: 投稿日とQRコード */}
                    <div className="flex flex-col items-center gap-2 min-w-[90px]">
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        掲載: {notice.date}
                      </span>
                      <div className="w-24 h-24 bg-white border border-slate-200 rounded-md p-1 flex items-center justify-center overflow-hidden shadow-sm">
                        {qrCodes[notice.id] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={qrCodes[notice.id]} alt="QR Code" className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-full h-full bg-slate-50 animate-pulse" />
                        )}
                      </div>
                    </div>

                    {/* 右側: 情報エリア */}
                    <div className="flex-1 flex flex-col h-full py-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Avatar className="h-6 w-6 border border-slate-200">
                          {/* 掲示板は一旦ランダムアバターのまま（必要ならロゴなどに変更可） */}
                          <AvatarImage src={getAvatarUrl(notice.id + 10)} />
                          <AvatarFallback className="text-[10px] bg-slate-50">{notice.labName[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-bold text-slate-500">{notice.labName}</span>
                      </div>
                      
                      <p className="text-base font-bold text-slate-800 leading-snug mb-auto line-clamp-3">
                        {notice.title}
                      </p>
                      
                      <div className="mt-4 flex items-center">
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                           期限：{notice.deadline}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CarouselList>

          </div>
        </main>
      </div>
    </div>
  );
}