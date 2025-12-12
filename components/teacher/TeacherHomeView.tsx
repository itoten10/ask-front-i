// ask-front-i/components/teacher/TeacherHomeView.tsx

"use client";

import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Filter, Download } from "lucide-react";
import { useState } from "react";

// BACKEND_INTEGRATION: 将来的にはAPIから取得
// API_CONTRACT: GET /api/teacher/students/progress
interface StudentProgress {
  id: string;
  name: string;
  interventionFlag: boolean;
  phase: string;
  questionChangeCount: number;
  postCount: number;
  lastPostDate: string;
  signalColor: "green" | "yellow" | "red";
}

// API_CONTRACT: GET /api/teacher/students/non-cognitive
interface NonCognitiveData {
  id: string;
  name: string;
  overall: "green" | "yellow" | "red";
  problemSetting: "green" | "yellow" | "red";
  infoGathering: "green" | "yellow" | "red";
  commitment: "green" | "yellow" | "red";
  communication: "green" | "yellow" | "red";
}

export function TeacherHomeView() {
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [selectedPhase, setSelectedPhase] = useState("all");
  const [postCountOrder, setPostCountOrder] = useState("all");

  // NOTE(MOCK): MVP用のダミーデータ
  const progressData: StudentProgress[] = [
    { id: "S001", name: "江藤 泰平", interventionFlag: true, phase: "課題設定", questionChangeCount: 0, postCount: 12, lastPostDate: "11/29", signalColor: "green" },
    { id: "S002", name: "由井 理月", interventionFlag: false, phase: "情報収集", questionChangeCount: 0, postCount: 8, lastPostDate: "11/15", signalColor: "green" },
    { id: "S003", name: "伊藤 誠人", interventionFlag: true, phase: "課題設定", questionChangeCount: 1, postCount: 9, lastPostDate: "11/06", signalColor: "yellow" },
    { id: "S004", name: "髙橋 由華", interventionFlag: false, phase: "情報収集", questionChangeCount: 1, postCount: 10, lastPostDate: "11/14", signalColor: "red" },
    { id: "S005", name: "佐藤 健太", interventionFlag: false, phase: "情報収集", questionChangeCount: 1, postCount: 3, lastPostDate: "11/03", signalColor: "red" },
    { id: "S006", name: "鈴木 花子", interventionFlag: true, phase: "整理・分析", questionChangeCount: 2, postCount: 5, lastPostDate: "10/29", signalColor: "yellow" },
    { id: "S007", name: "田中 太郎", interventionFlag: false, phase: "まとめ・表現", questionChangeCount: 3, postCount: 9, lastPostDate: "10/29", signalColor: "green" },
    { id: "S008", name: "山田 次郎", interventionFlag: true, phase: "整理・分析", questionChangeCount: 3, postCount: 6, lastPostDate: "10/20", signalColor: "green" },
  ];

  const nonCognitiveData: NonCognitiveData[] = [
    { id: "S001", name: "江藤 泰平", overall: "green", problemSetting: "yellow", infoGathering: "red", commitment: "green", communication: "yellow" },
    { id: "S002", name: "由井 理月", overall: "green", problemSetting: "green", infoGathering: "yellow", commitment: "green", communication: "green" },
    { id: "S003", name: "伊藤 誠人", overall: "yellow", problemSetting: "red", infoGathering: "green", commitment: "yellow", communication: "red" },
    { id: "S004", name: "髙橋 由華", overall: "red", problemSetting: "yellow", infoGathering: "red", commitment: "red", communication: "yellow" },
    { id: "S005", name: "佐藤 健太", overall: "red", problemSetting: "yellow", infoGathering: "green", commitment: "red", communication: "yellow" },
    { id: "S006", name: "鈴木 花子", overall: "yellow", problemSetting: "yellow", infoGathering: "yellow", commitment: "yellow", communication: "green" },
    { id: "S007", name: "田中 太郎", overall: "green", problemSetting: "yellow", infoGathering: "red", commitment: "green", communication: "yellow" },
    { id: "S008", name: "山田 次郎", overall: "green", problemSetting: "green", infoGathering: "yellow", commitment: "yellow", communication: "green" },
  ];

  const getSignalDot = (color: "green" | "yellow" | "red") => {
    const bgColor = color === "green" ? "bg-green-500" : color === "yellow" ? "bg-yellow-500" : "bg-red-500";
    return <div className={`h-4 w-4 rounded-full mx-auto ${bgColor}`} />;
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">評価基準詳細</h1>
          <p className="text-slate-500 mt-1">2年4組 / メディアラボ</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" /> CSV出力
          </Button>
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
            <Filter className="mr-2 h-4 w-4" /> すべての選択を解除
          </Button>
        </div>
      </div>

      {/* タブ切り替え */}
      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="progress" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            探究学習 進捗状況
          </TabsTrigger>
          <TabsTrigger value="non-cognitive" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            非認知知能データ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="mt-6 space-y-6">
          {/* フィルターエリア - 左サイドバー風 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 左：フィルターカード */}
            <Card className="lg:col-span-3 p-6 bg-purple-50 border-purple-200 space-y-6">
              <div>
                <p className="text-sm font-bold text-slate-700 mb-3">ゼミ・クラス</p>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="media">メディアラボ</SelectItem>
                    <SelectItem value="science">サイエンスラボ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-700 mb-3">チーム</p>
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="team1">チーム1</SelectItem>
                    <SelectItem value="team2">チーム2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-700 mb-3">直近の状況</p>
                <Select value={selectedPhase} onValueChange={setSelectedPhase}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="setting">課題設定</SelectItem>
                    <SelectItem value="gathering">情報収集</SelectItem>
                    <SelectItem value="analysis">整理・分析</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-700 mb-3">投稿数</p>
                <Select value={postCountOrder} onValueChange={setPostCountOrder}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="desc">多い順</SelectItem>
                    <SelectItem value="asc">少ない順</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* 右：テーブル */}
            <Card className="lg:col-span-9 border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gradient-to-r from-teal-700 to-teal-800">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-bold text-white">氏名</TableHead>
                      <TableHead className="text-center font-bold text-white">介入フラグ</TableHead>
                      <TableHead className="text-center font-bold text-white">フェーズ</TableHead>
                      <TableHead className="text-center font-bold text-white">課題変更回数</TableHead>
                      <TableHead className="text-center font-bold text-white">投稿数</TableHead>
                      <TableHead className="text-center font-bold text-white">最終投稿日</TableHead>
                      <TableHead className="text-center font-bold text-white">非認知知能力<br/>発揮状況</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {progressData.map((student) => (
                    <TableRow key={student.id} className="hover:bg-purple-50/30 cursor-pointer transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {student.interventionFlag && <span className="text-purple-600 font-bold">▶</span>}
                          {student.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {student.interventionFlag ? <span className="text-purple-600 font-bold">▶</span> : ""}
                      </TableCell>
                      <TableCell className="text-center">{student.phase}</TableCell>
                      <TableCell className="text-center">{student.questionChangeCount}</TableCell>
                      <TableCell className="text-center font-semibold">{student.postCount}</TableCell>
                      <TableCell className="text-center">{student.lastPostDate}</TableCell>
                      <TableCell className="text-center">
                        {getSignalDot(student.signalColor)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* 非認知知能データ */}
        <TabsContent value="non-cognitive" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 左：フィルターカード */}
            <Card className="lg:col-span-3 p-6 bg-purple-50 border-purple-200 space-y-6">
              <div>
                <p className="text-sm font-bold text-slate-700 mb-3">ゼミ・クラス</p>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="media">メディアラボ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-700 mb-3">チーム</p>
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="team1">チーム1</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-700 mb-3">直近の状況</p>
                <Select value={selectedPhase} onValueChange={setSelectedPhase}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-700 mb-3">投稿数</p>
                <Select value={postCountOrder} onValueChange={setPostCountOrder}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* 右：テーブル */}
            <Card className="lg:col-span-9 border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gradient-to-r from-teal-700 to-teal-800">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-bold text-white">氏名</TableHead>
                      <TableHead className="text-center font-bold text-white">総合</TableHead>
                      <TableHead className="text-center font-bold text-white">課題設定力</TableHead>
                      <TableHead className="text-center font-bold text-white">情報収集力</TableHead>
                      <TableHead className="text-center font-bold text-white">巻き込み力</TableHead>
                      <TableHead className="text-center font-bold text-white">対話する力</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {nonCognitiveData.map((student) => (
                      <TableRow key={student.id} className="hover:bg-purple-50/30 cursor-pointer transition-colors">
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell className="text-center">{getSignalDot(student.overall)}</TableCell>
                        <TableCell className="text-center">{getSignalDot(student.problemSetting)}</TableCell>
                        <TableCell className="text-center">{getSignalDot(student.infoGathering)}</TableCell>
                        <TableCell className="text-center">{getSignalDot(student.commitment)}</TableCell>
                        <TableCell className="text-center">{getSignalDot(student.communication)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
