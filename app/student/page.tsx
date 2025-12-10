"use client";

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { CarouselList } from "@/components/student/CarouselList";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil, Megaphone, Eye, User, ThumbsUp, MessageSquare, Grip } from "lucide-react"; 
import { useState, useEffect } from "react";
import QRCode from "qrcode";

// ==========================================
// Types
// ==========================================

interface Post {
  id: number;
  labName: string;
  authorName: string;
  content: string;
  isViewedByTeacher: boolean;
  isAnonymous?: boolean;
  isMyPost?: boolean;
  likeCount: number;
  likedByMe?: boolean;
}

interface Notice {
  id: number;
  date: string;
  labName: string;
  title: string;
  deadline: string;
  url: string;
}

// --- Helper: アバター画像のパスを返す関数 (修正版) ---
// 自分(高橋 由華)は固定で01、それ以外は02, 03, 04をランダムっぽく割り当てる
const getAvatarUrl = (id: number, isMyPost: boolean = false) => {
  if (isMyPost) {
    return "/avatars/01.jpg";
  }
  // 02, 03, 04 の3種類をローテーション (idを使って決定)
  const num = ((id % 3) + 2); 
  return `/avatars/0${num}.jpg`;
};

export default function StudentPage() {
  const [qrCodes, setQrCodes] = useState<Record<number, string>>({});
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

  // ダミーデータ: 注目投稿
  // ※ isMyPost フラグを追加してアバター判定に使用
  const featuredPosts: Post[] = [
    { id: 1, labName: "メディアラボ", authorName: "佐藤 優", content: "文化祭のポスターデザインについて、色使いの心理的効果を調べてみた。青色は信頼感を与えるらしい。", isViewedByTeacher: true, likeCount: 12 },
    { id: 2, labName: "工学ラボ", authorName: "匿名", content: "3Dプリンターのフィラメント詰まりを解消する方法を試行錯誤した結果、温度設定が鍵だとわかった。", isViewedByTeacher: true, isAnonymous: true, likeCount: 8 },
    { id: 3, labName: "文化教育ラボ", authorName: "匿名", content: "地元の伝統行事について聞き取り調査を行った。意外な歴史的背景が見えてきて面白い。", isViewedByTeacher: false, isAnonymous: true, likeCount: 5 },
    { id: 4, labName: "サイエンスラボ", authorName: "佐藤 健太", content: "川の水質調査を実施。上流と下流でのpH値の変化をグラフにまとめたところ、有意な差が見られた。", isViewedByTeacher: true, likeCount: 15 },
    { id: 5, labName: "国際ゼミ", authorName: "鈴木 花子", content: "模擬国連に向けて、各国の食糧問題に関するスタンスをリサーチ中。各国の利害関係が複雑。", isViewedByTeacher: false, likeCount: 3 },
    { id: 6, labName: "地域ビジネス", authorName: "田中 太郎", content: "商店街の空き店舗活用アイデアをブレインストーミング。高校生向けのカフェという案が出ている。", isViewedByTeacher: true, likeCount: 20 },
    { id: 7, labName: "フィジカルラボ", authorName: "匿名", content: "効率的な筋力トレーニングのセット数について論文を読んだ。週3回の頻度が最適らしい。", isViewedByTeacher: false, isAnonymous: true, likeCount: 7 },
    { id: 8, labName: "社会科学ゼミ", authorName: "山田 次郎", content: "SNSの利用時間と学習意欲の相関関係についてアンケートを作成中。Googleフォーム便利。", isViewedByTeacher: true, likeCount: 9 },
  ];

  // ダミーデータ: すべての投稿
  const allPostsDummy: Post[] = [
    { id: 101, labName: "メディアラボ", authorName: "髙橋 由華", content: "運動は本当にストレス発散に効果的なのか？\n\n【何をやってみた？】課題設定のために、3つのテーマについて現状のリサーチがどこまで進んでいるかをAIと論文などを使いながら調査しました。\n\n【なぜそれをやってみた？】AIを使った方が抜け漏れがないと思いました。答えが出ているテーマだと良くないと聞いたので。", isViewedByTeacher: true, isMyPost: true, likeCount: 13 },
    { id: 102, labName: "地域ビジネスゼミ", authorName: "田中 太郎", content: "商店街のシャッター通り化についての意識調査アンケートを実施しました。\n\n予想以上に「駐車場がないから行かない」という回答が多く、車社会の地方都市ならではの課題だと感じました。次は空き地を駐車場として活用している事例がないか調べてみます。", isViewedByTeacher: true, isMyPost: false, likeCount: 5 },
    { id: 103, labName: "国際ゼミ", authorName: "鈴木 花子", content: "フェアトレードコーヒーの飲み比べイベントを企画中。\n\nどの豆を使えば高校生でも飲みやすいか、先生たちに試飲してもらいました。「酸味が少ない方がいい」という意見が多かったので、深煎りの豆を中心に探してみます。", isViewedByTeacher: true, isMyPost: false, likeCount: 8, likedByMe: true }, 
    { id: 104, labName: "工学ラボ", authorName: "佐藤 健太", content: "Arduinoを使った自動水やり機の試作機が完成！\n\n土壌センサーの値が一定以下になるとポンプが動く仕組み。でも、水が出すぎて鉢から溢れてしまった...。水が出る時間を短くするプログラム修正が必要。", isViewedByTeacher: false, isMyPost: false, likeCount: 10 },
    { id: 105, labName: "サイエンスラボ", authorName: "匿名", content: "学校の裏山で見つけた謎の粘菌。\n\n写真を撮ってGoogleレンズで検索してみたけど、種類が特定できない。専門の図鑑が必要かも。明日、生物の先生に聞いてみることにする。", isViewedByTeacher: true, isAnonymous: true, isMyPost: false, likeCount: 3 },
    { id: 106, labName: "文化教育ラボ", authorName: "山田 次郎", content: "地元の民話「カッパの詫び証文」について図書館で文献調査。\n\n実は似たような話が隣町にもあることが判明。川の氾濫と関係があるのかもしれない。次はハザードマップと照らし合わせてみる。", isViewedByTeacher: true, isMyPost: false, likeCount: 7 },
    { id: 107, labName: "フィジカルラボ", authorName: "匿名", content: "部活の練習メニューにHIIT（高強度インターバルトレーニング）を取り入れてみた。\n\nみんな「キツイけど短時間で終わるからいい」と好評。心拍数の変化を記録して、効果を検証したい。", isViewedByTeacher: false, isAnonymous: true, isMyPost: false, likeCount: 12 },
    { id: 108, labName: "社会科学ゼミ", authorName: "伊藤 桃子", content: "「なぜ若者は選挙に行かないのか」クラスメイト30人にインタビュー。\n\n「投票所が遠い」「誰に入れても変わらない」という意見多数。ネット投票が導入されたら投票するかどうかも聞いてみたい。", isViewedByTeacher: true, isMyPost: false, likeCount: 6 },
    { id: 109, labName: "メディカルラボ", authorName: "加藤 浩", content: "睡眠の質と日中の集中力の関係について、ウェアラブル端末を使って自己実験中。\n\n寝る前のスマホをやめた日は、深い睡眠の時間が20%増えている！授業中の眠気も減った気がする。", isViewedByTeacher: true, isMyPost: false, likeCount: 9 },
    { id: 110, labName: "地域ビジネスゼミ", authorName: "吉田 拓也", content: "地元の特産品「梨」を使った新しいスイーツ開発。\n\n梨の水分が多くて生地がべちゃっとしてしまうのが課題。ドライフルーツにしてから混ぜる方法を試してみようと思う。", isViewedByTeacher: false, isMyPost: false, likeCount: 4 },
    { id: 111, labName: "1-1 地域共創", authorName: "新入生A", content: "初めてのフィールドワーク。\n\n商店街の人に話しかけるのが緊張したけど、みんな優しくて安心した。昔の街並みの写真を見せてもらって、今と全然違うことに驚いた。", isViewedByTeacher: true, isMyPost: false, likeCount: 15 },
    { id: 112, labName: "メディアラボ", authorName: "髙橋 由華", content: "動画編集ソフトの使い分けについて検証。\n\nCapCutは手軽だけど、Premiere Proの方が細かい調整ができる。目的に応じて使い分けるのが良さそう。ショート動画ならCapCut一択かな。", isViewedByTeacher: false, isMyPost: true, likeCount: 2 },
    { id: 113, labName: "工学ラボ", authorName: "匿名", content: "ドローンの自動飛行プログラミングに挑戦。\n\n障害物回避のアルゴリズムが難しい。Pythonのライブラリを使っているけど、エラーが消えない...。週末に詳しい先輩に聞く予定。", isViewedByTeacher: false, isAnonymous: true, isMyPost: false, likeCount: 5 },
    { id: 114, labName: "国際ゼミ", authorName: "渡辺 梨沙", content: "海外の姉妹校とのオンライン交流会に向けたプレゼン資料作成。\n\n日本の学校生活を紹介するスライド。写真多めで、英語はシンプルにすることを意識している。Canvaのデザインが可愛くて楽しい。", isViewedByTeacher: true, isMyPost: false, likeCount: 11 },
    { id: 115, labName: "サイエンスラボ", authorName: "松本 潤", content: "スライムの硬さとホウ砂の量の関係をグラフ化。\n\n綺麗な比例関係にはならなかった。温度や湿度も影響しているのかも？条件を揃えて再実験が必要。", isViewedByTeacher: true, isMyPost: false, likeCount: 6 },
    { id: 116, labName: "文化教育ラボ", authorName: "井上 陽子", content: "着物の端切れを使ったリメイク小物の制作。\n\nコースターとしおりを作ってみた。文化祭で販売して、売上を寄付する計画。デザインのバリエーションを増やしたい。", isViewedByTeacher: false, isMyPost: false, likeCount: 8 },
    { id: 117, labName: "社会科学ゼミ", authorName: "匿名", content: "ジェンダーレス制服についての意識調査。\n\n女子のスラックス導入について、意外と男子生徒からも肯定的意見が多かった。機能性を重視する声が目立つ。", isViewedByTeacher: true, isAnonymous: true, isMyPost: false, likeCount: 14 },
    { id: 118, labName: "フィジカルラボ", authorName: "木村 拓哉", content: "プロテインの味と飲みやすさの比較。\n\n水で割るか牛乳で割るかで全然違う。継続するには味が重要だと痛感。コスパも含めてランキング表を作成中。", isViewedByTeacher: false, isMyPost: false, likeCount: 3 },
    { id: 119, labName: "1-2 地域共創", authorName: "新入生B", content: "地域のゴミ拾いボランティアに参加。\n\nタバコの吸殻が一番多かった。ポイ捨てを減らすためのナッジ（行動経済学的な仕掛け）について調べてみたいと思った。", isViewedByTeacher: true, isMyPost: false, likeCount: 10 },
    { id: 120, labName: "メディアラボ", authorName: "斎藤 飛鳥", content: "学校のPR動画の絵コンテ作成。\n\n「青春」をテーマに、屋上や体育館でのシーンを入れたい。BGMの著作権フリー素材探しに苦戦中。", isViewedByTeacher: true, isMyPost: false, likeCount: 7 },
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

    const initialLiked = new Set<number>();
    allPostsDummy.forEach(post => {
      if (post.likedByMe) initialLiked.add(post.id);
    });
    setLikedPosts(initialLiked);
  }, []);

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Post submitted (Mock)");
  };

  const handleLike = (postId: number) => {
    const newLiked = new Set(likedPosts);
    const isLiked = newLiked.has(postId);

    if (isLiked) {
      newLiked.delete(postId);
      console.log(`Unliked post ${postId}`);
    } else {
      newLiked.add(postId);
      console.log(`Liked post ${postId}`);
    }
    setLikedPosts(newLiked);
  };

  return (
    <div className="flex h-screen bg-background font-sans overflow-hidden">
      
      <Sidebar userRole="student" className="hidden md:flex flex-col h-full shrink-0" />

      <div className="flex-1 flex flex-col h-full min-w-0">
        <Header />

        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8">
          <div className="w-full max-w-[1600px] mx-auto space-y-12 pb-20">
            
            <Card className="border border-slate-200 shadow-sm bg-white hover:border-primary/30 transition-colors">
              <CardContent className="p-3">
                <form onSubmit={handlePostSubmit} className="flex items-center gap-4 px-2 py-1">
                  <Avatar className="h-12 w-12 border-2 border-slate-100">
                    {/* 自分のアバターは固定で01 */}
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
                        {/* 注目投稿もIDでアバターを出し分ける */}
                        {!post.isAnonymous && <AvatarImage src={getAvatarUrl(post.id, post.isMyPost)} />}
                        <AvatarFallback className="bg-slate-100 text-slate-400">
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
                    <div className="flex flex-col items-center gap-2 min-w-[90px]">
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        掲載: {notice.date}
                      </span>
                      <div className="w-24 h-24 bg-white border border-slate-200 rounded-md p-1 flex items-center justify-center overflow-hidden shadow-sm">
                        {qrCodes[notice.id] ? (
                          <img src={qrCodes[notice.id]} alt="QR Code" className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-full h-full bg-slate-50 animate-pulse" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col h-full py-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Avatar className="h-6 w-6 border border-slate-200">
                          {/* 掲示板用アバターロジック */}
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

            <section className="w-full py-4">
              <div className="flex items-end justify-between mb-4 px-1">
                <div className="flex items-center gap-3">
                  <span className="text-3xl"><Grip className="h-8 w-8 text-primary/80" /></span> 
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
                      すべての &quot;やってみた&quot;
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">みんなの試行錯誤を見てみよう</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {allPostsDummy.map((post) => {
                  const isLiked = likedPosts.has(post.id);
                  const currentLikeCount = post.likeCount + (isLiked && !post.likedByMe ? 1 : 0) - (!isLiked && post.likedByMe ? 1 : 0);

                  return (
                    <Card 
                      key={post.id} 
                      className={`
                        h-full border bg-white transition-all duration-300 flex flex-col
                        ${post.isMyPost ? "border-primary/40 bg-primary/5" : "border-slate-200 hover:border-primary hover:shadow-md cursor-pointer"}
                      `}
                    >
                      <CardContent className="p-6 flex-1 flex flex-col space-y-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-12 w-12 border border-slate-200 bg-white">
                            {!post.isAnonymous && <AvatarImage src={getAvatarUrl(post.id, post.isMyPost)} />}
                            <AvatarFallback className="bg-slate-100 text-slate-400">
                              {post.isAnonymous ? <User className="h-6 w-6" /> : post.labName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs font-bold text-slate-500 mb-0.5">{post.labName}</p>
                            <p className="font-bold text-base text-slate-900">{post.authorName}</p>
                            <div className="text-[10px] text-slate-400 mt-0.5">12月10日</div>
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-bold text-sm text-slate-800 mb-2 line-clamp-2 min-h-[1.25rem]">
                            {post.content.includes('\n') ? post.content.split('\n')[0] : ''} 
                          </h3>
                          <p className="text-xs text-slate-600 leading-relaxed line-clamp-4 whitespace-pre-wrap">
                            {post.content}
                          </p>
                          <div className="mt-2 text-xs text-primary/80 font-medium cursor-pointer hover:underline">
                            詳細を表示
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                          <div className="flex gap-4">
                            {post.isMyPost ? (
                              <div className="flex items-center gap-1.5 text-orange-500 font-bold text-sm" title="あなたの投稿へのいいね数">
                                <ThumbsUp className="h-4 w-4 fill-current" />
                                <span>{post.likeCount}</span>
                              </div>
                            ) : (
                              <button 
                                onClick={() => handleLike(post.id)}
                                className={`
                                  flex items-center gap-1.5 transition-colors group
                                  ${isLiked ? "text-orange-500 font-bold" : "text-slate-400 hover:text-orange-500"}
                                `}
                              >
                                <ThumbsUp className={`h-4 w-4 transition-transform ${isLiked ? "fill-current scale-110" : "group-hover:scale-110"}`} />
                                <span className="text-xs">{currentLikeCount}</span>
                              </button>
                            )}

                            <div className="flex items-center gap-1.5 text-slate-400">
                              <MessageSquare className="h-4 w-4" />
                              <span className="text-xs">0</span>
                            </div>
                          </div>

                          {post.isViewedByTeacher && (
                             <div className="flex items-center text-primary/80" title="先生が確認しました">
                               <Eye className="h-5 w-5" />
                             </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}