"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiFetch } from "@/lib/api/client";
import { getAccessToken } from "@/lib/auth/client";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [problem, setProblem] = useState("");
  const [content1, setContent1] = useState("");
  const [content2, setContent2] = useState("");
  const [content3, setContent3] = useState("");
  const [questionStateChange, setQuestionStateChange] = useState("none");
  const [phaseLabel, setPhaseLabel] = useState("theme_setting");
  const [selectedAbilities, setSelectedAbilities] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
    const fetchPost = async () => {
      try {
        const token = getAccessToken();
        if (!token) {
          router.push("/login");
          return;
        }

        const data = await apiFetch(`/posts/${postId}`, {}, token) as {
          problem: string;
          content_1: string;
          content_2: string | null;
          content_3: string | null;
          question_state_change_type: string;
          phase_label: string;
        };
        setProblem(data.problem);
        setContent1(data.content_1);
        setContent2(data.content_2 || "");
        setContent3(data.content_3 || "");
        setQuestionStateChange(data.question_state_change_type);
        setPhaseLabel(data.phase_label);
        // TODO: 既存の能力選択を取得する必要がある場合は追加実装
      } catch (err) {
        console.error("Failed to fetch post:", err);
        setError("投稿の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const token = getAccessToken();
      if (!token) {
        router.push("/login");
        return;
      }

      await apiFetch(
        `/posts/${postId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            problem,
            content_1: content1,
            content_2: content2 || null,
            content_3: content3 || null,
            question_state_change_type: questionStateChange,
            phase_label: phaseLabel,
            ability_codes: selectedAbilities,
          }),
        },
        token
      );

      router.push("/posts");
    } catch (err) {
      console.error("Failed to update post:", err);
      setError("投稿の更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">投稿を編集</h1>
          <p className="mt-2 text-sm text-slate-600">
            探究活動で「やってみたこと」を編集します
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="space-y-6">
              {/* 課題 */}
              <div>
                <label
                  htmlFor="problem"
                  className="block text-sm font-medium text-slate-900 mb-2"
                >
                  現在の課題（問い）
                  <span className="text-red-600 ml-1">*</span>
                </label>
                <input
                  type="text"
                  id="problem"
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                  placeholder="例：地域の高齢化問題について調べる"
                  required
                />
              </div>

              {/* フェーズ */}
              <div>
                <label
                  htmlFor="phase"
                  className="block text-sm font-medium text-slate-900 mb-2"
                >
                  探究フェーズ
                  <span className="text-red-600 ml-1">*</span>
                </label>
                <select
                  id="phase"
                  value={phaseLabel}
                  onChange={(e) => setPhaseLabel(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                >
                  <option value="theme_setting">テーマ設定</option>
                  <option value="information_gathering">情報収集</option>
                  <option value="planning">計画</option>
                  <option value="execution">実行</option>
                  <option value="verification">検証</option>
                  <option value="summary">まとめ</option>
                </select>
              </div>

              {/* 問いの変化 */}
              <div>
                <label
                  htmlFor="stateChange"
                  className="block text-sm font-medium text-slate-900 mb-2"
                >
                  問いの状態変化
                </label>
                <select
                  id="stateChange"
                  value={questionStateChange}
                  onChange={(e) => setQuestionStateChange(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                >
                  <option value="none">変化なし</option>
                  <option value="deepened">問いが深まった</option>
                  <option value="changed">問いが変わった</option>
                </select>
              </div>

              {/* やってみたこと① */}
              <div>
                <label
                  htmlFor="content1"
                  className="block text-sm font-medium text-slate-900 mb-2"
                >
                  やってみたこと①
                  <span className="text-red-600 ml-1">*</span>
                </label>
                <textarea
                  id="content1"
                  value={content1}
                  onChange={(e) => setContent1(e.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                  placeholder="具体的に行ったことを記録してください"
                  required
                />
              </div>

              {/* やってみたこと② */}
              <div>
                <label
                  htmlFor="content2"
                  className="block text-sm font-medium text-slate-900 mb-2"
                >
                  やってみたこと②（任意）
                </label>
                <textarea
                  id="content2"
                  value={content2}
                  onChange={(e) => setContent2(e.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                  placeholder="追加で行ったことがあれば記録してください"
                />
              </div>

              {/* やってみたこと③ */}
              <div>
                <label
                  htmlFor="content3"
                  className="block text-sm font-medium text-slate-900 mb-2"
                >
                  やってみたこと③（任意）
                </label>
                <textarea
                  id="content3"
                  value={content3}
                  onChange={(e) => setContent3(e.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                  placeholder="さらに行ったことがあれば記録してください"
                />
              </div>

              {/* 非認知能力選択 */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-3">
                  伸ばした非認知能力（複数選択可）
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
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">{ability.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push("/me")}
              className="flex-1 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "更新中..." : "更新する"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
