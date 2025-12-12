// ask-front-i/app/student/page.tsx

"use client";

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { CarouselList } from "@/components/student/CarouselList";
import { Grip, ArrowUp } from "lucide-react"; 
import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { PostForm } from "@/components/student/PostForm";
import { FeaturedPostCard, NoticeCard, StandardPostCard } from "@/components/student/StudentPostCards";
import { PostDetailModal } from "@/components/student/PostDetailModal";
import { FeatureInfoModal } from "@/components/student/FeatureInfoModal";
import { Button } from "@/components/ui/button";
import { ThanksLetterView } from "@/components/student/ThanksLetterView";

// ==========================================
// Types
// [Backend Integration] 本来は /types/index.ts などで定義し、APIのレスポンス型と合わせる
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
  isNew?: boolean; 
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

export default function StudentPage() {
  const [qrCodes, setQrCodes] = useState<Record<number, string>>({});
  
  // 画面切り替え用のState ('home' = 投稿一覧, 'thanks' = 感謝の手紙)
  const [currentView, setCurrentView] = useState<"home" | "thanks">("home");

  // 感謝の手紙の残り枚数 (初期値3)
  const [thanksCount, setThanksCount] = useState(3);

  // ==========================================
  // Dummy Data
  // [Backend Integration] ここは将来的に API (/api/posts/featured 等) から取得する
  // ==========================================
  const featuredPosts: Post[] = [
    { id: 1, labName: "メディアラボ", authorName: "佐藤 優", content: "文化祭のポスターデザインについて、色使いの心理的効果を調べてみた。青色は信頼感を与えるらしい。", isViewedByTeacher: true, likeCount: 12, theme: "色が人に与える心理的影響", phases: ["調査・分析"], questionState: "問いの検証が進んだ" },
    { id: 2, labName: "工学ラボ", authorName: "匿名", content: "3Dプリンターのフィラメント詰まりを解消する方法を試行錯誤した結果、温度設定が鍵だとわかった。", isViewedByTeacher: true, isAnonymous: true, likeCount: 8, theme: "3Dプリンターの出力安定化", phases: ["実験・調査"], questionState: "周辺の準備作業をした" },
    { id: 3, labName: "文化教育ラボ", authorName: "匿名", content: "地元の伝統行事について聞き取り調査を行った。意外な歴史的背景が見えてきて面白い。", isViewedByTeacher: false, isAnonymous: true, likeCount: 5, theme: "地域伝統の継承理由", phases: ["情報収集"], questionState: "問いが深まった・変化した" },
    { id: 4, labName: "サイエンスラボ", authorName: "佐藤 健太", content: "川の水質調査を実施。上流と下流でのpH値の変化をグラフにまとめたところ、有意な差が見られた。", isViewedByTeacher: true, likeCount: 15, theme: "河川環境の変化要因", phases: ["分析", "発表準備"], questionState: "問いの検証が進んだ" },
    { id: 5, labName: "国際ゼミ", authorName: "鈴木 花子", content: "模擬国連に向けて、各国の食糧問題に関するスタンスをリサーチ中。各国の利害関係が複雑。", isViewedByTeacher: false, likeCount: 3, theme: "国際的な食糧不均衡", phases: ["情報収集"], questionState: "問いが深まった・変化した" },
    { id: 6, labName: "地域ビジネス", authorName: "田中 太郎", content: "商店街の空き店舗活用アイデアをブレインストーミング。高校生向けのカフェという案が出ている。", isViewedByTeacher: true, likeCount: 20, theme: "シャッター商店街の再生", phases: ["テーマ設定", "課題設定"], questionState: "問いが深まった・変化した" },
    { id: 7, labName: "フィジカルラボ", authorName: "匿名", content: "効率的な筋力トレーニングのセット数について論文を読んだ。週3回の頻度が最適らしい。", isViewedByTeacher: false, isAnonymous: true, likeCount: 7, theme: "効率的な筋肥大メカニズム", phases: ["情報収集"], questionState: "周辺の準備作業をした" },
    { id: 8, labName: "社会科学ゼミ", authorName: "山田 次郎", content: "SNSの利用時間と学習意欲の相関関係についてアンケートを作成中。Googleフォーム便利。", isViewedByTeacher: true, likeCount: 9, theme: "SNSと学力の相関", phases: ["実験・調査"], questionState: "周辺の準備作業をした" },
  ];

  // [Backend Integration] ここは将来的に API (/api/posts 等) から取得する
  const allPostsDummy: Post[] = [
    { id: 101, labName: "メディアラボ", authorName: "髙橋 由華", content: "運動は本当にストレス発散に効果的なのか？\n\n【何をやってみた？】課題設定のために、3つのテーマについて現状のリサーチがどこまで進んでいるかをAIと論文などを使いながら調査しました。\n\n【なぜそれをやってみた？】AIを使った方が抜け漏れがないと思いました。答えが出ているテーマだと良くないと聞いたので。", isViewedByTeacher: true, isMyPost: true, likeCount: 13, theme: "ストレスと運動の科学的関係", phases: ["テーマ設定", "情報収集"], questionState: "問いが深まった・変化した" },
    { id: 102, labName: "地域ビジネスゼミ", authorName: "田中 太郎", content: "商店街のシャッター通り化についての意識調査アンケートを実施しました。\n\n予想以上に「駐車場がないから行かない」という回答が多く、車社会の地方都市ならではの課題だと感じました。次は空き地を駐車場として活用している事例がないか調べてみます。", isViewedByTeacher: true, isMyPost: false, likeCount: 5, theme: "地方都市における商店街活性化", phases: ["実験・調査", "分析"], questionState: "問いが深まった・変化した" },
    { id: 103, labName: "国際ゼミ", authorName: "鈴木 花子", content: "フェアトレードコーヒーの飲み比べイベントを企画中。\n\nどの豆を使えば高校生でも飲みやすいか、先生たちに試飲してもらいました。「酸味が少ない方がいい」という意見が多かったので、深煎りの豆を中心に探してみます。", isViewedByTeacher: true, isMyPost: false, likeCount: 8, likedByMe: true, theme: "フェアトレードの普及啓発", phases: ["実験・調査"], questionState: "周辺の準備作業をした" }, 
    { id: 104, labName: "工学ラボ", authorName: "佐藤 健太", content: "Arduinoを使った自動水やり機の試作機が完成！\n\n土壌センサーの値が一定以下になるとポンプが動く仕組み。でも、水が出すぎて鉢から溢れてしまった...。水が出る時間を短くするプログラム修正が必要。", isViewedByTeacher: false, isMyPost: false, likeCount: 10, theme: "植物育成の自動化システム", phases: ["実験・調査", "分析"], questionState: "問いの検証が進んだ" },
    { id: 105, labName: "サイエンスラボ", authorName: "匿名", content: "学校の裏山で見つけた謎の粘菌。\n\n写真を撮ってGoogleレンズで検索してみたけど、種類が特定できない。専門の図鑑が必要かも。明日、生物の先生に聞いてみることにする。", isViewedByTeacher: true, isAnonymous: true, isMyPost: false, likeCount: 3, theme: "身近な生態系の調査", phases: ["情報収集"], questionState: "周辺の準備作業をした" },
    { id: 106, labName: "文化教育ラボ", authorName: "山田 次郎", content: "地元の民話「カッパの詫び証文」について図書館で文献調査。\n\n実は似たような話が隣町にもあることが判明。川の氾濫と関係があるのかもしれない。次はハザードマップと照らし合わせてみる。", isViewedByTeacher: true, isMyPost: false, likeCount: 7, theme: "民話と災害の関連性", phases: ["情報収集", "分析"], questionState: "問いが深まった・変化した" },
    { id: 107, labName: "フィジカルラボ", authorName: "匿名", content: "部活の練習メニューにHIIT（高強度インターバルトレーニング）を取り入れてみた。\n\nみんな「キツイけど短時間で終わるからいい」と好評。心拍数の変化を記録して、効果を検証したい。", isViewedByTeacher: false, isAnonymous: true, isMyPost: false, likeCount: 12, theme: "短時間トレーニングの効果検証", phases: ["実験・調査"], questionState: "問いの検証が進んだ" },
    { id: 108, labName: "社会科学ゼミ", authorName: "伊藤 桃子", content: "「なぜ若者は選挙に行かないのか」クラスメイト30人にインタビュー。\n\n「投票所が遠い」「誰に入れても変わらない」という意見多数。ネット投票が導入されたら投票するかどうかも聞いてみたい。", isViewedByTeacher: true, isMyPost: false, likeCount: 6, theme: "若者の政治参加意識", phases: ["実験・調査", "分析"], questionState: "問いが深まった・変化した" },
    { id: 109, labName: "メディカルラボ", authorName: "加藤 浩", content: "睡眠の質と日中の集中力の関係について、ウェアラブル端末を使って自己実験中。\n\n寝る前のスマホをやめた日は、深い睡眠の時間が20%増えている！授業中の眠気も減った気がする。", isViewedByTeacher: true, isMyPost: false, likeCount: 9, theme: "睡眠の質とパフォーマンス", phases: ["実験・調査", "分析"], questionState: "問いの検証が進んだ" },
    { id: 110, labName: "地域ビジネスゼミ", authorName: "吉田 拓也", content: "地元の特産品「梨」を使った新しいスイーツ開発。\n\n梨の水分が多くて生地がべちゃっとしてしまうのが課題。ドライフルーツにしてから混ぜる方法を試してみようと思う。", isViewedByTeacher: false, isMyPost: false, likeCount: 4, theme: "特産品を活用した商品開発", phases: ["実験・調査"], questionState: "周辺の準備作業をした" },
    { id: 111, labName: "1-1 地域共創", authorName: "新入生A", content: "初めてのフィールドワーク。\n\n商店街の人に話しかけるのが緊張したけど、みんな優しくて安心した。昔の街並みの写真を見せてもらって、今と全然違うことに驚いた。", isViewedByTeacher: true, isMyPost: false, likeCount: 15, theme: "地域の歴史と現状", phases: ["情報収集"], questionState: "問いが深まった・変化した" },
    { id: 112, labName: "メディアラボ", authorName: "髙橋 由華", content: "動画編集ソフトの使い分けについて検証。\n\nCapCutは手軽だけど、Premiere Proの方が細かい調整ができる。目的に応じて使い分けるのが良さそう。ショート動画ならCapCut一択かな。", isViewedByTeacher: false, isMyPost: true, likeCount: 2, theme: "動画編集ツールの最適化", phases: ["実験・調査"], questionState: "周辺の準備作業をした" },
    { id: 113, labName: "工学ラボ", authorName: "匿名", content: "ドローンの自動飛行プログラミングに挑戦。\n\n障害物回避のアルゴリズムが難しい。Pythonのライブラリを使っているけど、エラーが消えない...。週末に詳しい先輩に聞く予定。", isViewedByTeacher: false, isAnonymous: true, isMyPost: false, likeCount: 5, theme: "ドローン制御アルゴリズム", phases: ["実験・調査"], questionState: "周辺の準備作業をした" },
    { id: 114, labName: "国際ゼミ", authorName: "渡辺 梨沙", content: "海外の姉妹校とのオンライン交流会に向けたプレゼン資料作成。\n\n日本の学校生活を紹介するスライド。写真多めで、英語はシンプルにすることを意識している。Canvaのデザインが可愛くて楽しい。", isViewedByTeacher: true, isMyPost: false, likeCount: 11, theme: "日本文化の発信", phases: ["発表準備"], questionState: "周辺の準備作業をした" },
    { id: 115, labName: "サイエンスラボ", authorName: "松本 潤", content: "スライムの硬さとホウ砂の量の関係をグラフ化。\n\n綺麗な比例関係にはならなかった。温度や湿度も影響しているのかも？条件を揃えて再実験が必要。", isViewedByTeacher: true, isMyPost: false, likeCount: 6, theme: "物質の特性変化", phases: ["分析"], questionState: "問いの検証が進んだ" },
    { id: 116, labName: "文化教育ラボ", authorName: "井上 陽子", content: "着物の端切れを使ったリメイク小物の制作。\n\nコースターとしおりを作ってみた。文化祭で販売して、売上を寄付する計画。デザインのバリエーションを増やしたい。", isViewedByTeacher: false, isMyPost: false, likeCount: 8, theme: "伝統文化の現代的活用", phases: ["実験・調査"], questionState: "周辺の準備作業をした" },
    { id: 117, labName: "社会科学ゼミ", authorName: "匿名", content: "ジェンダーレス制服についての意識調査。\n\n女子のスラックス導入について、意外と男子生徒からも肯定的意見が多かった。機能性を重視する声が目立つ。", isViewedByTeacher: true, isAnonymous: true, isMyPost: false, likeCount: 14, theme: "制服とジェンダー意識", phases: ["分析"], questionState: "問いが深まった・変化した" },
    { id: 118, labName: "フィジカルラボ", authorName: "木村 拓哉", content: "プロテインの味と飲みやすさの比較。\n\n水で割るか牛乳で割るかで全然違う。継続するには味が重要だと痛感。コスパも含めてランキング表を作成中。", isViewedByTeacher: false, isMyPost: false, likeCount: 3, theme: "栄養摂取の継続性", phases: ["実験・調査"], questionState: "周辺の準備作業をした" },
    { id: 119, labName: "1-2 地域共創", authorName: "新入生B", content: "地域のゴミ拾いボランティアに参加。\n\nタバコの吸殻が一番多かった。ポイ捨てを減らすためのナッジ（行動経済学的な仕掛け）について調べてみたいと思った。", isViewedByTeacher: true, isMyPost: false, likeCount: 10, theme: "地域の美化と行動変容", phases: ["情報収集"], questionState: "問いが深まった・変化した" },
    { id: 120, labName: "メディアラボ", authorName: "斎藤 飛鳥", content: "学校のPR動画の絵コンテ作成。\n\n「青春」をテーマに、屋上や体育館でのシーンを入れたい。BGMの著作権フリー素材探しに苦戦中。", isViewedByTeacher: true, isMyPost: false, likeCount: 7, theme: "学校ブランディング", phases: ["発表準備"], questionState: "周辺の準備作業をした" },
  ];

  // [Backend Integration] ここは将来的に API (/api/notices 等) から取得する
  const notices: Notice[] = [
    { id: 1, date: "10/10", labName: "メディアラボ", title: "○○に関するアンケートのご協力お願いします！", deadline: "12/12", url: "https://forms.google.com/example1" },
    { id: 2, date: "10/15", labName: "工学ラボ", title: "ロボットコンテストの観戦者を募集しています", deadline: "12/17", url: "https://example.com/robot-contest" },
    { id: 3, date: "10/29", labName: "文化教育ゼミ", title: "地域ボランティアの参加者説明会について", deadline: "12/29", url: "https://example.com/volunteer" },
    { id: 4, date: "11/02", labName: "生徒会", title: "球技大会の種目希望アンケート", deadline: "11/15", url: "https://forms.google.com/ball-game" },
    { id: 5, date: "11/05", labName: "進路指導部", title: "冬期講習の申し込み開始のお知らせ", deadline: "11/20", url: "https://school.edu/winter-course" },
    { id: 6, date: "11/10", labName: "図書委員会", title: "読書感想文コンクールの作品募集", deadline: "11/30", url: "https://library.example.com/contest" },
  ];

  // State管理
  const [posts, setPosts] = useState<Post[]>(allPostsDummy);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  
  // モーダル用State
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showNoticeInfo, setShowNoticeInfo] = useState(false); 
  const [showCommentInfo, setShowCommentInfo] = useState(false); 

  // スクロールトップボタンの表示切替用
  const [showScrollTop, setShowScrollTop] = useState(false);
  const mainScrollRef = useRef<HTMLDivElement>(null);

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

    // [Backend Integration] ユーザーがいいねした投稿IDリストをAPIから取得してセットする
    const initialLiked = new Set<number>();
    posts.forEach(post => {
      if (post.likedByMe) initialLiked.add(post.id);
    });
    setLikedPosts(initialLiked);
  }, []);

  // 投稿ハンドラ
  const handlePostSubmit = (data: any) => {
    // [Backend Integration] ここで API (POST /api/posts) を叩いてDBに保存する
    // const response = await fetch('/api/posts', { method: 'POST', body: JSON.stringify(data) ... });
    
    // MVP: フロントエンドのStateのみ更新（リロードで消える）
    const newPost: Post = {
      id: Date.now(),
      labName: "メディアラボ", 
      authorName: data.isAnonymous ? "匿名" : "髙橋 由華",
      content: data.content,
      isViewedByTeacher: false,
      isAnonymous: data.isAnonymous,
      isMyPost: true,
      likeCount: 0,
      isNew: true,
      phases: data.phases,
      theme: data.theme,
      questionState: data.questionState
    };
    setPosts([newPost, ...posts]);
  };

  const handleLike = (postId: number) => {
    // [Backend Integration] ここで API (POST/DELETE /api/posts/{id}/like) を叩く
    const newLiked = new Set(likedPosts);
    if (newLiked.has(postId)) {
      newLiked.delete(postId);
    } else {
      newLiked.add(postId);
    }
    setLikedPosts(newLiked);
  };

  // スクロールイベントハンドラ
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop > 300) {
      setShowScrollTop(true);
    } else {
      setShowScrollTop(false);
    }
  };

  // トップへ戻る関数
  const scrollToTop = () => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // 画面遷移ハンドラ
  const handleNavigate = (view: "home" | "thanks") => {
    setCurrentView(view);
  };

  // 手紙送信完了時のハンドラ
  const handleThanksComplete = () => {
    setThanksCount((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="flex h-screen bg-background font-sans overflow-hidden">
      
      {/* 詳細モーダル (クリック時に表示) */}
      <PostDetailModal 
        post={selectedPost} 
        isOpen={!!selectedPost} 
        onClose={() => setSelectedPost(null)} 
        isLiked={selectedPost ? likedPosts.has(selectedPost.id) : false}
        onLike={handleLike}
      />

      {/* 掲示板用機能のお知らせモーダル */}
      <FeatureInfoModal 
        open={showNoticeInfo} 
        onClose={() => setShowNoticeInfo(false)}
        title="機能のお知らせ"
        description={<>MVP内では詳細は非表示ですが、<br/>フェーズ2で各ゼミのアンケートなどを<br/>ここに反映予定です。</>}
      />

      {/* コメント用機能のお知らせモーダル */}
      <FeatureInfoModal
        open={showCommentInfo}
        onClose={() => setShowCommentInfo(false)}
        title="機能のお知らせ"
        description={<>MVP内ではコメント機能は非表示ですが、<br /><strong>投稿数UP</strong>や<strong>生徒同士の情報共有</strong>を<br />促進するためにフェーズ2以降で実装予定です。</>}
      />

      {/* サイドバー: badgeCount を渡す */}
      <Sidebar 
        userRole="student" 
        className="hidden md:flex flex-col h-full shrink-0" 
        onNavigate={handleNavigate}
        badgeCount={thanksCount} 
      />

      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        {/* ヘッダー: badgeCount を渡す (スマホメニュー用) */}
        <Header onNavigate={handleNavigate} badgeCount={thanksCount} />

        <main 
          id="student-main-scroll"
          ref={mainScrollRef}
          onScroll={handleScroll}
          className={`flex-1 overflow-y-auto bg-slate-50/50 scroll-smooth ${currentView === 'home' ? 'p-4 md:p-8' : 'p-0'}`}
        >
          {currentView === "home" ? (
            // Home (Feed) View
            <div className="w-full max-w-[1600px] mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-left-4 duration-500"> 
              <PostForm onSubmit={handlePostSubmit} />

              <CarouselList 
                title="今週注目の &quot;やってみた&quot;" 
                subTitle="※AIが自動でピックアップしています"
                icon="👏"
              >
                {featuredPosts.map((post) => (
                  <FeaturedPostCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />
                ))}
              </CarouselList>

              <CarouselList title="校内掲示板" icon="📋">
                {notices.map((notice) => (
                  <NoticeCard key={notice.id} notice={notice} qrCodeUrl={qrCodes[notice.id]} onClick={() => setShowNoticeInfo(true)} />
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
                  {posts.map((post) => (
                    <StandardPostCard
                      key={post.id}
                      post={post}
                      isLiked={likedPosts.has(post.id)}
                      onLike={handleLike}
                      onClick={() => setSelectedPost(post)}
                      onComment={() => setShowCommentInfo(true)}
                    />
                  ))}
                </div>
              </section>
            </div>
          ) : (
            // Thanks Letter View
            <div className="w-full h-full">
              {/* onComplete を渡す */}
              <ThanksLetterView 
                onBack={() => handleNavigate("home")} 
                onComplete={handleThanksComplete} 
              />
            </div>
          )}
        </main>

        {currentView === "home" && (
          <div className={`fixed bottom-6 right-6 z-40 transition-all duration-300 ${showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}`}>
            <Button onClick={scrollToTop} className="rounded-full w-12 h-12 bg-primary text-white shadow-lg hover:bg-primary/90 hover:scale-110 transition-all" size="icon">
              <ArrowUp className="w-6 h-6" />
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}