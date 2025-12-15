// ask-front/components/student/AuthPostCards.tsx
// API接続版の投稿カードコンポーネント

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, User, ThumbsUp, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

// APIから取得する投稿データの型
export interface ApiPost {
  id: number;
  user_id: number;
  problem: string;  // テーマ・問い
  content_1: string;
  content_2: string | null;
  content_3: string | null;
  question_state_change_type: string;
  phase_label: string;
  created_at: string;
  updated_at: string;
  user_name: string | null;
  user_avatar_url: string | null;
}

// 表示用に変換した投稿型
export interface DisplayPost {
  id: number;
  userId: number;
  labName: string;  // phase_label をラボ名として使用
  authorName: string;
  avatarUrl: string | null;  // ユーザーのアバターURL
  content: string;
  isViewedByTeacher: boolean;
  isMyPost: boolean;
  likeCount: number;
  likedByMe: boolean;
  isNew: boolean;
  theme: string;
  phases: string[];
  questionState: string;
  createdAt: Date;
}

// APIレスポンスから表示用データに変換
export function convertApiPostToDisplay(
  post: ApiPost,
  currentUserId: number | null,
  likedPostIds: Set<number> = new Set()
): DisplayPost {
  const content = [post.content_1, post.content_2, post.content_3]
    .filter(Boolean)
    .join("\n\n");

  const createdAt = new Date(post.created_at);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

  // 問いの状態変更タイプの日本語変換
  const questionStateMap: Record<string, string> = {
    deepened: "問いが深まった・変化した",
    verified: "問いの検証が進んだ",
    preparation: "周辺の準備作業をした",
    none: "",
  };

  return {
    id: post.id,
    userId: post.user_id,
    labName: post.phase_label || "探究",
    authorName: post.user_name || "匿名",
    avatarUrl: post.user_avatar_url,
    content,
    isViewedByTeacher: false,  // TODO: バックエンドでの閲覧フラグ実装後に対応
    isMyPost: currentUserId === post.user_id,
    likeCount: 0,  // TODO: いいね機能実装後に対応
    likedByMe: likedPostIds.has(post.id),
    isNew: daysDiff <= 1,
    theme: post.problem,
    phases: post.phase_label ? [post.phase_label] : [],
    questionState: questionStateMap[post.question_state_change_type] || "",
    createdAt,
  };
}

// デフォルトの画像決定ロジック（DBからのavatarUrlのみ使用、なければnull）
const getAvatarUrl = (post: DisplayPost): string | null => {
  // DBからのアバターURLがあれば使用、なければnull（フォールバックなし）
  return post.avatarUrl || null;
};

interface StandardPostCardProps {
  post: DisplayPost;
  isLiked: boolean;
  onLike: (id: number) => void;
  onClick: () => void;
  onComment: () => void;
}

