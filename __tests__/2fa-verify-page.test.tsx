import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import TwoFAVerifyPage from "../app/2fa/verify/page";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

const apiFetchMock = jest.fn();

jest.mock("../app/lib/api-client", () => ({
  apiFetch: (...args: unknown[]) => apiFetchMock(...args),
}));

jest.mock("../app/lib/auth-client", () => ({
  setAccessToken: jest.fn(),
  clearAccessToken: jest.fn(),
}));

// sessionStorageのモック
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "sessionStorage", {
  value: sessionStorageMock,
});

describe("TwoFAVerifyPage", () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
    pushMock.mockReset();
    sessionStorageMock.clear();
    sessionStorageMock.setItem("temp_token", "test-temp-token");
  });

  test("redirects to login if no temp token", () => {
    sessionStorageMock.removeItem("temp_token");

    render(<TwoFAVerifyPage />);

    expect(pushMock).toHaveBeenCalledWith("/login");
  });

  test("displays verification form", () => {
    render(<TwoFAVerifyPage />);

    expect(screen.getByText("2要素認証")).toBeInTheDocument();
    expect(screen.getByLabelText("認証コード（6桁）")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "認証する" })).toBeInTheDocument();
  });

  test("validates code input length", () => {
    render(<TwoFAVerifyPage />);

    const codeInput = screen.getByLabelText("認証コード（6桁）") as HTMLInputElement;
    
    // 6桁未満の入力
    fireEvent.change(codeInput, { target: { value: "12345" } });
    expect(codeInput.value).toBe("12345");

    // 6桁の入力
    fireEvent.change(codeInput, { target: { value: "123456" } });
    expect(codeInput.value).toBe("123456");

    // 7桁以上の入力は6桁に制限される
    fireEvent.change(codeInput, { target: { value: "1234567" } });
    expect(codeInput.value).toBe("123456");

    // 数字以外の文字は入力できない
    fireEvent.change(codeInput, { target: { value: "abc123" } });
    expect(codeInput.value).toBe("123");
  });

  test("submits verification code", async () => {
    apiFetchMock.mockResolvedValueOnce({
      access_token: "test-access-token",
      token_type: "bearer",
      expires_in: 3600,
    });

    render(<TwoFAVerifyPage />);

    const codeInput = screen.getByLabelText("認証コード（6桁）");
    fireEvent.change(codeInput, { target: { value: "123456" } });

    const submitButton = screen.getByRole("button", { name: "認証する" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(apiFetchMock).toHaveBeenCalledWith(
        "/api/2fa/verify-existing",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer test-temp-token",
          }),
          body: JSON.stringify({ code: "123456" }),
        }),
        null
      );
      expect(pushMock).toHaveBeenCalledWith("/me");
    });
  });

  test("shows error message when verification fails", async () => {
    apiFetchMock.mockRejectedValueOnce(new Error("Invalid code"));

    render(<TwoFAVerifyPage />);

    const codeInput = screen.getByLabelText("認証コード（6桁）");
    fireEvent.change(codeInput, { target: { value: "123456" } });

    const submitButton = screen.getByRole("button", { name: "認証する" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("コードが正しくありません。もう一度お試しください。")
      ).toBeInTheDocument();
    });
  });

  test("shows validation error for invalid code length", async () => {
    render(<TwoFAVerifyPage />);

    const codeInput = screen.getByLabelText("認証コード（6桁）");
    fireEvent.change(codeInput, { target: { value: "12345" } });

    const form = screen.getByRole("button", { name: "認証する" }).closest("form");
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(
        screen.getByText("6桁のコードを入力してください。")
      ).toBeInTheDocument();
    });
  });

  test("disables submit button when code is not 6 digits", () => {
    render(<TwoFAVerifyPage />);

    const codeInput = screen.getByLabelText("認証コード（6桁）");
    const submitButton = screen.getByRole("button", { name: "認証する" }) as HTMLButtonElement;

    // 5桁の場合は無効
    fireEvent.change(codeInput, { target: { value: "12345" } });
    expect(submitButton.disabled).toBe(true);

    // 6桁の場合は有効
    fireEvent.change(codeInput, { target: { value: "123456" } });
    expect(submitButton.disabled).toBe(false);
  });
});


