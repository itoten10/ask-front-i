"use client";

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Download } from "lucide-react";

export default function TeacherPage() {
  // ダミーデータ：生徒の進捗
  const students = [
    { id: "S001", name: "江藤 泰平", tasks: 12, lastDate: "11/29", status: "high", scores: [5, 4, 4, 5] },
    { id: "S002", name: "由井 理月", tasks: 8, lastDate: "11/15", status: "high", scores: [4, 5, 4, 5] },
    { id: "S003", name: "伊藤 誠人", tasks: 9, lastDate: "11/06", status: "high", scores: [3, 3, 5, 3] },
    { id: "S004", name: "髙橋 由華", tasks: 10, lastDate: "11/14", status: "mid", scores: [4, 4, 4, 4] },
    { id: "S005", name: "佐藤 健太", tasks: 3, lastDate: "11/03", status: "low", scores: [2, 2, 3, 2] },
    { id: "S006", name: "鈴木 花子", tasks: 5, lastDate: "10/29", status: "mid", scores: [3, 4, 3, 3] },
    { id: "S007", name: "田中 太郎", tasks: 9, lastDate: "10/29", status: "high", scores: [5, 5, 4, 5] },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "high": return <Badge className="bg-green-500 hover:bg-green-600">高</Badge>;
      case "mid": return <Badge className="bg-yellow-500 hover:bg-yellow-600">中</Badge>;
      case "low": return <Badge variant="destructive">低</Badge>;
      default: return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 5) return "bg-green-500";
    if (score >= 4) return "bg-green-400";
    if (score === 3) return "bg-yellow-400";
    return "bg-red-500";
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole="teacher" />
      
      <div className="flex-1 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">探究学習 プロセス進捗状況</h1>
                <p className="text-slate-500">2年4組 / メディアラボ</p>
              </div>
              <div className="flex gap-2">
                 <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" /> CSV出力
                </Button>
                <Button className="bg-primary hover:bg-primary/90">
                  <Filter className="mr-2 h-4 w-4" /> フィルター
                </Button>
              </div>
            </div>

            {/* フィルターエリア */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">ゼミ・クラス</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select defaultValue="all">
                    <SelectTrigger><SelectValue placeholder="選択" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="media">メディアラボ</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
              <Card>
                 <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">投稿数</CardTitle>
                </CardHeader>
                <CardContent>
                   <Select defaultValue="desc">
                    <SelectTrigger><SelectValue placeholder="順序" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">多い順</SelectItem>
                      <SelectItem value="asc">少ない順</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>

            {/* メインテーブル */}
            <Card className="border shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-primary/5">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700">氏名</TableHead>
                    <TableHead className="text-center font-bold text-slate-700">課題設定力</TableHead>
                    <TableHead className="text-center font-bold text-slate-700">情報収集力</TableHead>
                    <TableHead className="text-center font-bold text-slate-700">創造的思考力</TableHead>
                    <TableHead className="text-center font-bold text-slate-700">主体性</TableHead>
                    <TableHead className="text-center font-bold text-slate-700">投稿数</TableHead>
                    <TableHead className="text-center font-bold text-slate-700">最終投稿日</TableHead>
                    <TableHead className="text-center font-bold text-slate-700">貢献度</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id} className="hover:bg-slate-50 cursor-pointer">
                      <TableCell className="font-medium">{student.name}</TableCell>
                      {/* スコアの丸ポチ表示 */}
                      {student.scores.map((score, i) => (
                        <TableCell key={i} className="text-center">
                          <div className={`h-4 w-4 rounded-full mx-auto ${getScoreColor(score)}`} />
                        </TableCell>
                      ))}
                      <TableCell className="text-center">{student.tasks}</TableCell>
                      <TableCell className="text-center">{student.lastDate}</TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(student.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

          </div>
        </main>
      </div>
    </div>
  );
}