// ask-front-i/components/teacher/TeacherHomeView.tsx

"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Filter, Download, Flag, Info } from "lucide-react";
import { FeatureInfoModal } from "@/components/student/FeatureInfoModal";
import { useState } from "react";
import { cn } from "@/lib/utils";

// ==========================================
// Types & Backend Integration
// ==========================================

// BACKEND_INTEGRATION: student_progress_snapshots テーブル + users テーブルの結合データを想定
// API_CONTRACT: GET /api/v1/teacher/dashboard/progress?period_id=1
// NOTE: period_id は MVPでは 1 固定を想定
interface StudentProgressData {
  user_id: number;                // users.id
  name: string;                   // users.full_name
  seminar: string;                // users.class_or_seminar (または別途紐づけ)
  intervention_flag: boolean;     // student_progress_snapshots.intervention_flag
  current_phase: string;          // student_progress_snapshots.current_phase_label
  question_change_count: number;  // student_progress_snapshots.question_change_count
  post_count: number;             // student_progress_snapshots.total_action_count (行動量)
  last_posted_at: string;         // student_progress_snapshots.last_posted_at (MM/DD形式に変換済)
  overall_signal: "green" | "yellow" | "red"; // student_progress_snapshots.overall_signal_color
}

// NOTE(DB): non_cog_scores テーブルのデータを想定
// API_CONTRACT: GET /api/v1/teacher/dashboard/non-cognitive?period_id=1
interface NonCognitiveData {
  user_id: number;                // users.id
  name: string;                   // users.full_name
  overall: "green" | "yellow" | "red";          // non_cog_scores (ability_id=OVERALL).signal_color
  // 以下、各能力のスコアバンド色 (non_cog_scores テーブルから ability_id ごとに取得して展開)
  p1_setting: "green" | "yellow" | "red";       // ability_id=1 (課題設定)
  p2_gathering: "green" | "yellow" | "red";     // ability_id=2 (情報収集)
  p3_involving: "green" | "yellow" | "red";     // ability_id=3 (巻き込み)
  p4_communication: "green" | "yellow" | "red"; // ability_id=4 (対話)
}

interface TeacherHomeViewProps {
  filters?: {
    class: string;
    phase: string;
    questionChange: string;
    order: string;
  };
}

