//ask-front-i/components/teacher/EvaluationCriteriaModal.tsx

"use client";

import { X, Info, Flag, Calculator, BookOpen, Star, MessageCircle, Mail, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface EvaluationCriteriaModalProps {
  open: boolean;
  onClose: () => void;
}

export function EvaluationCriteriaModal({ open, onClose }: EvaluationCriteriaModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open || !mounted) return null;

  const rubrics = [
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
  ];

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-200 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-200 overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Info className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">評価基準とポイント集計ロジック</h2>
              <p className="text-xs text-slate-500">AIによる判定ロジックとルーブリックの詳細</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5 text-slate-500" />
          </Button>
        </div>

        {/* スクロール可能なコンテンツエリア */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/30">
          
          {/* 1. 介入フラグ */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Flag className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg text-slate-800">1. 介入フラグ判定条件</h3>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
              <p className="text-sm text-slate-600 mb-3 font-medium">以下のいずれかに該当する場合、要介入（フラグ）として表示されます。</p>
              <div className="bg-primary/5 rounded-md p-4">
                <ul className="list-disc list-inside space-y-2 text-sm text-slate-700">
                  <li>最終投稿から <strong>2週間(14日)以上</strong> 経過している</li>
                  <li>問いの変更回数が <strong>0回</strong> のまま推移している</li>
                  <li>累計アクション(投稿)数が <strong>一定未満</strong> である</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 2. ポイント集計 */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg text-slate-800">2. ポイント集計方法</h3>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                AIが生徒の「投稿内容（行動ログ）」と「感謝の手紙」を解析し、
                以下の3つの要素を組み合わせてスコアを算出します。
              </p>
              
              <div className="flex flex-col md:flex-row items-stretch gap-2 mb-4">
                
                {/* ① 量の評価 */}
                <div className="flex-1 bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col justify-between group hover:border-primary/30 transition-colors relative z-10">
                  <div className="flex items-center gap-2 mb-2 text-slate-600">
                    <MessageCircle className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold">行動の量（Quantity）</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">AIが検知した能力発揮アクション数</p>
                  <div className="text-right mt-auto">
                    <span className="text-xl font-black text-primary">1 pt</span>
                    <span className="text-xs text-slate-400 ml-1">/ 回</span>
                  </div>
                </div>

                {/* × アイコン */}
                <div className="flex items-center justify-center py-2 md:py-0 md:px-1">
                  <X className="w-5 h-5 text-slate-300" />
                </div>

                {/* ② 質の評価 */}
                <div className="flex-1 bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col justify-between group hover:border-primary/30 transition-colors relative z-10">
                  <div className="flex items-center gap-2 mb-2 text-slate-600">
                    <Star className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold">行動の質（Quality）</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">ルーブリック(Lv1~5)に基づく係数</p>
                  <div className="text-right mt-auto">
                    <span className="text-xs text-slate-400 mr-1">×</span>
                    <span className="text-xl font-black text-primary">Coefficient</span>
                  </div>
                </div>

                {/* ＋ アイコン */}
                <div className="flex items-center justify-center py-2 md:py-0 md:px-1">
                  <Plus className="w-6 h-6 text-slate-300" />
                </div>

                {/* ③ 手紙の評価 */}
                <div className="flex-1 bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col justify-between group hover:border-primary/30 transition-colors relative z-10">
                  <div className="flex items-center gap-2 mb-2 text-slate-600">
                    <Mail className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold">感謝の手紙（Letter）</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">他者への貢献度評価</p>
                  <div className="text-right mt-auto">
                    <span className="text-xl font-black text-primary">1.5 pt</span>
                    <span className="text-xs text-slate-400 ml-1">/ 通</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-100 rounded text-xs text-slate-500">
                ※ 総合スコアはこれらの合算値から算出され、クラス内分布などに応じて信号色（赤・黄・緑）が判定されます。
              </div>
            </div>
          </section>

          {/* 3. ルーブリック */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg text-slate-800">3. 非認知能力ルーブリック（7能力・5段階）</h3>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {rubrics.map((item, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                  <div className="bg-slate-50 px-5 py-3 border-b border-slate-100">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2 text-base">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                  </div>
                  <div className="p-5">
                    <div className="space-y-3">
                      {item.levels.map((lvl, idx) => (
                        <div key={idx} className="flex items-start gap-4 text-sm">
                          <span className={cn(
                            "font-bold shrink-0 w-12 text-center rounded px-1 py-0.5 text-xs border bg-white",
                            "border-slate-200 text-slate-500"
                          )}>
                            Lv.{idx + 1}
                          </span>
                          <span className="text-slate-600 leading-snug pt-0.5">{lvl}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* フッター */}
        <div className="p-4 border-t border-slate-100 bg-white shrink-0 flex justify-end">
          <Button onClick={onClose} className="px-8 bg-slate-800 text-white hover:bg-slate-700">
            閉じる
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}