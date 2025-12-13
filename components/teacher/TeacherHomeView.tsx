// components/teacher/TeacherHomeView.tsx

"use client";

import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Filter, Download } from "lucide-react";
import { FeatureInfoModal } from "@/components/student/FeatureInfoModal";
import { useState } from "react";

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

interface NonCognitiveData {
  id: string;
  name: string;
  overall: "green" | "yellow" | "red";
  problemSetting: "green" | "yellow" | "red";
  infoGathering: "green" | "yellow" | "red";
  commitment: "green" | "yellow" | "red";
  communication: "green" | "yellow" | "red";
}

// ★追加: Propsの定義
interface TeacherHomeViewProps {
  filters?: {
    class: string;
    phase: string;
    questionChange: string;
    order: string;
  };
}

export function TeacherHomeView({ filters }: TeacherHomeViewProps) {
  // モバイル用フィルター警告モーダル
  const [showMobileFilterInfo, setShowMobileFilterInfo] = useState(false);

  // NOTE(MOCK): MVP用のダミーデータ
  // BACKEND_INTEGRATION: props.filters を使ってAPIリクエストパラメータを変えるか、クライアント側でフィルタリングする
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
      {/* モバイル用フィルターお知らせ */}
      <FeatureInfoModal
        open={showMobileFilterInfo}
        onClose={() => setShowMobileFilterInfo(false)}
        title="フィルター機能"
        description="モバイル版での詳細な絞り込み機能は、フェーズ2以降で最適化して実装予定です。現在はPC版をご利用ください。"
      />

      {/* ヘッダー */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">評価基準詳細</h1>
          <p className="text-slate-500 mt-1">2年4組 / メディアラボ</p>
        </div>
        <div className="flex gap-2">
          {/* モバイルのみ表示する簡易フィルターボタン */}
          <Button 
            variant="outline" 
            size="sm" 
            className="lg:hidden"
            onClick={() => setShowMobileFilterInfo(true)}
          >
            <Filter className="mr-2 h-4 w-4" /> 絞り込み
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" /> CSV出力
          </Button>
        </div>
      </div>

      {/* タブ切り替え */}
      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="progress" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            探究学習 進捗状況
          </TabsTrigger>
          <TabsTrigger value="non-cognitive" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            非認知知能データ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-4">
          {/* テーブルのみ表示（左サイドバーのカードを削除） */}
          <Card className="border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gradient-to-r from-teal-700 to-teal-800">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-bold text-white min-w-[120px]">氏名</TableHead>
                    <TableHead className="text-center font-bold text-white min-w-[80px]">介入フラグ</TableHead>
                    <TableHead className="text-center font-bold text-white min-w-[100px]">フェーズ</TableHead>
                    <TableHead className="text-center font-bold text-white min-w-[100px]">課題変更回数</TableHead>
                    <TableHead className="text-center font-bold text-white min-w-[80px]">投稿数</TableHead>
                    <TableHead className="text-center font-bold text-white min-w-[100px]">最終投稿日</TableHead>
                    <TableHead className="text-center font-bold text-white min-w-[120px]">非認知知能力<br/>発揮状況</TableHead>
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
        </TabsContent>

        <TabsContent value="non-cognitive" className="space-y-4">
          <Card className="border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gradient-to-r from-teal-700 to-teal-800">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-bold text-white min-w-[120px]">氏名</TableHead>
                    <TableHead className="text-center font-bold text-white min-w-[80px]">総合</TableHead>
                    <TableHead className="text-center font-bold text-white min-w-[100px]">課題設定力</TableHead>
                    <TableHead className="text-center font-bold text-white min-w-[100px]">情報収集力</TableHead>
                    <TableHead className="text-center font-bold text-white min-w-[100px]">巻き込み力</TableHead>
                    <TableHead className="text-center font-bold text-white min-w-[100px]">対話する力</TableHead>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}