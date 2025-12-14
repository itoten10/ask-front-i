"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ensureAccessToken } from "@/lib/session";

export default function EditThanksLetterPage() {
  const router = useRouter();
  const params = useParams();
  const letterId = params.id as string;

  const [receiverName, setReceiverName] = useState("");
  const [content1, setContent1] = useState("");
  const [content2, setContent2] = useState("");
  const [selectedAbilities, setSelectedAbilities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const abilities = [
    { code: "problem_setting", name: "課題設定力" },
    { code: "information_gathering", name: "情報収集力" },
    { code: "involvement", name: "巻き込む力" },
    { code: "communication", name: "対話する力" },
    { code: "humility", name: "謙虚である力" },
    { code: "execution", name: "実行する力" },
    { code: "completion", name: "完遂する力" },
  ];

  const toggleAbility = (code: string) => {
    setSelectedAbilities((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  useEffect(() => {
    const fetchLetter = async () => {
      try {
        const accessToken = await ensureAccessToken();
        if (!accessToken) {
          router.push("/login");
          return;
        }

        const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8000";
        const response = await fetch(`${API_ENDPOINT}/thanks-letters`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const letters = await response.json();
          const letter = letters.find((l: any) => l.id === parseInt(letterId));

          if (letter) {
            setReceiverName(letter.receiver_name);
            setContent1(letter.content_1);
            setContent2(letter.content_2 || "");
            // TODO: 既存の能力選択を取得する必要がある場合は追加実装
          } else {
            setError("手紙が見つかりませんでした");
          }
        }
      } catch (err) {
        console.error("Failed to fetch letter:", err);
        setError("手紙の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchLetter();
  }, [letterId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const accessToken = await ensureAccessToken();
      if (!accessToken) {
        router.push("/login");
        return;
      }

      const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8000";
      const response = await fetch(`${API_ENDPOINT}/thanks-letters/${letterId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          content_1: content1,
          content_2: content2 || null,
          ability_codes: selectedAbilities,
        }),
      });

      if (response.ok) {
        router.push("/thanks-letters");
      } else {
        const data = await response.json();
        setError(data.detail || "手紙の更新に失敗しました");
      }
    } catch (err) {
      console.error("Failed to update letter:", err);
      setError("手紙の更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 p-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-slate-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-800">感謝の手紙を編集</h1>
          <button
            onClick={() => router.push("/thanks-letters")}
            className="rounded-md bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            一覧に戻る
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="rounded-lg bg-white p-8 shadow-md">
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              送る相手
            </label>
            <div className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              {receiverName}
            </div>
            <p className="mt-1 text-xs text-slate-500">※送る相手は変更できません</p>
          </div>

          <div className="mb-6">
            <label htmlFor="content1" className="mb-2 block text-sm font-medium text-slate-700">
              感謝の内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content1"
              value={content1}
              onChange={(e) => setContent1(e.target.value)}
              rows={6}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-purple-500 focus:outline-none"
              placeholder="何に感謝しているか、具体的に書きましょう"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="content2" className="mb-2 block text-sm font-medium text-slate-700">
              追加のメッセージ（任意）
            </label>
            <textarea
              id="content2"
              value={content2}
              onChange={(e) => setContent2(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-purple-500 focus:outline-none"
              placeholder="その他伝えたいことがあれば書きましょう"
            />
          </div>

          <div className="mb-6">
            <label className="mb-3 block text-sm font-medium text-slate-700">
              相手が発揮した非認知能力（複数選択可）
            </label>
            <div className="grid grid-cols-2 gap-3">
              {abilities.map((ability) => (
                <label
                  key={ability.code}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedAbilities.includes(ability.code)}
                    onChange={() => toggleAbility(ability.code)}
                    className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-slate-700">{ability.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-md bg-purple-600 px-6 py-3 font-medium text-white hover:bg-purple-700 disabled:bg-slate-300"
            >
              {saving ? "更新中..." : "更新する"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/thanks-letters")}
              className="rounded-md border border-slate-300 px-6 py-3 font-medium text-slate-700 hover:bg-slate-50"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
