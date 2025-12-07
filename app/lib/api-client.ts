const NEXT_PUBLIC_API_ENDPOINT =
  process.env.NEXT_PUBLIC_API_ENDPOINT ?? "http://localhost:8000";

type FetchOptions = RequestInit & { skipAuthHeader?: boolean };

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
  accessToken?: string | null
): Promise<T> {
  const { skipAuthHeader, ...rest } = options;
  const isFormData = options.body instanceof FormData;
  
  // デバッグ: リクエスト情報をログ出力
  if (process.env.NODE_ENV === "development") {
    console.log("apiFetch - path:", path);
    console.log("apiFetch - method:", rest.method);
    console.log("apiFetch - body:", options.body);
    console.log("apiFetch - body type:", typeof options.body);
    if (options.body && typeof options.body === "string") {
      try {
        console.log("apiFetch - parsed body:", JSON.parse(options.body));
      } catch (e) {
        console.log("apiFetch - body is not valid JSON");
      }
    }
  }
  
  // ヘッダーを構築（Content-Typeは最後に設定して確実にapplication/jsonにする）
  const customHeaders = { ...(options.headers || {}) } as Record<string, string>;
  // Content-Typeが既に設定されている場合は削除（後で確実にapplication/jsonを設定するため）
  if (!isFormData && customHeaders["Content-Type"]) {
    console.log("⚠️ Removing existing Content-Type:", customHeaders["Content-Type"]);
    delete customHeaders["Content-Type"];
  }
  
  const headers: HeadersInit = {
    ...customHeaders,
    ...(accessToken && !skipAuthHeader
      ? { Authorization: `Bearer ${accessToken}` }
      : {}),
    // Content-Typeは最後に設定（options.headersで上書きされないように）
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
  };
  
  // デバッグ: ヘッダー情報をログ出力（詳細に）
  if (process.env.NODE_ENV === "development") {
    console.log("apiFetch - headers object:", headers);
    console.log("apiFetch - Content-Type:", (headers as Record<string, string>)["Content-Type"]);
    console.log("apiFetch - headers keys:", Object.keys(headers));
    // 各ヘッダーの値を確認
    Object.entries(headers).forEach(([key, value]) => {
      console.log(`apiFetch - header[${key}]:`, value);
    });
  }
  
  // fetchのオプションを構築（headersを確実に設定）
  const fetchOptions: RequestInit = {
    credentials: "include",
    method: rest.method || "GET",
    headers: headers,
    ...rest,
  };
  
  // Content-Typeを確実に設定（restで上書きされないように）
  if (!isFormData && fetchOptions.body) {
    (fetchOptions.headers as Record<string, string>)["Content-Type"] = "application/json";
  }
  
  // デバッグ: 最終的なfetchオプションを確認
  if (process.env.NODE_ENV === "development") {
    console.log("apiFetch - fetchOptions.headers:", fetchOptions.headers);
    console.log("apiFetch - fetchOptions.Content-Type:", (fetchOptions.headers as any)?.["Content-Type"]);
  }
  
  const resp = await fetch(`${NEXT_PUBLIC_API_ENDPOINT}${path}`, fetchOptions);
  if (!resp.ok) {
    const message = await safeErrorMessage(resp);
    throw new Error(message);
  }
  return resp.json() as Promise<T>;
}

export async function apiFetchBlob(
  path: string,
  options: FetchOptions = {},
  accessToken?: string | null
): Promise<Blob> {
  const { skipAuthHeader, ...rest } = options;
  const isFormData = options.body instanceof FormData;
  const resp = await fetch(`${NEXT_PUBLIC_API_ENDPOINT}${path}`, {
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
      ...(accessToken && !skipAuthHeader
        ? { Authorization: `Bearer ${accessToken}` }
        : {}),
    },
    ...rest,
  });
  if (!resp.ok) {
    const message = await safeErrorMessage(resp);
    throw new Error(message);
  }
  return resp.blob();
}

async function safeErrorMessage(resp: Response) {
  try {
    const data = await resp.json();
    if (typeof data.detail === "string") {
      return data.detail;
    }
    // Pydanticのバリデーションエラー（422）の場合
    if (Array.isArray(data.detail)) {
      const errors = data.detail.map((err: any) => {
        if (err.loc && err.msg) {
          return `${err.loc.join(".")}: ${err.msg}`;
        }
        return JSON.stringify(err);
      });
      return errors.join(", ");
    }
    // その他のエラー形式
    if (data.detail && typeof data.detail === "object") {
      return JSON.stringify(data.detail);
    }
  } catch {
    // ignore
  }
  return "リクエストに失敗しました";
}
