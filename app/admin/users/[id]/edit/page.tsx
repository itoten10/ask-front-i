"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ensureAccessToken, fetchMe } from "@/lib/session";
import { clearAccessToken } from "@/lib/auth/client";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [fullName, setFullName] = useState("");
  const [fullNameKana, setFullNameKana] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("student");
  const [grade, setGrade] = useState("");
  const [className, setClassName] = useState("");
  const [gender, setGender] = useState("unknown");
  const [schoolPersonId, setSchoolPersonId] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        const me = await fetchMe();
        if (me.role !== "admin") {
          router.replace("/me");
          return;
        }

        const accessToken = await ensureAccessToken();
        if (!accessToken) {
          router.push("/login");
          return;
        }

        // ユーザー一覧から該当ユーザーを取得
        const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8000";
        const response = await fetch(
          `${API_ENDPOINT}/admin/users?page=1&page_size=1000`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const user = data.items.find((u: any) => u.id === parseInt(userId));

          if (user) {
            setFullName(user.full_name || "");
            setFullNameKana(user.full_name_kana || "");
            setEmail(user.email || "");
            setRole(user.role || "student");
            setGrade(user.grade?.toString() || "");
            setClassName(user.class_name || "");
            setGender(user.gender || "unknown");
            setSchoolPersonId(user.school_person_id || "");
            setDateOfBirth(user.date_of_birth || "");
            setIsActive(user.is_active);
          } else {
            setError("ユーザーが見つかりませんでした");
          }
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setError("ユーザー情報の取得に失敗しました");
        clearAccessToken();
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [userId, router]);

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
      const response = await fetch(`${API_ENDPOINT}/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          full_name: fullName,
          full_name_kana: fullNameKana || null,
          email,
          role,
          grade: grade ? parseInt(grade) : null,
          class_name: className || null,
          gender,
          school_person_id: schoolPersonId || null,
          date_of_birth: dateOfBirth || null,
          is_active: isActive,
        }),
      });

      if (response.ok) {
        router.push("/admin/users");
      } else {
        const data = await response.json();
        setError(data.detail || "ユーザーの更新に失敗しました");
      }
    } catch (err) {
      console.error("Failed to update user:", err);
      setError("ユーザーの更新に失敗しました");
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
          <h1 className="text-2xl font-semibold text-slate-900">ユーザーを編集</h1>
          <p className="mt-2 text-sm text-slate-600">
            ユーザー情報を編集します
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
              {/* 氏名 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    氏名 <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    氏名(かな)
                  </label>
                  <input
                    type="text"
                    value={fullNameKana}
                    onChange={(e) => setFullNameKana(e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* メールアドレス */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  メールアドレス <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              {/* ロール */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  ロール <span className="text-red-600">*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                >
                  <option value="student">生徒</option>
                  <option value="teacher">教師</option>
                  <option value="admin">管理者</option>
                </select>
              </div>

              {/* 学年・クラス */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    学年
                  </label>
                  <input
                    type="number"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    クラス
                  </label>
                  <input
                    type="text"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* 性別 */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  性別
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                >
                  <option value="unknown">未設定</option>
                  <option value="male">男性</option>
                  <option value="female">女性</option>
                  <option value="other">その他</option>
                </select>
              </div>

              {/* 学校内ID */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  学校内ID
                </label>
                <input
                  type="text"
                  value={schoolPersonId}
                  onChange={(e) => setSchoolPersonId(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* 生年月日 */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  生年月日
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* アクティブ状態 */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-slate-700">
                  アクティブ
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push("/admin/users")}
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
