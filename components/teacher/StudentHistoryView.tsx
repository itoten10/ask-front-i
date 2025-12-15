// ask-front/components/teacher/StudentHistoryView.tsx
// DB接続版：生徒の活動ログ（投稿一覧）を表示

"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowUp, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { StandardPostCard, Post } from "@/components/student/StudentPostCards";
import { FeatureInfoModal } from "@/components/student/FeatureInfoModal";
import { PostDetailModal } from "@/components/student/PostDetailModal";
import { useState, useRef, useEffect, useCallback } from "react";

interface StudentHistoryViewProps {
  studentName: string;
  studentId: number;
  accessToken: string | null;
  onBack: () => void;
}

// APIレスポンス型
interface ApiPost {
  id: number;
  user_id: number;
  problem: string;
  content_1: string;
  content_2: string;
  content_3: string;
  question_state_change_type: string | null;
  phase_label: string | null;
  created_at: string;
  updated_at: string;
  user_name: string | null;
  user_avatar_url: string | null;
}

export function StudentHistoryView({ studentName, studentId, accessToken, onBack }: StudentHistoryViewProps) {
  const [showCommentInfo, setShowCommentInfo] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // スクロールトップボタンの状態管理
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // データ取得状態
  const [localPosts, setLocalPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8000";

  // APIから投稿を取得
  const fetchPosts = useCallback(async () => {
    if (!accessToken || !studentId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_ENDPOINT}/posts?user_id=${studentId}&limit=100`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("投稿の取得に失敗しました");
      }

      const data = await response.json();
      const apiPosts: ApiPost[] = data.posts || [];

      // APIデータをPost型に変換
      const convertedPosts: Post[] = apiPosts.map((post, index) => ({
        id: post.id,
        labName: "探究学習",
        authorName: post.user_name || studentName,
        avatarUrl: post.user_avatar_url || "/avatars/placeholder.png",
        content: [
          post.problem && `【課題】${post.problem}`,
          post.content_1 && `【わかったこと】${post.content_1}`,
          post.content_2 && `【次にしたいこと】${post.content_2}`,
          post.content_3 && `【ふりかえり】${post.content_3}`,
        ].filter(Boolean).join("\n\n"),
        isViewedByTeacher: true,
        isAnonymous: false,
        isMyPost: false,
        likeCount: 0,
        likedByMe: false,
        isNew: index === 0,
        theme: post.problem || "探究学習",
        phases: post.phase_label ? [post.phase_label] : [],
        questionState: post.question_state_change_type || undefined,
      }));

      setLocalPosts(convertedPosts);
    } catch (err) {
      console.error("投稿取得エラー:", err);
      setError("投稿の取得に失敗しました。再読み込みしてください。");
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, studentId, studentName, API_ENDPOINT]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleLike = (postId: number) => {
    setLocalPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          likedByMe: !p.likedByMe,
          likeCount: p.likedByMe ? p.likeCount - 1 : p.likeCount + 1
        };
      }
      return p;
    }));
  };

  // ★追加: スクロールイベントハンドラ
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop > 300) {
      setShowScrollTop(true);
    } else {
      setShowScrollTop(false);
    }
  };

  // ★追加: トップへ戻る機能
  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ローディング中
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-slate-500">投稿を読み込み中...</p>
        </div>
      </div>
    );
  }

  // エラー時
  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <p className="text-slate-700">{error}</p>
          <Button onClick={fetchPosts} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            再読み込み
          </Button>
          <Button onClick={onBack} variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            戻る
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 relative">

      {/* 詳細モーダル */}
      <PostDetailModal
        post={selectedPost}
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        isLiked={selectedPost ? (localPosts.find(p => p.id === selectedPost.id)?.likedByMe || false) : false}
        onLike={handleLike}
      />

      <FeatureInfoModal
        open={showCommentInfo}
        onClose={() => setShowCommentInfo(false)}
        title="機能のお知らせ"
        description={<>MVP内ではコメント機能は非表示ですが、<br /><strong>投稿数UP</strong>や<strong>生徒同士の情報共有</strong>を<br />促進するためにフェーズ2以降で実装予定です。</>}
      />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
            戻る
          </Button>
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              {studentName} <span className="text-sm font-normal text-slate-500">の活動ログ ({localPosts.length}件)</span>
            </h2>
          </div>
        </div>
        <Button onClick={fetchPosts} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          更新
        </Button>
      </div>

      {/* Grid List */}
      {localPosts.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-500">投稿がありません</p>
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto pr-2 scroll-smooth"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
            {localPosts.map((post) => (
              <StandardPostCard
                key={post.id}
                post={post}
                isLiked={post.likedByMe || false}
                onLike={handleLike}
                onClick={() => setSelectedPost(post)}
                onComment={() => setShowCommentInfo(true)}
              />
            ))}
          </div>
        </div>
      )}

      {/* トップへ戻るボタン */}
      <div className={`fixed right-6 bottom-6 z-50 transition-all duration-300 ${showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}`}>
        <Button
          onClick={scrollToTop}
          className="rounded-full w-12 h-12 bg-primary text-white shadow-lg hover:bg-primary/90 hover:scale-110 transition-all"
          size="icon"
        >
          <ArrowUp className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}