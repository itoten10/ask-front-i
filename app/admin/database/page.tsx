"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ensureAccessToken, fetchMe, MeUser } from "@/lib/session";
import { clearAccessToken } from "@/lib/auth/client";

interface TableData {
  table_name: string;
  total: number;
  limit: number;
  offset: number;
  columns: string[];
  rows: Record<string, any>[];
}

interface TableSchema {
  field: string;
  type: string;
  null: string;
  key: string;
  default: any;
  extra: string;
}

export default function AdminDatabasePage() {
  const router = useRouter();
  const [me, setMe] = useState<MeUser | null>(null);
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [tableSchema, setTableSchema] = useState<TableSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const limit = 50;

  useEffect(() => {
    const init = async () => {
      try {
        const user = await fetchMe();
        if (user.role !== "admin") {
          router.replace("/");
          return;
        }
        setMe(user);
        await fetchTables();
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

  useEffect(() => {
    if (selectedTable && me) {
      fetchTableData(selectedTable, page);
      fetchTableSchema(selectedTable);
    }
  }, [selectedTable, page, me]);

  const fetchTables = async () => {
    try {
      const accessToken = await ensureAccessToken();
      if (!accessToken) {
        router.push("/login");
        return;
      }

      const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8000";
      const response = await fetch(`${API_ENDPOINT}/admin/database/tables`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTables(data);
      } else if (response.status === 401 || response.status === 403) {
        clearAccessToken();
        router.push("/login");
      }
    } catch (err) {
      console.error("Failed to fetch tables:", err);
      setError("テーブル一覧の取得に失敗しました");
    }
  };

  const fetchTableData = async (tableName: string, pageNum: number) => {
    setLoading(true);
    setError("");
    try {
      const accessToken = await ensureAccessToken();
      if (!accessToken) {
        router.push("/login");
        return;
      }

      const offset = pageNum * limit;
      const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8000";
      const response = await fetch(
        `${API_ENDPOINT}/admin/database/tables/${tableName}/data?limit=${limit}&offset=${offset}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTableData(data);
      } else if (response.status === 401 || response.status === 403) {
        clearAccessToken();
        router.push("/login");
      } else {
        setError("データの取得に失敗しました");
      }
    } catch (err) {
      console.error("Failed to fetch table data:", err);
      setError("データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const fetchTableSchema = async (tableName: string) => {
    try {
      const accessToken = await ensureAccessToken();
      if (!accessToken) {
        router.push("/login");
        return;
      }

      const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8000";
      const response = await fetch(
        `${API_ENDPOINT}/admin/database/tables/${tableName}/schema`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTableSchema(data);
      }
    } catch (err) {
      console.error("Failed to fetch table schema:", err);
    }
  };

  const handleTableChange = (tableName: string) => {
    setSelectedTable(tableName);
    setPage(0);
  };

  const handlePrevPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (tableData && (page + 1) * limit < tableData.total) {
      setPage(page + 1);
    }
  };

  const renderValue = (value: any) => {
    if (value === null) return <span className="text-slate-400">NULL</span>;
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  if (loading && !me) {
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">データベース管理</h1>
          <p className="mt-2 text-slate-600">テーブルデータの閲覧</p>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* テーブル選択 */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
          <label htmlFor="table-select" className="mb-2 block text-sm font-medium text-slate-700">
            テーブルを選択
          </label>
          <select
            id="table-select"
            value={selectedTable}
            onChange={(e) => handleTableChange(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
          >
            <option value="">-- テーブルを選択してください --</option>
            {tables.map((table) => (
              <option key={table} value={table}>
                {table}
              </option>
            ))}
          </select>
        </div>

        {/* スキーマ情報 */}
        {selectedTable && tableSchema.length > 0 && (
          <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold text-slate-800">
              スキーマ: {selectedTable}
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                      フィールド
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                      型
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                      NULL
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                      キー
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                      デフォルト
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                      その他
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {tableSchema.map((col, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
                        {col.field}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                        {col.type}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                        {col.null}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                        {col.key}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                        {renderValue(col.default)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                        {col.extra}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* テーブルデータ */}
        {selectedTable && tableData && (
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-800">
                データ: {selectedTable} ({tableData.total} 件)
              </h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePrevPage}
                  disabled={page === 0}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-slate-300"
                >
                  前へ
                </button>
                <span className="text-sm text-slate-600">
                  {page * limit + 1} - {Math.min((page + 1) * limit, tableData.total)} / {tableData.total}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={(page + 1) * limit >= tableData.total}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-slate-300"
                >
                  次へ
                </button>
              </div>
            </div>

            {loading ? (
              <div className="py-8 text-center">
                <p className="text-slate-600">読み込み中...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      {tableData.columns.map((col) => (
                        <th
                          key={col}
                          className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {tableData.rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        {tableData.columns.map((col) => (
                          <td key={col} className="whitespace-nowrap px-4 py-3 text-sm text-slate-900">
                            {renderValue(row[col])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {selectedTable && !tableData && !loading && (
          <div className="rounded-lg bg-white p-6 shadow-md">
            <p className="text-center text-slate-600">データがありません</p>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={() => router.push("/admin")}
            className="rounded-md bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            管理画面に戻る
          </button>
        </div>
      </div>
    </div>
  );
}
