// ask-front-i/components/student/PostDetailModal.tsx

"use client";

import { X, User, ThumbsUp, MessageSquare, Eye } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { FeatureInfoModal } from "@/components/student/FeatureInfoModal";
// ★修正: Post型を StudentPostCards からインポートする
import { Post } from "@/components/student/StudentPostCards";

interface PostDetailModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  isLiked: boolean;
  onLike: (id: number) => void;
}

export function PostDetailModal({ post, isOpen, onClose, isLiked, onLike }: PostDetailModalProps) {
  const [showCommentInfo, setShowCommentInfo] = useState(false);

  if (!isOpen || !post) return null;

  // デフォルト画像ロジック (avatarUrlがない場合のフォールバック)
  const getAvatarUrl = (id: number, isMyPost: boolean = false) => {
    if (isMyPost) return "/avatars/01.jpg";
    const num = ((id % 3) + 2); 
    return `/avatars/0${num}.jpg`;
  };

  const currentLikeCount = post.likeCount + (isLiked && !post.likedByMe ? 1 : 0) - (!isLiked && post.likedByMe ? 1 : 0);

  // ★修正: 表示するアバター画像を決定
  const avatarSrc = post.avatarUrl ? post.avatarUrl : (!post.isAnonymous ? getAvatarUrl(post.id, post.isMyPost) : undefined);

  return (
    <>
      <FeatureInfoModal
        open={showCommentInfo}
        onClose={() => setShowCommentInfo(false)}
        title="機能のお知らせ"
        description={
          <>
            MVP内ではコメント機能は非表示ですが、<br />
            <strong>投稿数UP</strong>や<strong>生徒同士の情報共有</strong>を<br />
            促進するためにフェーズ2以降で実装予定です。
          </>
        }
      />

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
            <X className="h-6 w-6 text-slate-500" />
          </Button>

          <div className="p-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
                {/* ★修正: avatarSrcを使用 */}
                {avatarSrc && <AvatarImage src={avatarSrc} />}
                <AvatarFallback className="bg-slate-200 text-slate-500 text-lg">
                  {post.isAnonymous ? <User className="h-7 w-7" /> : post.labName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {post.labName}
                  </span>
                  {post.isNew && (
                    <span className="text-[10px] font-bold text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full border border-yellow-200">
                      New
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-1">{post.authorName}</h2>
                <p className="text-xs text-slate-500">2024年12月18日</p>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 p-6">
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
              {(post.theme) && (
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
          </ScrollArea>

          <div className="p-4 border-t border-slate-100 bg-white shrink-0 flex justify-between items-center">
            <div className="flex gap-4">
               <Button 
                 variant="ghost" 
                 size="sm" 
                 onClick={() => onLike(post.id)}
                 className={`gap-2 ${post.isMyPost || isLiked ? "text-orange-500 hover:text-orange-600 hover:bg-orange-50" : "text-slate-500 hover:text-orange-500 hover:bg-orange-50"}`}
               >
                 <ThumbsUp className={`h-5 w-5 ${post.isMyPost || isLiked ? "fill-current" : ""}`} />
                 <span className="font-bold">{currentLikeCount}</span>
                 <span className="text-xs font-normal">いいね</span>
               </Button>

               <Button 
                 variant="ghost" 
                 size="sm" 
                 className="gap-2 text-slate-500 hover:bg-slate-50"
                 onClick={() => setShowCommentInfo(true)}
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
    </>
  );
}