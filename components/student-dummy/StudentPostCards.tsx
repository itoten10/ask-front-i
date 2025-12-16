// ask-front-i/components/student/StudentPostCards.tsx

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, User, ThumbsUp, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Post {
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
  avatarUrl?: string; // 画像指定用
}

interface Notice {
  id: number;
  date: string;
  labName: string;
  title: string;
  deadline: string;
  url: string;
}

// デフォルトの画像決定ロジック
const getAvatarUrl = (id: number, isMyPost: boolean = false) => {
  if (isMyPost) return "/avatars/01.jpg";
  const num = ((id % 3) + 2); 
  return `/avatars/0${num}.jpg`;
};

// 1. FeaturedPostCard
export function FeaturedPostCard({ post, onClick }: { post: Post; onClick: () => void }) {
  // ★修正: post.avatarUrl があればそれを使い、なければ getAvatarUrl を使う
  const avatarSrc = post.avatarUrl ? post.avatarUrl : (!post.isAnonymous ? getAvatarUrl(post.id, post.isMyPost) : undefined);

  return (
    <Card 
      onClick={onClick}
      className="h-full border border-slate-200 bg-white transition-all duration-300 hover:border-primary hover:bg-primary/5 hover:shadow-lg cursor-pointer group flex flex-col"
    >
      <CardContent className="p-6 flex-1 flex flex-col space-y-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 border border-slate-200 bg-white">
            {avatarSrc && <AvatarImage src={avatarSrc} />}
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
  );
}

// 2. NoticeCard (変更なし)
export function NoticeCard({ notice, qrCodeUrl, onClick }: { notice: Notice; qrCodeUrl?: string; onClick: () => void }) {
  return (
    <Card 
      onClick={onClick}
      className="h-full border border-slate-200 bg-white transition-all duration-300 hover:border-primary hover:bg-primary/5 hover:shadow-lg cursor-pointer flex flex-col"
    >
      <CardContent className="p-5 flex gap-5 h-full items-start">
        <div className="flex flex-col items-center gap-2 min-w-[90px]">
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            掲載: {notice.date}
          </span>
          <div className="w-24 h-24 bg-white border border-slate-200 rounded-md p-1 flex items-center justify-center overflow-hidden shadow-sm">
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="QR Code" className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full bg-slate-50 animate-pulse" />
            )}
          </div>
        </div>
        <div className="flex-1 flex flex-col h-full py-1">
          <div className="flex items-center gap-2 mb-3">
            <Avatar className="h-6 w-6 border border-slate-200">
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
  );
}

// 3. StandardPostCard (修正)
export function StandardPostCard({ 
  post, 
  isLiked, 
  onLike, 
  onClick,
  onComment
}: { 
  post: Post; 
  isLiked: boolean; 
  onLike: (id: number) => void;
  onClick: () => void;
  onComment: () => void;
}) {
  const currentLikeCount = post.likeCount + (isLiked && !post.likedByMe ? 1 : 0) - (!isLiked && post.likedByMe ? 1 : 0);
  const postDate = post.isNew ? "12月18日" : "12月10日";

  // ★修正: post.avatarUrl があれば優先するロジックを明確化
  const avatarSrc = post.avatarUrl ? post.avatarUrl : (!post.isAnonymous ? getAvatarUrl(post.id, post.isMyPost) : undefined);

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
              New ✨
            </span>
        </div>
      )}

      <CardContent className="p-6 flex-1 flex flex-col space-y-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 border border-slate-200 bg-white">
            {/* ★修正: avatarSrcを使用 */}
            {avatarSrc && <AvatarImage src={avatarSrc} />}
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
          {post.theme && (
            <h3 className="font-bold text-sm text-slate-900 mb-2 leading-tight">
              {post.theme}
            </h3>
          )}
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
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => { e.stopPropagation(); onLike(post.id); }}
              className={`gap-1.5 h-8 px-2 ${post.isMyPost || isLiked ? "text-orange-500 hover:text-orange-600 hover:bg-orange-50" : "text-slate-400 hover:text-orange-500 hover:bg-orange-50"}`}
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