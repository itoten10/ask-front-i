// ask-front/app/student-dashboard/page.tsx
// 認証済み生徒用ダッシュボード（DB接続版）

"use client";

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { CarouselList } from "@/components/student/CarouselList";
import { Grip, ArrowUp, Loader2, AlertCircle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect, useRef, useCallback } from "react";
import QRCode from "qrcode";
import { AuthPostForm, PostFormData } from "@/components/student/AuthPostForm";
import { AuthStandardPostCard, AuthPostDetail, ApiPost, DisplayPost, convertApiPostToDisplay } from "@/components/student/AuthPostCards";
import { FeaturedPostCard, NoticeCard, Post } from "@/components/student/StudentPostCards";
import { PostDetailModal } from "@/components/student/PostDetailModal";
import { FeatureInfoModal } from "@/components/student/FeatureInfoModal";
import { Button } from "@/components/ui/button";
import { AuthThanksLetterView } from "@/components/student/AuthThanksLetterView";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/app/lib/api-client";
import { ensureAccessToken, fetchMe, MeUser } from "@/app/lib/session";

// DisplayPostをPost型に変換するヘルパー関数
function displayPostToPost(displayPost: DisplayPost): Post {
  return {
    id: displayPost.id,
    labName: displayPost.labName,
    authorName: displayPost.authorName,
    content: displayPost.content,
    isViewedByTeacher: displayPost.isViewedByTeacher,
    isMyPost: displayPost.isMyPost,
    likeCount: displayPost.likeCount,
    likedByMe: displayPost.likedByMe,
    isNew: displayPost.isNew,
    theme: displayPost.theme,
    phases: displayPost.phases,
    questionState: displayPost.questionState,
    avatarUrl: displayPost.avatarUrl,
  };
}

// 掲示板（ダミーデータ）
interface Notice {
  id: number;
  date: string;
  labName: string;
  title: string;
  deadline: string;
  url: string;
}

const notices: Notice[] = [
  { id: 1, date: "10/10", labName: "メディアラボ", title: "○○に関するアンケートのご協力お願いします！", deadline: "12/12", url: "https://forms.google.com/example1" },
  { id: 2, date: "10/15", labName: "工学ラボ", title: "ロボットコンテストの観戦者を募集しています", deadline: "12/17", url: "https://example.com/robot-contest" },
  { id: 3, date: "10/29", labName: "文化教育ゼミ", title: "地域ボランティアの参加者説明会について", deadline: "12/29", url: "https://example.com/volunteer" },
  { id: 4, date: "11/02", labName: "生徒会", title: "球技大会の種目希望アンケート", deadline: "11/15", url: "https://forms.google.com/ball-game" },
  { id: 5, date: "11/05", labName: "進路指導部", title: "冬期講習の申し込み開始のお知らせ", deadline: "11/20", url: "https://school.edu/winter-course" },
  { id: 6, date: "11/10", labName: "図書委員会", title: "読書感想文コンクールの作品募集", deadline: "11/30", url: "https://library.example.com/contest" },
];

