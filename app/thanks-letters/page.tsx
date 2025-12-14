"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ensureAccessToken, fetchMe, MeUser } from "@/lib/session";
import { clearAccessToken } from "@/lib/auth/client";

interface ThanksLetter {
  id: number;
  sender_user_id: number;
  sender_name: string;
  receiver_user_id: number;
  receiver_name: string;
  content_1: string;
  content_2: string | null;
  created_at: string;
}

export default function ThanksLettersPage() {
  const router = useRouter();
  const [me, setMe] = useState<MeUser | null>(null);
  const [letters, setLetters] = useState<ThanksLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "sent" | "received">("all");

  useEffect(() => {
    const init = async () => {
      try {
        const user = await fetchMe();
        setMe(user);
        await fetchLetters("all");
      } catch (err) {
        console.error("Failed to init:", err);
        clearAccessToken();
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  const fetchLetters = async (filterType: "all" | "sent" | "received") => {
    setLoading(true);
    try {
      const accessToken = await ensureAccessToken();
      if (!accessToken) {
        router.push("/login");
        return;
      }

      const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8000";
      let url = `${API_ENDPOINT}/thanks-letters`;
      if (filterType === "sent") {
        url += "/sent";
      } else if (filterType === "received") {
        url += "/received";
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLetters(data);
      }
    } catch (err) {
      console.error("Failed to fetch letters:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter: "all" | "sent" | "received") => {
    setFilter(newFilter);
    fetchLetters(newFilter);
  };

  if (loading && !me) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 p-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-slate-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-800">感謝の手紙</h1>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/me")}
              className="rounded-md bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              マイページに戻る
            </button>
            <Link
              href="/thanks-letters/new"
              className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
            >
              感謝の手紙を書く
            </Link>
          </div>
        </div>

        {/* フィルター */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => handleFilterChange("all")}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              filter === "all"
                ? "bg-purple-600 text-white"
                : "bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            すべて
          </button>
          <button
            onClick={() => handleFilterChange("received")}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              filter === "received"
                ? "bg-purple-600 text-white"
                : "bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            受け取った手紙
          </button>
          <button
            onClick={() => handleFilterChange("sent")}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              filter === "sent"
                ? "bg-purple-600 text-white"
                : "bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            送った手紙
          </button>
        </div>

        {/* 手紙一覧 */}
        {loading ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-md">
            <p className="text-slate-600">読み込み中...</p>
          </div>
        ) : letters.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-md">
            <p className="text-slate-600">感謝の手紙がまだありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {letters.map((letter) => {
              const isReceived = letter.receiver_user_id === me?.id;
              return (
                <div
                  key={letter.id}
                  className="rounded-lg bg-white p-6 shadow-md transition hover:shadow-lg"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <p className="text-sm text-slate-500">
                        {isReceived ? (
                          <>
                            <span className="font-medium text-purple-600">
                              {letter.sender_name}
                            </span>
                            さんから
                          </>
                        ) : (
                          <>
                            <span className="font-medium text-purple-600">
                              {letter.receiver_name}
                            </span>
                            さんへ
                          </>
                        )}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(letter.created_at).toLocaleString("ja-JP")}
                      </p>
                    </div>
                    {isReceived && (
                      <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                        受信
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="whitespace-pre-wrap text-sm text-slate-800">
                        {letter.content_1}
                      </p>
                    </div>
                    {letter.content_2 && (
                      <div className="border-t border-slate-200 pt-3">
                        <p className="whitespace-pre-wrap text-sm text-slate-600">
                          {letter.content_2}
                        </p>
                      </div>
                    )}
                  </div>

                  {!isReceived && me && letter.sender_user_id === me.id && (
                    <div className="mt-4 pt-4 border-t border-purple-200">
                      <button
                        onClick={() => router.push(`/thanks-letters/${letter.id}/edit`)}
                        className="rounded-md border border-purple-200 px-4 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-50"
                      >
                        編集
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
