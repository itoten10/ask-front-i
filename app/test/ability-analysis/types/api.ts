// ask-front-i/types/api.ts

/**
 * バックエンドAPI (FastAPI) のレスポンスおよびDBスキーマに準拠した型定義
 * 
 * 現在フロントエンドで使用しているダミーデータの型とは異なる部分がありますが、
 * バックエンド接続時にこの型に合わせてデータ変換を行うか、
 * コンポーネント側をこの型に合わせて修正して使用します。
 */

// 問いの変化タイプ (DB: ENUM)
export type QuestionStateChangeType = 'none' | 'deepened' | 'changed';

// 信号色 (DB: ENUM)
export type SignalColor = 'red' | 'yellow' | 'green';

// 非認知能力コード
export type AbilityCode = 
  | 'problem_setting'       // 課題設定
  | 'information_gathering' // 情報収集
  | 'involvement'           // 巻き込む力
  | 'communication'         // 対話する力
  | 'execution'             // 実行する力
  | 'humility'              // 謙虚である力
  | 'completion';           // 完遂する力

// ユーザー情報 (Users table)
export interface User {
  id: number;
  school_person_id: string;
  role: 'student' | 'teacher' | 'admin';
  full_name: string;
  full_name_kana?: string;
  grade?: number;
  class_name?: string; 
  avatar_url?: string; // DBにはないがAPIで結合して返す想定
}

// 投稿 (Posts table)
export interface Post {
  id: number;
  user_id: number;
  user_name: string;      // APIレスポンスに含まれる想定
  lab_name?: string;      // 所属ゼミ（User情報から結合）
  
  problem: string;        // フロントエンドの "theme" に相当
  content_1: string;      // やってみたこと①（必須）
  content_2?: string;     // やってみたこと②（任意）
  content_3?: string;     // やってみたこと③（任意）
  
  question_state_change_type: QuestionStateChangeType;
  phase_label: string;    // "情報収集", "実験・調査" など
  
  // フロントエンドの状態管理用 & APIレスポンス拡張フィールド
  like_count: number;
  liked_by_me: boolean;
  is_viewed_by_teacher: boolean;
  is_new?: boolean;
  is_my_post?: boolean;
  is_anonymous?: boolean; 
  
  // 表示用拡張
  avatar_url?: string;
  
  created_at: string;
  updated_at: string;
}

// 感謝の手紙 (Thanks Letters table)
export interface ThanksLetter {
  id: number;
  sender_user_id: number;
  sender_name: string;
  receiver_user_id: number;
  receiver_name: string;
  
  content_1: string; // 感謝のメインメッセージ
  content_2?: string; // 具体的な行動・貢献
  
  created_at: string;
}

// ==========================================
// APIリクエスト用ペイロード型（送信時の形）
// ==========================================

export interface CreatePostRequest {
  problem: string;
  content_1: string;
  content_2?: string;
  content_3?: string;
  question_state_change_type: QuestionStateChangeType | string;
  phase_label: string;
  is_anonymous?: boolean;
  // ability_codes?: AbilityCode[]; // 必要に応じて
}

export interface CreateThanksLetterRequest {
  receiver_user_id: number;
  content_1: string;
  content_2: string;
  ability_codes: string[]; // フロントエンドで選択された能力
}