export function TeacherHomeView({ filters }: TeacherHomeViewProps) {
  const [showMobileFilterInfo, setShowMobileFilterInfo] = useState(false);
  const [showLogicInfo, setShowLogicInfo] = useState(false); // 計算ロジックモーダル用

  // ゼミリスト (Mock用)
  const seminarList = [
    "メディアラボ", "サイエンスラボ", "国際ゼミ", "工学ラボ", "社会科学ゼミ",
    "フィジカルラボ", "文化教育ゼミ", "地域ビジネスゼミ", "１－１ 地域共創", "１－２ 地域共創"
  ];

  // ==========================================
  // NOTE(MOCK): ダミーデータ生成 (20名分)
  // ==========================================
  const rawData = [
    { name: "江藤 泰平", flag: true, phase: "課題設定", change: 0, post: 12, date: "11/29", signal: "green" },
    { name: "由井 理月", flag: false, phase: "情報収集", change: 0, post: 8, date: "11/15", signal: "green" },
    { name: "伊藤 誠人", flag: true, phase: "課題設定", change: 1, post: 9, date: "11/06", signal: "yellow" },
    { name: "髙橋 由華", flag: false, phase: "情報収集", change: 1, post: 10, date: "11/14", signal: "red" },
    // 追加16名
    { name: "佐藤 健太", flag: false, phase: "情報収集", change: 1, post: 3, date: "11/03", signal: "red" },
    { name: "鈴木 花子", flag: true, phase: "整理・分析", change: 2, post: 5, date: "10/29", signal: "yellow" },
    { name: "田中 太郎", flag: false, phase: "まとめ・表現", change: 3, post: 9, date: "10/29", signal: "green" },
    { name: "山田 次郎", flag: true, phase: "整理・分析", change: 3, post: 6, date: "10/20", signal: "green" },
    { name: "木村 拓哉", flag: false, phase: "実験・調査", change: 0, post: 15, date: "11/30", signal: "green" },
    { name: "斎藤 飛鳥", flag: false, phase: "発表準備", change: 4, post: 22, date: "11/30", signal: "green" },
    { name: "西野 七瀬", flag: true, phase: "テーマ設定", change: 0, post: 1, date: "10/01", signal: "red" },
    { name: "白石 麻衣", flag: false, phase: "情報収集", change: 1, post: 4, date: "11/25", signal: "yellow" },
    { name: "生田 絵梨花", flag: false, phase: "整理・分析", change: 2, post: 11, date: "11/28", signal: "green" },
    { name: "秋元 真夏", flag: true, phase: "課題設定", change: 5, post: 8, date: "11/10", signal: "yellow" },
    { name: "山下 美月", flag: false, phase: "実験・調査", change: 2, post: 14, date: "11/29", signal: "green" },
    { name: "梅澤 美波", flag: false, phase: "まとめ・表現", change: 3, post: 18, date: "11/30", signal: "green" },
    { name: "久保 史緒里", flag: true, phase: "情報収集", change: 0, post: 2, date: "10/15", signal: "red" },
    { name: "与田 祐希", flag: false, phase: "整理・分析", change: 1, post: 7, date: "11/20", signal: "yellow" },
    { name: "遠藤 さくら", flag: false, phase: "実験・調査", change: 2, post: 10, date: "11/27", signal: "green" },
    { name: "賀喜 遥香", flag: false, phase: "発表準備", change: 3, post: 20, date: "11/30", signal: "green" },
  ];

  const progressData: StudentProgressData[] = rawData.map((d, i) => ({
    user_id: i + 1,
    name: d.name,
    seminar: i < 4 ? "メディアラボ" : seminarList[Math.floor(Math.random() * seminarList.length)],
    intervention_flag: d.flag,
    current_phase: d.phase,
    question_change_count: d.change,
    post_count: d.post,
    last_posted_at: d.date,
    overall_signal: d.signal as "green" | "yellow" | "red",
  }));

  const nonCogData: NonCognitiveData[] = progressData.map(p => ({
    user_id: p.user_id,
    name: p.name,
    overall: p.overall_signal,
    p1_setting: p.overall_signal === "green" ? "green" : "yellow",
    p2_gathering: p.overall_signal === "red" ? "red" : "green",
    p3_involving: p.overall_signal === "yellow" ? "red" : "green",
    p4_communication: "green",
  }));

  const getSignalDot = (color: "green" | "yellow" | "red") => {
    const colorClass = 
      color === "green" ? "bg-green-500" : 
      color === "yellow" ? "bg-yellow-400" : 
      "bg-red-500";
    return <div className={`h-4 w-4 rounded-full mx-auto ${colorClass}`} />;
  };

  return (
    <div className="space-y-4">
      <FeatureInfoModal
        open={showMobileFilterInfo}
        onClose={() => setShowMobileFilterInfo(false)}
        title="フィルター機能"
        description="モバイル版での詳細な絞り込み機能は、フェーズ2以降で最適化して実装予定です。現在はPC版をご利用ください。"
      />

      {/* 詳細なルーブリックと計算ロジックを表示するモーダル */}
      <FeatureInfoModal
        open={showLogicInfo}
        onClose={() => setShowLogicInfo(false)}
        title="評価基準とポイント集計ロジック"
        description={
          <div className="text-left text-sm space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            
            {/* 集計ロジック */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 border-b pb-1">① ポイント集計方法</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                行動ログと感謝の手紙の内容が、以下の7つの能力のどれに該当するかをAIが判別し、該当する場合のみポイントを加算します。
              </p>
              <div className="bg-slate-50 border rounded p-3 text-xs">
                <p className="font-bold mb-1">加算ルール:</p>
                <ul className="list-disc list-inside space-y-1 ml-1">
                  <li><strong>行動ログ（自己評価）</strong>: 1回につき <span className="font-bold text-primary">1ポイント</span></li>
                  <li><strong>感謝の手紙（他者評価）</strong>: 1回につき <span className="font-bold text-primary">3ポイント</span></li>
                </ul>
                <p className="mt-2 text-slate-500">※初期フェーズでは内容の「質」は考慮せず、行動の有無（量）を可視化します。</p>
              </div>
            </div>

            {/* ルーブリック詳細 */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 border-b pb-1">② 非認知能力ルーブリック（評価基準）</h4>
              
              <div className="space-y-4">
                {[
                  {
                    title: "1. 情報収集能力",
                    desc: "問いに答えるために、必要な情報を集め・確かめ・整理できる",
                    levels: [
                      "何を調べるべきかが曖昧で、調べずに思い込みで進めることが多い",
                      "検索で情報を集めるが、単発で終わりやすい（メモや引用が不十分）",
                      "問いに必要なキーワードを考えて調べ、メモに残せる",
                      "情報の信頼性を確認し、異なる立場の情報を比較できる",
                      "一次情報を設計し、他者が追跡できる形で体系化して共有できる"
                    ]
                  },
                  {
                    title: "2. 課題設定能力",
                    desc: "探究に耐える“良い問い”をつくり、検証可能な形に整えられる",
                    levels: [
                      "テーマが「好き・面白そう」で止まり、問いになっていない",
                      "問いはあるが広すぎる／曖昧で、答えが定まらない",
                      "「何を」「なぜ」「どう確かめるか」が揃った問いを置ける",
                      "仮説を立て、検証の方法（データ／観察／比較）を設計できる",
                      "調査の途中で問いを磨き直し、より本質的な問いへ再設計できる"
                    ]
                  },
                  {
                    title: "3. 巻き込む力",
                    desc: "探究を深めるために、適切な人・資源・協力を得られる",
                    levels: [
                      "困っても相談せず、抱え込んで停滞する",
                      "近い友人や先生には相談できるが、目的や依頼が曖昧",
                      "探究を進めるために、必要な相手に相談・依頼ができる",
                      "インタビュー先・協力者を自分で開拓し、関係を継続できる",
                      "人と人をつなぎ、周囲が自発的に協力したくなる場をつくれる"
                    ]
                  },
                  {
                    title: "4. 対話する力",
                    desc: "聞き取り・議論・発表を通じて、相手の本音や示唆を引き出し探究に活かす",
                    levels: [
                      "相手の話を十分に聞けず、必要な情報が取れない",
                      "質問が誘導的／浅く、探究に繋がる材料が得られない",
                      "オープンクエスチョンで聞き、要点を要約して確認できる",
                      "インタビュー設計をして、本質に近づく対話ができる",
                      "対話を通じて相手の気づきも生み、協力関係を強められる"
                    ]
                  },
                  {
                    title: "5. 実行する力",
                    desc: "仮説検証を“まずやってみる”形で進め、改善しながら前に進める",
                    levels: [
                      "計画やアイデアで止まり、検証行動に移れない",
                      "一度は動くが、記録や振り返りが弱く学びが積み上がらない",
                      "小さな検証（試作・観察等）を回し、結果を記録できる",
                      "検証計画を立て、継続的に改善できる",
                      "周囲も巻き込みながら検証サイクルを高速で回せる"
                    ]
                  },
                  {
                    title: "6. 謙虚である力",
                    desc: "フィードバックを歓迎し、他者の知見を取り入れて探究の精度を上げる",
                    levels: [
                      "指摘を拒んだり、言い訳が先に出て改善が起きない",
                      "指摘は聞くが、行動や成果物に反映されにくい",
                      "指摘を受け止め、必要な修正を行える",
                      "自分から批評を取りに行き、反証を歓迎して精度を上げられる",
                      "学び合いの文化をつくり、周囲の探究姿勢まで良くしていける"
                    ]
                  },
                  {
                    title: "7. 完遂する力",
                    desc: "期限までに成果物を仕上げ、学びを言語化して次へつなげる",
                    levels: [
                      "途中で止まり、成果物が完成しない／提出できない",
                      "最低限は形にするが、根拠・構成・検証が弱い",
                      "期限までに成果物を完成させ、学びを整理できる",
                      "根拠の提示が明確で、第三者が理解できる品質になっている",
                      "成果を資産化し、次の探究や他者の探究に再利用できる"
                    ]
                  }
                ].map((item, i) => (
                  <div key={i} className="border rounded-md overflow-hidden text-xs">
                    <div className="bg-slate-100 p-2 font-bold text-slate-800 border-b">
                      {item.title}
                      <span className="block text-[10px] font-normal text-slate-500 mt-0.5">{item.desc}</span>
                    </div>
                    <div className="p-2 space-y-1 bg-white">
                      {item.levels.map((lvl, idx) => (
                        <div key={idx} className="flex gap-2">
                          <span className={cn(
                            "font-bold shrink-0 w-8 text-center rounded px-1",
                            idx < 2 ? "bg-red-50 text-red-600" : idx === 2 ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
                          )}>Lv.{idx + 1}</span>
                          <span className="text-slate-600">{lvl}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        }
      />

      {/* ヘッダーエリア: 「評価基準詳細」ボタンを小さく配置 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowLogicInfo(true)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors group"
          >
            <Info className="w-4 h-4" />
            <span className="border-b border-dotted border-slate-400 group-hover:border-primary">評価基準詳細</span>
          </button>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="lg:hidden"
            onClick={() => setShowMobileFilterInfo(true)}
          >
            <Filter className="mr-2 h-4 w-4" /> 絞り込み
          </Button>
          <Button variant="outline" size="sm" className="bg-white hover:bg-slate-50 text-slate-700 border-slate-300">
            <Download className="mr-2 h-4 w-4" /> CSV出力
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-white shadow-sm">
            すべての選択を解除
          </Button>
        </div>
      </div>

      <Tabs defaultValue="progress" className="w-full gap-0">
        {/* タブとテーブルを完全に一体化 */}
        <div className="flex w-full items-end gap-0">
          <TabsList className="flex-1 justify-start p-0 gap-0 mb-0 h-auto bg-white border border-slate-200 border-b-0 rounded-none overflow-hidden shadow-none">
            <TabsTrigger 
              value="progress" 
              className="
                rounded-none 
                px-6 py-3 font-bold text-sm
                data-[state=active]:bg-primary data-[state=active]:text-white
                data-[state=inactive]:bg-white data-[state=inactive]:text-primary
                data-[state=inactive]:hover:bg-purple-50
                shadow-none transition-all border-0
              "
            >
              探究学習 進捗状況
            </TabsTrigger>
            <TabsTrigger 
              value="non-cognitive" 
              className="
                rounded-none 
                px-6 py-3 font-bold text-sm
                data-[state=active]:bg-primary data-[state=active]:text-white
                data-[state=inactive]:bg-white data-[state=inactive]:text-primary
                data-[state=inactive]:hover:bg-purple-50
                shadow-none transition-all border-0
              "
            >
              非認知知能データ
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="progress" className="m-0">
          {/* テーブル外枠: タブとフラット接合させるため上辺の角丸・ボーダー・シャドウを除去 */}
          <div className="border-x border-b border-slate-200 rounded-b-md overflow-hidden bg-white relative z-0">
            
            <div className="overflow-x-auto">
              <Table>
                {/* カラム幅を固定して均等感を出す */}
                <TableHeader className="bg-primary hover:bg-primary">
                  <TableRow className="hover:bg-primary border-b-0">
                    <TableHead className="font-bold text-white h-12 w-[120px]">氏名</TableHead>
                    <TableHead className="text-center font-bold text-white h-12 w-[140px]">ゼミ</TableHead>
                    <TableHead className="text-center font-bold text-white h-12 w-[100px]">介入フラグ</TableHead>
                    <TableHead className="text-center font-bold text-white h-12 w-[120px]">フェーズ</TableHead>
                    <TableHead className="text-center font-bold text-white h-12 w-[120px]">課題変更回数</TableHead>
                    <TableHead className="text-center font-bold text-white h-12 w-[100px]">投稿数</TableHead>
                    <TableHead className="text-center font-bold text-white h-12 w-[120px]">最終投稿日</TableHead>
                    <TableHead className="text-center font-bold text-white h-12 w-[140px]">非認知知能力<br/>発揮状況</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {progressData.map((student, index) => (
                    <TableRow 
                      key={student.user_id} 
                      className={cn(
                        "cursor-pointer transition-colors border-slate-200 hover:bg-purple-50",
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                      )}
                    >
                      <TableCell className="font-bold text-slate-800 py-3 pl-4">
                        {student.name}
                      </TableCell>
                      <TableCell className="text-center text-xs font-bold text-slate-600 py-3">
                        {student.seminar}
                      </TableCell>
                      <TableCell className="text-center py-3">
                        {student.intervention_flag && (
                          <div className="flex justify-center">
                            <Flag className="w-5 h-5 text-primary fill-primary animate-pulse" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-center font-medium text-slate-700 py-3">{student.current_phase}</TableCell>
                      <TableCell className="text-center font-medium text-slate-700 py-3">{student.question_change_count}</TableCell>
                      <TableCell className="text-center font-bold text-slate-900 py-3 text-lg">{student.post_count}</TableCell>
                      <TableCell className="text-center font-medium text-slate-600 py-3">{student.last_posted_at}</TableCell>
                      <TableCell className="text-center py-3">
                        {getSignalDot(student.overall_signal)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="non-cognitive" className="m-0">
          <div className="border-x border-b border-slate-200 rounded-b-md overflow-hidden bg-white relative z-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-primary hover:bg-primary">
                  <TableRow className="hover:bg-primary border-b-0">
                    <TableHead className="font-bold text-white h-12 w-[120px]">氏名</TableHead>
                    <TableHead className="text-center font-bold text-white h-12 w-[100px]">総合</TableHead>
                    <TableHead className="text-center font-bold text-white h-12 w-[120px]">課題設定力</TableHead>
                    <TableHead className="text-center font-bold text-white h-12 w-[120px]">情報収集力</TableHead>
                    <TableHead className="text-center font-bold text-white h-12 w-[120px]">巻き込み力</TableHead>
                    <TableHead className="text-center font-bold text-white h-12 w-[120px]">対話する力</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nonCogData.map((student, index) => (
                    <TableRow 
                      key={student.user_id} 
                      className={cn(
                        "cursor-pointer transition-colors border-slate-200 hover:bg-purple-50",
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                      )}
                    >
                      <TableCell className="font-bold text-slate-800 py-3 pl-4">
                        {student.name}
                      </TableCell>
                      <TableCell className="text-center py-3">{getSignalDot(student.overall)}</TableCell>
                      <TableCell className="text-center py-3">{getSignalDot(student.p1_setting)}</TableCell>
                      <TableCell className="text-center py-3">{getSignalDot(student.p2_gathering)}</TableCell>
                      <TableCell className="text-center py-3">{getSignalDot(student.p3_involving)}</TableCell>
                      <TableCell className="text-center py-3">{getSignalDot(student.p4_communication)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}