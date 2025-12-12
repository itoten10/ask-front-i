// ask-front-i/components/teacher/TeacherMessageView.tsx

"use client";

import { CarouselList } from "@/components/student/CarouselList";
import { PostDetailModal } from "@/components/student/PostDetailModal";
import { FeaturedPostCard, NoticeCard } from "@/components/student/StudentPostCards";
import { useState } from "react";
import { Grip } from "lucide-react";

// BACKEND_INTEGRATION: studentページと同様のPost型を使用
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

export function TeacherMessageView() {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // NOTE(MOCK): 投稿データ - studentページと同じものを流用
  const featuredPosts: Post[] = [
    { id: 1, labName: "メディアラボ", authorName: "佐藤 優", content: "文化祭のポスターデザインについて、色使いの心理的効果を調べてみた。青色は信頼感を与えるらしい。", isViewedByTeacher: true, likeCount: 12, theme: "色が人に与える心理的影響", phases: ["調査・分析"], questionState: "問いの検証が進んだ" },
    { id: 2, labName: "工学ラボ", authorName: "匿名", content: "3Dプリンターのフィラメント詰まりを解消する方法を試行錯誤した結果、温度設定が鍵だとわかった。", isViewedByTeacher: true, isAnonymous: true, likeCount: 8, theme: "3Dプリンターの出力安定化", phases: ["実験・調査"], questionState: "周辺の準備作業をした" },
    { id: 3, labName: "文化教育ラボ", authorName: "匿名", content: "地元の伝統行事について聞き取り調査を行った。意外な歴史的背景が見えてきて面白い。", isViewedByTeacher: false, isAnonymous: true, likeCount: 5, theme: "地域伝統の継承理由", phases: ["情報収集"], questionState: "問いが深まった・変化した" },
    { id: 4, labName: "サイエンスラボ", authorName: "佐藤 健太", content: "川の水質調査を実施。上流と下流でのpH値の変化をグラフにまとめたところ、有意な差が見られた。", isViewedByTeacher: true, likeCount: 15, theme: "河川環境の変化要因", phases: ["分析", "発表準備"], questionState: "問いの検証が進んだ" },
    { id: 5, labName: "国際ゼミ", authorName: "鈴木 花子", content: "模擬国連に向けて、各国の食糧問題に関するスタンスをリサーチ中。各国の利害関係が複雑。", isViewedByTeacher: false, likeCount: 3, theme: "国際的な食糧不均衡", phases: ["情報収集"], questionState: "問いが深まった・変化した" },
    { id: 6, labName: "地域ビジネス", authorName: "田中 太郎", content: "商店街の空き店舗活用アイデアをブレインストーミング。高校生向けのカフェという案が出ている。", isViewedByTeacher: true, likeCount: 20, theme: "シャッター商店街の再生", phases: ["テーマ設定", "課題設定"], questionState: "問いが深まった・変化した" },
  ];

  const noticePosts: Notice[] = [
    { id: 101, date: "10/10", labName: "メディアラボ", title: "◯◯に関するアンケートの協力をお願いします！", deadline: "期限：12/12", url: "#" },
    { id: 102, date: "10/15", labName: "工学ラボ", title: "◯◯に関するアンケートの協力をお願いします！", deadline: "期限：12/17", url: "#" },
    { id: 103, date: "10/29", labName: "文化教育ゼミ", title: "◯◯に関するアンケートの協力をお願いします！", deadline: "期限：13/29", url: "#" },
  ];

  // NOTE(MOCK): 全投稿データ - 生徒ページと同じ
  const allPosts: Post[] = [
    { id: 9, labName: "メディアラボ", authorName: "佐藤 優", content: "文化祭のポスターデザインについて、色使いの心理的効果を調べてみた。青色は信頼感を与えるらしい。", isViewedByTeacher: true, likeCount: 12 },
    { id: 10, labName: "工学ラボ", authorName: "匿名", content: "3Dプリンターのフィラメント詰まりを解消する方法を試行錯誤した結果、温度設定が鍵だとわかった。", isViewedByTeacher: true, isAnonymous: true, likeCount: 8 },
    { id: 11, labName: "文化教育ラボ", authorName: "匿名", content: "地元の伝統行事について聞き取り調査を行った。意外な歴史的背景が見えてきて面白い。", isViewedByTeacher: false, isAnonymous: true, likeCount: 5 },
    { id: 12, labName: "サイエンスラボ", authorName: "佐藤 健太", content: "川の水質調査を実施。上流と下流でのpH値の変化をグラフにまとめたところ、有意な差が見られた。", isViewedByTeacher: true, likeCount: 15 },
    { id: 13, labName: "国際ゼミ", authorName: "鈴木 花子", content: "模擬国連に向けて、各国の食糧問題に関するスタンスをリサーチ中。各国の利害関係が複雑。", isViewedByTeacher: false, likeCount: 3 },
    { id: 14, labName: "地域ビジネス", authorName: "田中 太郎", content: "商店街の空き店舗活用アイデアをブレインストーミング。高校生向けのカフェという案が出ている。", isViewedByTeacher: true, likeCount: 20 },
    { id: 15, labName: "フィジカルラボ", authorName: "匿名", content: "効率的な筋力トレーニングのセット数について論文を読んだ。週3回の頻度が最適らしい。", isViewedByTeacher: false, isAnonymous: true, likeCount: 7 },
    { id: 16, labName: "社会科学ゼミ", authorName: "山田 次郎", content: "SNSの利用時間と学習意欲の相関関係についてアンケートを作成中。Googleフォーム便利。", isViewedByTeacher: true, likeCount: 9 },
  ];

  const handleLike = (postId: number) => {
    console.log("Like post:", postId);
    // TODO(BE): いいね機能の実装
  };

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  return (
    <div className="space-y-8 pb-24 lg:pb-12">
      {/* ページタイトル */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">メッセージ</h1>
        <p className="text-slate-500 mt-1">クラス全体の投稿を確認できます</p>
      </div>

      {/* 注目の投稿 */}
      <section>
        <CarouselList
          title='今週注目の "やってみた"'
          subTitle="※AIが自動でピックアップしています"
          icon="👏"
        >
          {featuredPosts.map((post) => (
            <FeaturedPostCard key={post.id} post={post} onClick={() => handlePostClick(post)} />
          ))}
        </CarouselList>
      </section>

      {/* 校内掲示板 */}
      <section>
        <CarouselList title="校内掲示板" icon="📋">
          {noticePosts.map((notice) => (
            <NoticeCard 
              key={notice.id} 
              notice={notice} 
              onClick={() => console.log("Notice clicked:", notice)}
            />
          ))}
        </CarouselList>
      </section>

      {/* 全投稿一覧 (最新順) */}
      <section>
        <div className="mb-4 flex items-center gap-3 px-1">
          <Grip className="h-8 w-8 text-primary/80" />
          <div>
            <h2 className="text-xl font-bold text-slate-800">全投稿</h2>
            <p className="text-sm text-slate-500">最新順に表示されています</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => handlePostClick(post)}
              className="p-4 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded">
                  {post.labName}
                </span>
                <span className="text-xs text-slate-500">{post.authorName}</span>
              </div>
              <p className="text-sm text-slate-700 line-clamp-3">{post.content}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <span>❤️ {post.likeCount}</span>
                {!post.isViewedByTeacher && (
                  <span className="ml-auto bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                    未確認
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 投稿詳細モーダル */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          isLiked={selectedPost.likedByMe || false}
          onLike={handleLike}
        />
      )}
    </div>
  );
}
