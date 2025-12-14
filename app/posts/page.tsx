"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/client";
import { clearAccessToken } from "@/lib/auth/client";
import { ensureAccessToken, fetchMe, MeUser } from "@/lib/session";

type Post = {
  id: number;
  user_id: number;
  problem: string;
  content_1: string;
  content_2: string | null;
  content_3: string | null;
  question_state_change_type: string;
  phase_label: string;
  created_at: string;
  user_name: string | null;
};

type PostListResponse = {
  posts: Post[];
  total: number;
};

export default function PostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUser, setCurrentUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const token = await ensureAccessToken();
        if (!token) {
          router.push("/login");
          return;
        }

        const [me, postsData] = await Promise.all([
          fetchMe(),
          apiFetch<PostListResponse>("/posts", {}, token),
        ]);

        setCurrentUser(me);
        setPosts(postsData.posts);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("データの取得に失敗しました");
        clearAccessToken();
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  const getStateChangeLabel = (type: string) => {
    switch (type) {
      case "deepened":
        return "問いが深まった";
      case "changed":
        return "問いが変わった";
      default:
        return "";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">投稿一覧</h1>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/me")}
              className="rounded-md bg-slate-600 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              戻る
            </button>
            <button
              onClick={() => router.push("/posts/new")}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              新規投稿
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {posts.length === 0 ? (
            <p className="text-center text-slate-600 py-12">
              投稿がまだありません
            </p>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="rounded-lg bg-white p-6 shadow-sm border border-slate-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-slate-900 mb-2">
                      {post.problem}
                    </h2>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <span>{post.user_name || "Unknown"}</span>
                      <span>•</span>
                      <span>{formatDate(post.created_at)}</span>
                      <span>•</span>
                      <span className="text-blue-600">{post.phase_label}</span>
                    </div>
                  </div>
                  {post.question_state_change_type !== "none" && (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                      {getStateChangeLabel(post.question_state_change_type)}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="text-sm text-slate-700">
                    <p className="font-medium text-slate-900 mb-1">
                      やってみたこと①
                    </p>
                    <p>{post.content_1}</p>
                  </div>

                  {post.content_2 && (
                    <div className="text-sm text-slate-700">
                      <p className="font-medium text-slate-900 mb-1">
                        やってみたこと②
                      </p>
                      <p>{post.content_2}</p>
                    </div>
                  )}

                  {post.content_3 && (
                    <div className="text-sm text-slate-700">
                      <p className="font-medium text-slate-900 mb-1">
                        やってみたこと③
                      </p>
                      <p>{post.content_3}</p>
                    </div>
                  )}
                </div>

                {currentUser && currentUser.id === post.user_id && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => router.push(`/posts/${post.id}/edit`)}
                      className="rounded-md border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                    >
                      編集
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
