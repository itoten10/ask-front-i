"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ensureAccessToken, fetchMe, MeUser } from "@/lib/session";
import { clearAccessToken } from "@/lib/auth/client";

interface LearningProgress {
  user_id: number;
  full_name: string;
  grade: number | null;
  class_name: string | null;
  phase: string;
  post_count: number;
  question_change_count: number;
  last_posted_at: string | null;
  intervention_flag: boolean;
}

interface AbilityData {
  user_id: number;
  full_name: string;
  grade: number | null;
  class_name: string | null;
  post_count: number;
  received_letters_count: number;
  sent_letters_count: number;
  abilities: {
    problem_setting: number;
    information_gathering: number;
    involvement: number;
    communication: number;
    execution: number;
    humility: number;
    completion: number;
  };
}

const abilityNames = {
  problem_setting: "課題設定力",
  information_gathering: "情報収集力",
  involvement: "巻き込む力",
  communication: "対話する力",
  humility: "謙虚である力",
  execution: "実行する力",
  completion: "完遂する力",
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [me, setMe] = useState<MeUser | null>(null);
  const [learningProgress, setLearningProgress] = useState<LearningProgress[]>([]);
  const [abilityData, setAbilityData] = useState<AbilityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"learning" | "ability">("learning");

  useEffect(() => {
    const init = async () => {
      try {
        const user = await fetchMe();
        if (user.role !== "admin" && user.role !== "teacher") {
          router.replace("/");
          return;
        }
        setMe(user);
        await Promise.all([fetchLearningProgress(), fetchAbilityData()]);
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

  const fetchLearningProgress = async () => {
    try {
      const accessToken = await ensureAccessToken();
      if (!accessToken) return;

      const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8000";
      const response = await fetch(`${API_ENDPOINT}/dashboard/learning-progress`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setLearningProgress(data);
      }
    } catch (err) {
      console.error("Failed to fetch learning progress:", err);
    }
  };

  const fetchAbilityData = async () => {
    try {
      const accessToken = await ensureAccessToken();
      if (!accessToken) return;

      const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8000";
      const response = await fetch(`${API_ENDPOINT}/dashboard/non-cognitive-abilities`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAbilityData(data);
      }
    } catch (err) {
      console.error("Failed to fetch ability data:", err);
    }
  };

  if (loading || !me) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-slate-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-800">ダッシュボード</h1>
          <button
            onClick={() => router.back()}
            className="rounded-md bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            戻る
          </button>
        </div>

        {/* タブ */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab("learning")}
            className={`rounded-md px-6 py-3 font-medium ${
              activeTab === "learning"
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            探求学習の進捗
          </button>
          <button
            onClick={() => setActiveTab("ability")}
            className={`rounded-md px-6 py-3 font-medium ${
              activeTab === "ability"
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            非認知能力
          </button>
        </div>

        {/* 探求学習の進捗 */}
        {activeTab === "learning" && (
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold text-slate-800">
              探求学習の進捗状況（生徒一覧）
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                      状態
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                      氏名
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                      学年・クラス
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                      フェーズ
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                      投稿数
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                      問いの変更
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                      最終投稿日
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {learningProgress.map((student) => (
                    <tr key={student.user_id} className={`hover:bg-slate-50 ${student.intervention_flag ? "bg-red-50" : ""}`}>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        {student.intervention_flag ? (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                            要介入
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            順調
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
                        {student.full_name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                        {student.grade && student.class_name
                          ? `${student.grade}年${student.class_name}組`
                          : "-"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                        {student.phase}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                        {student.post_count}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                        {student.question_change_count}回
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                        {student.last_posted_at
                          ? new Date(student.last_posted_at).toLocaleDateString("ja-JP")
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 非認知能力 */}
        {activeTab === "ability" && (
          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold text-slate-800">
                非認知能力データ（生徒一覧）
              </h2>
              <p className="mb-4 text-sm text-slate-600">
                ※ スコアは投稿数と受け取った感謝の手紙数を基に暫定的に算出しています
              </p>
              <div className="space-y-6">
                {abilityData.map((student) => (
                  <div key={student.user_id} className="border-b border-slate-200 pb-6 last:border-0">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-slate-900">{student.full_name}</h3>
                        <p className="text-sm text-slate-500">
                          {student.grade && student.class_name
                            ? `${student.grade}年${student.class_name}組`
                            : ""}
                          {" | "}投稿数: {student.post_count} / 受信: {student.received_letters_count} /
                          送信: {student.sent_letters_count}
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {Object.entries(student.abilities).map(([key, value]) => (
                        <div key={key} className="rounded-lg bg-slate-50 p-3">
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700">
                              {abilityNames[key as keyof typeof abilityNames]}
                            </span>
                            <span className="text-sm font-semibold text-blue-600">{value}</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-200">
                            <div
                              className="h-2 rounded-full bg-blue-600"
                              style={{ width: `${value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
