"use client";

import { useState } from "react";

interface MatchedAbility {
  code: string;
  name: string;
  level: number;
  level_reason: string;
  reason: string;
}

interface AnalysisResult {
  matched_abilities: MatchedAbility[];
  analysis_summary: string;
  error?: string;
}

const ABILITIES = [
  { code: "problem_setting", name: "課題設定力", color: "bg-blue-100 text-blue-800", borderColor: "border-blue-300" },
  { code: "information_gathering", name: "情報収集力", color: "bg-green-100 text-green-800", borderColor: "border-green-300" },
  { code: "involvement", name: "巻き込む力", color: "bg-yellow-100 text-yellow-800", borderColor: "border-yellow-300" },
  { code: "communication", name: "対話する力", color: "bg-purple-100 text-purple-800", borderColor: "border-purple-300" },
  { code: "humility", name: "謙虚である力", color: "bg-pink-100 text-pink-800", borderColor: "border-pink-300" },
  { code: "execution", name: "実行する力", color: "bg-orange-100 text-orange-800", borderColor: "border-orange-300" },
  { code: "completion", name: "完遂する力", color: "bg-red-100 text-red-800", borderColor: "border-red-300" },
];

const LEVEL_LABELS: { [key: number]: { label: string; description: string; color: string } } = {
  1: { label: "Lv.1", description: "初歩的", color: "bg-gray-400" },
  2: { label: "Lv.2", description: "発展途上", color: "bg-yellow-400" },
  3: { label: "Lv.3", description: "標準的", color: "bg-blue-400" },
  4: { label: "Lv.4", description: "発展的", color: "bg-green-500" },
  5: { label: "Lv.5", description: "卓越", color: "bg-purple-500" },
};