export default function StudentDashboardPage() {
  const router = useRouter();

  // ユーザー情報
  const [user, setUser] = useState<MeUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // 投稿データ
  const [posts, setPosts] = useState<DisplayPost[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);

  // いいね状態
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

  // QRコード
  const [qrCodes, setQrCodes] = useState<Record<number, string>>({});

  // モーダル用State
  const [selectedPost, setSelectedPost] = useState<DisplayPost | null>(null);
  const [selectedFeaturedPost, setSelectedFeaturedPost] = useState<Post | null>(null);
  const [showCommentInfo, setShowCommentInfo] = useState(false);
  const [showNoticeInfo, setShowNoticeInfo] = useState(false);

  // 画面切り替え用のState ('home' = 投稿一覧, 'thanks' = 感謝の手紙)
  const [currentView, setCurrentView] = useState<"home" | "thanks">("home");

  // 感謝の手紙の残り枚数 (初期値3)
  const [thanksCount, setThanksCount] = useState(3);

  // 投稿完了時にスクロールするためのRef
  const allPostsRef = useRef<HTMLDivElement>(null);

  // スクロールトップボタンの表示切替用
  const [showScrollTop, setShowScrollTop] = useState(false);
  const mainScrollRef = useRef<HTMLDivElement>(null);

  // QRコードの生成
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

  // ユーザー情報の取得
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await fetchMe();
        setUser(userData);

        // 生徒以外はリダイレクト
        if (userData.role !== "student") {
          if (userData.role === "teacher") {
            router.push("/teacher-dashboard");
          } else if (userData.role === "admin") {
            router.push("/admin");
          }
          return;
        }
      } catch (error) {
        console.error("ユーザー情報の取得に失敗:", error);
        // 認証エラーの場合はログインページへ
        router.push("/login");
      } finally {
        setIsLoadingUser(false);
      }
    };

    loadUser();
  }, [router]);

  // 投稿一覧の取得
  const fetchPosts = useCallback(async () => {
    if (!user) return;

    setIsLoadingPosts(true);
    setPostsError(null);

    try {
      const token = await ensureAccessToken();
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await apiFetch<{ posts: ApiPost[]; total: number }>(
        "/posts?limit=100",
        {},
        token
      );

      const displayPosts = response.posts.map((post) =>
        convertApiPostToDisplay(post, user.id, likedPosts)
      );

      setPosts(displayPosts);

      // 注目の投稿は最初の8件を使用（将来的にはAIピックアップなど）
      const featured = displayPosts.slice(0, 8).map(displayPostToPost);
      setFeaturedPosts(featured);
    } catch (error) {
      console.error("投稿の取得に失敗:", error);
      setPostsError("投稿の取得に失敗しました。再読み込みしてください。");
    } finally {
      setIsLoadingPosts(false);
    }
  }, [user, likedPosts, router]);

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user, fetchPosts]);

  // 投稿作成
  const handlePostSubmit = async (data: PostFormData) => {
    const token = await ensureAccessToken();
    if (!token) {
      router.push("/login");
      return;
    }

    await apiFetch(
      "/posts",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      token
    );

    // 投稿一覧を再取得
    await fetchPosts();

    // 投稿完了後に全投稿エリアまで自動スクロール
    setTimeout(() => {
      if (allPostsRef.current) {
        allPostsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const handleLike = (postId: number) => {
    // TODO: いいね機能のAPI実装後に対応
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

  // ローディング中
  if (isLoadingUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-slate-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  // ユーザー情報がない場合（認証エラー）
  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background font-sans overflow-hidden">

      {/* 詳細モーダル（DB投稿用） */}
      {selectedPost && (
        <AuthPostDetail
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          isLiked={likedPosts.has(selectedPost.id)}
          onLike={handleLike}
        />
      )}

      {/* 注目投稿詳細モーダル */}
      <PostDetailModal
        post={selectedFeaturedPost}
        isOpen={!!selectedFeaturedPost}
        onClose={() => setSelectedFeaturedPost(null)}
        isLiked={selectedFeaturedPost ? likedPosts.has(selectedFeaturedPost.id) : false}
        onLike={handleLike}
      />

      {/* コメント用機能のお知らせモーダル */}
      <FeatureInfoModal
        open={showCommentInfo}
        onClose={() => setShowCommentInfo(false)}
        title="機能のお知らせ"
        description={<>MVP内ではコメント機能は非表示ですが、<br /><strong>投稿数UP</strong>や<strong>生徒同士の情報共有</strong>を<br />促進するためにフェーズ2以降で実装予定です。</>}
      />

      {/* 掲示板用機能のお知らせモーダル */}
      <FeatureInfoModal
        open={showNoticeInfo}
        onClose={() => setShowNoticeInfo(false)}
        title="機能のお知らせ"
        description={<>MVP内では詳細は非表示ですが、<br/>フェーズ2で各ゼミのアンケートなどを<br/>ここに反映予定です。</>}
      />

      {/* サイドバー */}
      <Sidebar
        userRole="student"
        className="hidden md:flex flex-col h-full shrink-0"
        onNavigate={handleNavigate}
        badgeCount={thanksCount}
        userName={user.full_name}
        userGrade={user.grade?.toString() ?? null}
        userClass={user.class_name}
        userAvatar={user.avatar_url || undefined}
      />

      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        {/* ヘッダー */}
        <Header onNavigate={handleNavigate} badgeCount={thanksCount} />

        {/* ユーザー情報バー */}
        <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-3 flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
              <AvatarImage src={user.avatar_url || "/avatars/placeholder.png"} alt={user.full_name} className="object-cover" />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">{user.full_name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold text-slate-900">{user.full_name}</p>
              <p className="text-xs text-slate-500">
                {user.grade && user.class_name
                  ? `${user.grade}年${user.class_name}組`
                  : user.grade
                    ? `${user.grade}年`
                    : ""}
              </p>
            </div>
          </div>
        </div>

        <main
          id="student-main-scroll"
          ref={mainScrollRef}
          onScroll={handleScroll}
          className={`flex-1 overflow-y-auto bg-slate-50/50 scroll-smooth ${currentView === 'home' ? 'p-4 md:p-8' : 'p-0'}`}
        >
          {currentView === "home" ? (
            // Home (Feed) View
            <div className="w-full max-w-[1600px] mx-auto space-y-1 pb-20 animate-in fade-in slide-in-from-left-4 duration-500">

              {/* 投稿フォーム */}
              <AuthPostForm
                userName={user.full_name}
                userAvatar={user.avatar_url || undefined}
                onSubmit={handlePostSubmit}
              />

              {/* 今週の注目 */}
              <CarouselList
                title="今週注目の &quot;やってみた&quot;"
                subTitle="※最新の投稿を表示しています"
                icon="👏"
              >
                {isLoadingPosts && featuredPosts.length === 0 ? (
                  // ローディング中のプレースホルダー
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-48 bg-slate-100 rounded-lg animate-pulse" />
                  ))
                ) : (
                  featuredPosts.map((post) => (
                    <FeaturedPostCard key={post.id} post={post} onClick={() => setSelectedFeaturedPost(post)} />
                  ))
                )}
              </CarouselList>

              {/* 校内掲示板 */}
              <CarouselList title="校内掲示板" icon="📋">
                {notices.map((notice) => (
                  <NoticeCard key={notice.id} notice={notice} qrCodeUrl={qrCodes[notice.id]} onClick={() => setShowNoticeInfo(true)} />
                ))}
              </CarouselList>

              {/* 投稿一覧 */}
              <section className="w-full py-4" ref={allPostsRef}>
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchPosts}
                    disabled={isLoadingPosts}
                  >
                    {isLoadingPosts ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "更新"
                    )}
                  </Button>
                </div>

                {/* エラー表示 */}
                {postsError && (
                  <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg mb-4">
                    <AlertCircle className="h-5 w-5" />
                    <span>{postsError}</span>
                  </div>
                )}

                {/* ローディング */}
                {isLoadingPosts && posts.length === 0 && (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}

                {/* 投稿がない場合 */}
                {!isLoadingPosts && posts.length === 0 && !postsError && (
                  <div className="text-center py-12 text-slate-500">
                    <p>まだ投稿がありません。</p>
                    <p className="text-sm mt-2">最初の &quot;やってみた&quot; を投稿してみましょう！</p>
                  </div>
                )}

                {/* 投稿カード一覧 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {posts.map((post) => (
                    <AuthStandardPostCard
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
            // Thanks Letter View (DB接続版)
            <div className="w-full h-full">
              <AuthThanksLetterView
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
