// クライアント側のアクセストークン管理
let inMemoryAccessToken: string | null = null;

export const getAccessToken = () => {
  // メモリにあればそれを返す
  if (inMemoryAccessToken) {
    return inMemoryAccessToken;
  }
  // メモリにない場合はlocalStorageから取得
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("access_token");
    if (stored) {
      inMemoryAccessToken = stored;
      return stored;
    }
  }
  return null;
};

export const setAccessToken = (token: string) => {
  inMemoryAccessToken = token;
  // localStorageにも保存
  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", token);
  }
};

export const clearAccessToken = () => {
  inMemoryAccessToken = null;
  // localStorageからも削除
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
  }
};