export default function AbilityAnalysisTestPage() {
  const [problem, setProblem] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!content.trim()) {
      setError("「やってみたこと」を入力してください");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8000";
      const response = await fetch(`${API_ENDPOINT}/ability-analysis/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          problem: problem || null,
          content: content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "分析に失敗しました");
      }

      const data: AnalysisResult = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Analysis failed:", err);
      setError(err instanceof Error ? err.message : "分析中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const getAbilityInfo = (code: string) => {
    return ABILITIES.find(a => a.code === code) || { color: "bg-gray-100 text-gray-800", borderColor: "border-gray-300" };
  };

  const getLevelInfo = (level: number) => {
    return LEVEL_LABELS[level] || LEVEL_LABELS[3];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            AI能力判定テスト
          </h1>
          <p className="mt-2 text-slate-600">
            探究活動の内容を入力すると、AIがどの非認知能力に該当するかを判定し、5段階でレベル評価します
          </p>
        </div>

        {/* 能力一覧 */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">7つの非認知能力</h2>
          <div className="flex flex-wrap gap-2">
            {ABILITIES.map((ability) => (
              <span
                key={ability.code}
                className={`rounded-full px-3 py-1 text-sm font-medium ${ability.color}`}
              >
                {ability.name}
              </span>
            ))}
          </div>
        </div>

        {/* 5段階レベル説明 */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">5段階レベル評価</h2>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((level) => {
              const info = getLevelInfo(level);
              return (
                <div key={level} className="text-center">
                  <div className={`mx-auto w-10 h-10 rounded-full ${info.color} flex items-center justify-center text-white font-bold text-sm mb-1`}>
                    {level}
                  </div>
                  <div className="text-xs font-medium text-slate-700">{info.description}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 入力フォーム */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="space-y-6">
            {/* 課題・問い */}
            <div>
              <label
                htmlFor="problem"
                className="block text-sm font-medium text-slate-900 mb-2"
              >
                課題・問い（任意）
              </label>
              <input
                type="text"
                id="problem"
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                placeholder="例：地域の高齢化問題について調べる"
              />
            </div>

            {/* やってみたこと */}
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-slate-900 mb-2"
              >
                やってみたこと
                <span className="text-red-600 ml-1">*</span>
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                placeholder="例：地域の高齢者施設を訪問し、スタッフの方にインタビューを行いました。高齢化の現状や課題について、実際に働いている方の生の声を聞くことができました。また、調べた内容をチームメンバーと共有し、次の調査計画を立てました。"
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
                {error}
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  AIが分析中...
                </span>
              ) : (
                "AIで能力を判定する"
              )}
            </button>
          </div>
        </div>

        {/* 結果表示 */}
        {result && (
          <div className="mt-8 rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">判定結果</h2>

            {result.matched_abilities.length === 0 ? (
              <div className="rounded-md bg-gray-50 p-4 text-sm text-gray-600">
                該当する能力が見つかりませんでした。もう少し具体的な活動内容を入力してみてください。
              </div>
            ) : (
              <div className="space-y-4">
                {/* マッチした能力 */}
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-3">
                    該当する能力（{result.matched_abilities.length}件）
                  </h3>
                  <div className="space-y-4">
                    {result.matched_abilities.map((ability, index) => {
                      const abilityInfo = getAbilityInfo(ability.code);
                      const levelInfo = getLevelInfo(ability.level);
                      return (
                        <div
                          key={index}
                          className={`rounded-lg border-2 ${abilityInfo.borderColor} p-4`}
                        >
                          {/* ヘッダー: 能力名とレベル */}
                          <div className="flex items-center justify-between mb-3">
                            <span
                              className={`rounded-full px-3 py-1 text-sm font-medium ${abilityInfo.color}`}
                            >
                              {ability.name}
                            </span>
                            <div className="flex items-center gap-2">
                              {/* 5段階レベル表示（該当レベルのみ色付き） */}
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((l) => (
                                  <div
                                    key={l}
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                      l === ability.level
                                        ? `${getLevelInfo(l).color} text-white ring-2 ring-offset-1 ring-${getLevelInfo(l).color.replace('bg-', '')}`
                                        : "bg-gray-200 text-gray-400"
                                    }`}
                                  >
                                    {l}
                                  </div>
                                ))}
                              </div>
                              <span className={`ml-2 px-2 py-1 rounded text-xs font-bold text-white ${levelInfo.color}`}>
                                {levelInfo.description}
                              </span>
                            </div>
                          </div>

                          {/* 該当理由（メイン情報として上に配置） */}
                          <div className="mb-3">
                            <p className="text-sm text-slate-800">
                              {ability.reason}
                            </p>
                          </div>

                          {/* レベル判定理由（補足情報として下に配置） */}
                          <div className="p-2 bg-slate-50 rounded text-xs text-slate-500 border-l-2 border-slate-300">
                            <span className="font-medium">Lv{ability.level}の根拠: </span>
                            {ability.level_reason}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 分析サマリー */}
                {result.analysis_summary && (
                  <div className="mt-4 rounded-md bg-indigo-50 p-4">
                    <h3 className="mb-2 text-sm font-medium text-indigo-900">
                      AIによる分析サマリー
                    </h3>
                    <p className="text-sm text-indigo-700">{result.analysis_summary}</p>
                  </div>
                )}
              </div>
            )}

            {result.error && (
              <div className="mt-4 rounded-md bg-yellow-50 p-4 text-sm text-yellow-800">
                注意: {result.error}
              </div>
            )}
          </div>
        )}

        {/* サンプル入力 */}
        <div className="mt-8 rounded-lg bg-slate-50 p-6">
          <h3 className="mb-3 text-sm font-medium text-slate-700">サンプル入力例</h3>
          <div className="space-y-2 text-sm text-slate-600">
            <p><strong>課題:</strong> 地域の高齢化問題について調べる</p>
            <p><strong>やってみたこと:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>「地域の高齢者施設を訪問し、スタッフの方にインタビューを行いました」</li>
              <li>「チームメンバーと話し合い、役割分担を決めました」</li>
              <li>「調査計画を立て、来週までに実行することにしました」</li>
              <li>「先生からのフィードバックを受け、計画を修正しました」</li>
            </ul>
          </div>
          <button
            onClick={() => {
              setProblem("地域の高齢化問題について調べる");
              setContent("地域の高齢者施設を訪問し、スタッフの方にインタビューを行いました。高齢化の現状や課題について、実際に働いている方の生の声を聞くことができました。また、調べた内容をチームメンバーと共有し、次の調査計画を立てました。先生からのフィードバックを受けて、調査の観点を修正しました。");
            }}
            className="mt-4 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            サンプルを入力する
          </button>
        </div>
      </div>
    </div>
  );
}
