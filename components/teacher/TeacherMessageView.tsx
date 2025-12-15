// ask-front/components/teacher/TeacherMessageView.tsx

"use client";

import { CarouselList } from "@/components/student/CarouselList";
import { PostDetailModal } from "@/components/student/PostDetailModal";
import { FeatureInfoModal } from "@/components/student/FeatureInfoModal";
import { FeaturedPostCard, NoticeCard, StandardPostCard } from "@/components/student/StudentPostCards";
import { useState, useEffect, useCallback } from "react";
import { Grip, Loader2 } from "lucide-react";
import QRCode from "qrcode";
import { apiFetch } from "@/app/lib/api-client";
import { ApiPost, convertApiPostToDisplay, DisplayPost } from "@/components/student/AuthPostCards";

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
  isNew?: boolean;
  theme?: string;
  phases?: string[];
  questionState?: string;
  avatarUrl?: string | null;
}

interface Notice {
  id: number;
  date: string;
  labName: string;
  title: string;
  deadline: string;
  url: string;
}

interface TeacherMessageViewProps {
  accessToken: string | null;
}

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

export function TeacherMessageView({ accessToken }: TeacherMessageViewProps) {
  const [qrCodes, setQrCodes] = useState<Record<number, string>>({});

  // モーダル制御用State
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showNoticeInfo, setShowNoticeInfo] = useState(false);
  const [showCommentInfo, setShowCommentInfo] = useState(false);

  // ==========================================
  // Data - DBバックエンドから取得
  // ==========================================

  const notices: Notice[] = [
    { id: 1, date: "10/10", labName: "メディアラボ", title: "○○に関するアンケートのご協力お願いします！", deadline: "12/12", url: "https://forms.google.com/example1" },
    { id: 2, date: "10/15", labName: "工学ラボ", title: "ロボットコンテストの観戦者を募集しています", deadline: "12/17", url: "https://example.com/robot-contest" },
    { id: 3, date: "10/29", labName: "文化教育ゼミ", title: "地域ボランティアの参加者説明会について", deadline: "12/29", url: "https://example.com/volunteer" },
    { id: 4, date: "11/02", labName: "生徒会", title: "球技大会の種目希望アンケート", deadline: "11/15", url: "https://forms.google.com/ball-game" },
    { id: 5, date: "11/05", labName: "進路指導部", title: "冬期講習の申し込み開始のお知らせ", deadline: "11/20", url: "https://school.edu/winter-course" },
    { id: 6, date: "11/10", labName: "図書委員会", title: "読書感想文コンクールの作品募集", deadline: "11/30", url: "https://library.example.com/contest" },
  ];

  // State管理
  const [posts, setPosts] = useState<Post[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // DBから投稿を取得
  const fetchPosts = useCallback(async () => {
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      // APIレスポンスは { posts: [...], total: number } 形式
      // 全投稿を取得するためlimit=1000を指定
      const response = await apiFetch<{ posts: ApiPost[]; total: number }>("/posts?limit=1000", {}, accessToken);
      const apiPosts = response.posts;

      // APIレスポンスをDisplayPost経由でPost型に変換
      const convertedPosts = apiPosts.map((apiPost) => {
        const displayPost = convertApiPostToDisplay(apiPost, null, new Set());
        return displayPostToPost(displayPost);
      });

      // 全投稿をセット（最新順に並んでいると想定）
      setPosts(convertedPosts);

      // 注目の投稿は最初の8件を使用（将来的にはAIピックアップなど）
      setFeaturedPosts(convertedPosts.slice(0, 8));

      setError(null);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
      setError("投稿の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    // QRコード生成
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

    // 初期いいね状態の設定
    const initialLiked = new Set<number>();
    posts.forEach(post => {
      if (post.likedByMe) initialLiked.add(post.id);
    });
    setLikedPosts(initialLiked);
  }, [posts]);

  // 先生によるいいね機能（MVPではローカルのみ反映）
  const handleLike = (postId: number) => {
    const newLiked = new Set(likedPosts);
    if (newLiked.has(postId)) {
      newLiked.delete(postId);
    } else {
      newLiked.add(postId);
    }
    setLikedPosts(newLiked);
  };

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
  };

  return (
    <div className="space-y-1 pb-24 lg:pb-12">
      {/* 投稿詳細モーダル */}
      <PostDetailModal
        post={selectedPost}
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        isLiked={selectedPost ? likedPosts.has(selectedPost.id) : false}
        onLike={handleLike}
      />

      {/* 掲示板用お知らせモーダル */}
      <FeatureInfoModal
        open={showNoticeInfo}
        onClose={() => setShowNoticeInfo(false)}
        title="機能のお知らせ"
        description={<>MVP内では詳細は非表示ですが、<br/>フェーズ2で各ゼミのアンケートなどを<br/>ここに反映予定です。</>}
      />

      {/* コメント用お知らせモーダル */}
      <FeatureInfoModal
        open={showCommentInfo}
        onClose={() => setShowCommentInfo(false)}
        title="機能のお知らせ"
        description={<>MVP内ではコメント機能は非表示ですが、<br /><strong>投稿数UP</strong>や<strong>生徒同士の情報共有</strong>を<br />促進するためにフェーズ2以降で実装予定です。</>}
      />

      {/* 注目の投稿 */}
      <section>
        <CarouselList
          title='今週注目の "やってみた"'
          subTitle="※AIが自動でピックアップしています"
          icon="👏"
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : featuredPosts.length > 0 ? (
            featuredPosts.map((post) => (
              <FeaturedPostCard key={post.id} post={post} onClick={() => handlePostClick(post)} />
            ))
          ) : (
            <div className="text-center py-8 text-slate-500">投稿がありません</div>
          )}
        </CarouselList>
      </section>

      {/* 校内掲示板 */}
      <section>
        <CarouselList title="校内掲示板" icon="📋">
          {notices.map((notice) => (
            <NoticeCard
              key={notice.id}
              notice={notice}
              qrCodeUrl={qrCodes[notice.id]}
              onClick={() => setShowNoticeInfo(true)}
            />
          ))}
        </CarouselList>
      </section>

      {/* 全投稿一覧 (Grid形式) */}
      <section>
        <div className="mb-4 flex items-center gap-3 px-1">
          <Grip className="h-8 w-8 text-primary/80" />
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">全投稿</h2>
            <p className="text-sm text-slate-500 mt-1">最新順に表示されています</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-slate-500">読み込み中...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-slate-500">投稿がありません</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {posts.map((post) => (
              <StandardPostCard
                key={post.id}
                post={post}
                isLiked={likedPosts.has(post.id)}
                onLike={handleLike}
                onClick={() => handlePostClick(post)}
                onComment={() => setShowCommentInfo(true)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
