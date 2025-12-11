"use client";

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { CarouselList } from "@/components/student/CarouselList";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea"; // 追加
import { 
  Pencil, Megaphone, Eye, User, ThumbsUp, MessageSquare, Grip, 
  X, Check, Sparkles, ChevronDown, ChevronUp 
} from "lucide-react"; 
import { useState, useEffect, useRef } from "react";
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
  // 新着演出用のフラグを追加
  isNew?: boolean; 
  // 詳細表示用に画像から読み取ったフィールドを追加（オプショナル）
  theme?: string;
  phases?: string[];
  questionState?: string;
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

// ==========================================
// Components: ThankYouModal
// ==========================================
function ThankYouModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 text-center transform animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border-2 border-slate-100 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
        
        <div className="mb-6 flex justify-center">
           {/* クラッカーのような演出アイコン */}
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

export default function StudentPage() {
  const [qrCodes, setQrCodes] = useState<Record<number, string>>({});
  
  // ダミーデータ: 注目投稿
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

  // State管理
  // 初期値にallPostsDummyを使用することで、既存データを維持しつつ新規追加に対応
  const [posts, setPosts] = useState<Post[]>(allPostsDummy);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

  // フォームUI用のState
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  
  // フォーム入力値用のState (PDFの入力項目に合わせて作成)
  const [selectedPhases, setSelectedPhases] = useState<string[]>([]);
  const [themeInput, setThemeInput] = useState("");
  const [content1, setContent1] = useState("");
  const [content2, setContent2] = useState("");
  const [content3, setContent3] = useState("");
  const [questionState, setQuestionState] = useState("");
  const [isNamePublic, setIsNamePublic] = useState(false); // 「氏名を公開する」

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
    posts.forEach(post => {
      if (post.likedByMe) initialLiked.add(post.id);
    });
    setLikedPosts(initialLiked);
  }, []);

  // 投稿ハンドラ
  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content1.trim()) return;

    // 現在の日付を取得
    const today = new Date();
    const dateString = `${today.getMonth() + 1}月${today.getDate()}日`;

    // 新しい投稿オブジェクトを作成
    const newPost: Post = {
      id: Date.now(), // 一時的なID
      labName: "メディアラボ", 
      authorName: isNamePublic ? "髙橋 由華" : "匿名", // チェックがあれば実名
      content: [content1, content2, content3].filter(Boolean).join("\n\n"), // 複数の入力を結合
      isViewedByTeacher: false,
      isAnonymous: !isNamePublic,
      isMyPost: true,
      likeCount: 0,
      isNew: true, // ★ 新着演出フラグ
      // 拡張フィールド
      phases: selectedPhases,
      theme: themeInput,
      questionState: questionState
    };

    // リストの先頭に追加 (Optimistic Update)
    setPosts([newPost, ...posts]);
    
    // フォームをリセットして閉じる
    setContent1(""); setContent2(""); setContent3("");
    setThemeInput(""); setSelectedPhases([]); setQuestionState("");
    setIsNamePublic(false);
    setIsFormExpanded(false);
    
    // サンキューポップアップ表示
    setShowThankYou(true);
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

  // フェーズ選択のトグル
  const togglePhase = (phase: string) => {
    if (selectedPhases.includes(phase)) {
      setSelectedPhases(selectedPhases.filter(p => p !== phase));
    } else {
      setSelectedPhases([...selectedPhases, phase]);
    }
  };

  return (
    <div className="flex h-screen bg-background font-sans overflow-hidden">
      
      {/* サンキューポップアップ */}
      <ThankYouModal open={showThankYou} onClose={() => setShowThankYou(false)} />

      <Sidebar userRole="student" className="hidden md:flex flex-col h-full shrink-0" />

      <div className="flex-1 flex flex-col h-full min-w-0">
        <Header />

        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8">
          <div className="w-full max-w-[1600px] mx-auto space-y-12 pb-20">
            
            {/* 
              ==========================================
              投稿フォームエリア（PDF再現）
              ==========================================
            */}
            <Card className={`
              border shadow-sm bg-white overflow-hidden transition-all duration-300 ease-in-out
              ${isFormExpanded ? "border-primary/50 ring-1 ring-primary/20 shadow-md" : "border-slate-200 hover:border-primary/30"}
            `}>
              <CardContent className="p-0">
                {/* 1. 閉じた状態（1行のInput風） */}
                {!isFormExpanded && (
                  <div 
                    onClick={() => setIsFormExpanded(true)}
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
                )}

                {/* 2. 開いた状態（詳細フォーム） */}
                {isFormExpanded && (
                  <form onSubmit={handlePostSubmit} className="flex flex-col animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex p-6 gap-6">
                      {/* 左側：アバター */}
                      <div className="shrink-0">
                        <Avatar className="h-14 w-14 border-2 border-slate-100">
                          <AvatarImage src="/avatars/01.jpg" alt="My Avatar" />
                          <AvatarFallback>私</AvatarFallback>
                        </Avatar>
                      </div>

                      {/* 右側：入力フィールド群 */}
                      <div className="flex-1 space-y-6">
                        
                        {/* フェーズ選択 */}
                        <div className="space-y-2 relative">
                           <div className="flex justify-between items-center">
                             <label className="text-sm font-bold text-slate-800">
                               現在の探究学習のフェーズを教えてください。<span className="text-xs font-normal text-slate-500 ml-2">(複数選択可)</span>
                             </label>
                             <button type="button" onClick={() => setIsFormExpanded(false)} className="text-xs text-primary font-bold hover:underline">
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

                        {/* テーマ・問い */}
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

                        {/* やってみた内容（3段構成） */}
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
                               placeholder="例：今日少し調べたこと、チームで話したこと、試しにやってみたこと"
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

                    {/* 下部アクションバー */}
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
                {posts.map((post) => {
                  const isLiked = likedPosts.has(post.id);
                  const currentLikeCount = post.likeCount + (isLiked && !post.likedByMe ? 1 : 0) - (!isLiked && post.likedByMe ? 1 : 0);
                  const postDate = post.isNew ? "12月18日" : "12月10日"; // デモ用日付

                  return (
                    <Card 
                      key={post.id} 
                      className={`
                        h-full flex flex-col transition-all duration-300 relative overflow-hidden
                        ${post.isNew 
                          ? "border-2 border-yellow-400 bg-white shadow-[0_0_20px_rgba(250,204,21,0.25)] animate-in slide-in-from-top-4 fade-in zoom-in-95" 
                          : post.isMyPost 
                            ? "border border-primary/40 bg-primary/5" 
                            : "border border-slate-200 bg-white hover:border-primary hover:shadow-md cursor-pointer"}
                      `}
                    >
                      {/* キラーん演出：新着バッジ */}
                      {post.isNew && (
                        <div className="absolute top-0 left-0">
                           <span className="inline-flex items-center justify-center px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] font-bold tracking-wider shadow-md rounded-br-lg">
                             New ✨
                           </span>
                        </div>
                      )}

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
                            <div className="text-[10px] text-slate-400 mt-0.5">{postDate}</div>
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          {/* 問いがある場合はタイトルとして表示（新着投稿用） */}
                          {post.theme && (
                            <h3 className="font-bold text-sm text-slate-900 mb-2 leading-tight">
                              {post.theme}
                            </h3>
                          )}
                          {/* ダミーデータの場合は改行の最初をタイトル風に */}
                          {!post.theme && (
                            <h3 className="font-bold text-sm text-slate-800 mb-2 line-clamp-2 min-h-[1.25rem]">
                              {post.content.includes('\n') ? post.content.split('\n')[0] : ''} 
                            </h3>
                          )}

                          <p className="text-xs text-slate-600 leading-relaxed line-clamp-4 whitespace-pre-wrap">
                            {post.content}
                          </p>
                          <div className="mt-2 text-xs text-primary/80 font-medium cursor-pointer hover:underline flex items-center gap-1">
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