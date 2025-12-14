"use client";

import { apiFetch } from "./api-client";
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "./auth-client";

type RefreshResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

export type MeUser = {
  id: number;
  full_name: string;
  full_name_kana: string | null;
  email: string;
  role: "student" | "teacher" | "admin";
  school_person_id: string | null;
  grade: number | null;
  class_name: string | null;
  gender: string;
  date_of_birth: string | null;
};

export async function ensureAccessToken(): Promise<string | null> {
  // まずメモリからトークンを取得
  const token = getAccessToken();
  if (token) {
    return token;
  }

  // 1. まずrefresh tokenでリフレッシュを試みる（httpOnlyクッキーにある場合）
  try {
    const refreshed = await apiFetch<RefreshResponse>(
      "/auth/refresh",
      { method: "POST" },
      null
    );
    setAccessToken(refreshed.access_token);
    // localStorageも更新
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", refreshed.access_token);
    }
    return refreshed.access_token;
  } catch (err) {
    console.error("Refresh failed:", err);
  }

  // 2. refresh tokenがない場合、localStorageのaccess_tokenを使ってexchange-tokenを試みる
  if (typeof window !== "undefined") {
    const storedToken = localStorage.getItem("access_token");
    if (storedToken) {
      console.log("Attempting to exchange access_token for refresh_token cookie");
      try {
        const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8000";
        const exchangeResponse = await fetch(`${API_ENDPOINT}/api/auth/exchange-token`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${storedToken}`,
          },
          credentials: "include",
        });

        if (exchangeResponse.ok) {
          const exchangeData = await exchangeResponse.json();
          console.log("Successfully exchanged token and set refresh_token cookie");
          // 新しいaccess_tokenを保存
          setAccessToken(exchangeData.access_token);
          localStorage.setItem("access_token", exchangeData.access_token);
          return exchangeData.access_token;
        } else {
          console.error("Failed to exchange token:", await exchangeResponse.text());
          // exchange失敗時は古いトークンを削除
          localStorage.removeItem("access_token");
        }
      } catch (exchangeErr) {
        console.error("Token exchange error:", exchangeErr);
      }
    }
  }

  clearAccessToken();
  return null;
}

export async function fetchMe(): Promise<MeUser> {
  const token = await ensureAccessToken();
  if (!token) {
    throw new Error("no token");
  }
  return apiFetch<MeUser>("/users/me", {}, token);
}