export function AuthStandardPostCard({
  post,
  isLiked,
  onLike,
  onClick,
  onComment,
}: StandardPostCardProps) {
  const currentLikeCount = post.likeCount + (isLiked && !post.likedByMe ? 1 : 0) - (!isLiked && post.likedByMe ? 1 : 0);
  const postDate = format(post.createdAt, "M月d日", { locale: ja });

  const avatarSrc = getAvatarUrl(post);

  return (
    <Card
      onClick={onClick}
      className={`
        h-full flex flex-col transition-all duration-300 relative overflow-hidden
        ${post.isNew
          ? "border-2 border-yellow-400 bg-white shadow-[0_0_20px_rgba(250,204,21,0.25)] animate-in slide-in-from-top-4 fade-in zoom-in-95"
          : post.isMyPost
            ? "border border-primary/40 bg-primary/5"
            : "border border-slate-200 bg-white hover:border-primary hover:shadow-md cursor-pointer"}
      `}
    >
      {post.isNew && (
        <div className="absolute top-0 left-0">
            <span className="inline-flex items-center justify-center px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] font-bold tracking-wider shadow-md rounded-br-lg">
              New
            </span>
        </div>
      )}

      <CardContent className="p-6 flex-1 flex flex-col space-y-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 border border-slate-200 bg-white">
            {avatarSrc && <AvatarImage src={avatarSrc} />}
            <AvatarFallback className="bg-slate-100 text-slate-400">
              {post.authorName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xs font-bold text-slate-500 mb-0.5">#{post.labName}</p>
            <p className="font-bold text-base text-slate-900">{post.authorName}</p>
            <div className="text-[10px] text-slate-400 mt-0.5">{postDate}</div>
          </div>
        </div>

        <div className="flex-1">
          {post.theme && (
            <h3 className="font-bold text-sm text-slate-900 mb-2 leading-tight line-clamp-2">
              {post.theme}
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
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onLike(post.id); }}
              className={`gap-1.5 h-8 px-2 ${isLiked ? "text-orange-500 hover:text-orange-600 hover:bg-orange-50" : "text-slate-400 hover:text-orange-500 hover:bg-orange-50"}`}
            >
              <ThumbsUp className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              <span className="text-xs font-bold">{currentLikeCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onComment(); }}
              className="gap-1.5 h-8 px-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="text-xs font-bold">0</span>
            </Button>
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
}

// 詳細モーダル用の投稿カード
interface PostDetailProps {
  post: DisplayPost;
  onClose: () => void;
  isLiked: boolean;
  onLike: (id: number) => void;
}

export function AuthPostDetail({ post, onClose, isLiked, onLike }: PostDetailProps) {
  const currentLikeCount = post.likeCount + (isLiked && !post.likedByMe ? 1 : 0) - (!isLiked && post.likedByMe ? 1 : 0);
  const postDate = format(post.createdAt, "yyyy年M月d日", { locale: ja });
  const avatarSrc = getAvatarUrl(post);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl max-h-[90vh] rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 hover:bg-slate-100 rounded-full"
          onClick={onClose}
        >
          <span className="text-slate-500 text-2xl">&times;</span>
        </Button>

        <div className="p-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
              {avatarSrc && <AvatarImage src={avatarSrc} />}
              <AvatarFallback className="bg-slate-200 text-slate-500 text-lg">
                {post.authorName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  #{post.labName}
                </span>
                {post.isNew && (
                  <span className="text-[10px] font-bold text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full border border-yellow-200">
                    New
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">{post.authorName}</h2>
              <p className="text-xs text-slate-500">{postDate}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-6">
            {post.phases && post.phases.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.phases.map((phase) => (
                  <span key={phase} className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
                    #{phase}
                  </span>
                ))}
              </div>
            )}
            {post.theme && (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 mb-1">取り組んでいるテーマ・問い</h3>
                <p className="font-bold text-slate-800 text-lg leading-snug">{post.theme}</p>
              </div>
            )}
            <div className="text-slate-800 leading-relaxed whitespace-pre-wrap text-base">
              {post.content}
            </div>
            {post.questionState && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 text-sm text-slate-600">
                <span className="font-bold">問いの状態:</span>
                <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-medium">
                  {post.questionState}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-white shrink-0 flex justify-between items-center">
          <div className="flex gap-4">
             <Button
               variant="ghost"
               size="sm"
               onClick={() => onLike(post.id)}
               className={`gap-2 ${isLiked ? "text-orange-500 hover:text-orange-600 hover:bg-orange-50" : "text-slate-500 hover:text-orange-500 hover:bg-orange-50"}`}
             >
               <ThumbsUp className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
               <span className="font-bold">{currentLikeCount}</span>
               <span className="text-xs font-normal">いいね</span>
             </Button>

             <Button
               variant="ghost"
               size="sm"
               className="gap-2 text-slate-500 hover:bg-slate-50"
             >
               <MessageSquare className="h-5 w-5" />
               <span className="font-bold">0</span>
               <span className="text-xs font-normal">コメント</span>
             </Button>
          </div>
          {post.isViewedByTeacher && (
             <span className="text-xs font-medium text-primary/80 bg-primary/5 px-3 py-1.5 rounded-full flex items-center gap-1.5">
               <Eye className="h-4 w-4" />
               先生が確認済み
             </span>
          )}
        </div>
      </div>
    </div>
  );
}
