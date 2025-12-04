import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import TwoFASetupPage from "../app/2fa/setup/page";

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

describe("TwoFASetupPage", () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
    pushMock.mockReset();
    sessionStorageMock.clear();
    sessionStorageMock.setItem("temp_token", "test-temp-token");
  });

  test("displays loading state initially", () => {
    apiFetchMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ secret: "TEST123", otpauth_url: "otpauth://test" }), 100);
        })
    );

    render(<TwoFASetupPage />);
    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  test("displays QR code and secret after setup", async () => {
    apiFetchMock.mockResolvedValueOnce({
      secret: "JBSWY3DPEHPK3PXP",
      otpauth_url: "otpauth://totp/School%20Auth:test@example.com?secret=JBSWY3DPEHPK3PXP&issuer=School%20Auth",
    });

    render(<TwoFASetupPage />);

    await waitFor(() => {
      expect(screen.getByText("2要素認証の設定")).toBeInTheDocument();
    });

    // QRコードが表示されること（qrcode.reactがレンダリングする）
    // シークレットキーが表示されること
    expect(screen.getByText("JBSWY3DPEHPK3PXP")).toBeInTheDocument();
  });

  test("redirects to login if no temp token", async () => {
    sessionStorageMock.removeItem("temp_token");

    render(<TwoFASetupPage />);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/login");
    });
  });

  test("shows error message when setup fails", async () => {
    apiFetchMock.mockRejectedValueOnce(new Error("Setup failed"));

    render(<TwoFASetupPage />);

    await waitFor(() => {
      expect(screen.getByText("2FA設定情報の取得に失敗しました。")).toBeInTheDocument();
    });
  });

  test("validates code input length", async () => {
    apiFetchMock.mockResolvedValueOnce({
      secret: "JBSWY3DPEHPK3PXP",
      otpauth_url: "otpauth://test",
    });

    render(<TwoFASetupPage />);

    await waitFor(() => {
      expect(screen.getByLabelText("認証コード（6桁）")).toBeInTheDocument();
    });

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
    apiFetchMock
      .mockResolvedValueOnce({
        secret: "JBSWY3DPEHPK3PXP",
        otpauth_url: "otpauth://test",
      })
      .mockResolvedValueOnce({
        access_token: "test-access-token",
        token_type: "bearer",
        expires_in: 3600,
      });

    render(<TwoFASetupPage />);

    await waitFor(() => {
      expect(screen.getByLabelText("認証コード（6桁）")).toBeInTheDocument();
    });

    const codeInput = screen.getByLabelText("認証コード（6桁）");
    fireEvent.change(codeInput, { target: { value: "123456" } });

    const submitButton = screen.getByRole("button", { name: "設定を完了する" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(apiFetchMock).toHaveBeenCalledWith(
        "/api/2fa/verify",
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
    apiFetchMock
      .mockResolvedValueOnce({
        secret: "JBSWY3DPEHPK3PXP",
        otpauth_url: "otpauth://test",
      })
      .mockRejectedValueOnce(new Error("Invalid code"));

    render(<TwoFASetupPage />);

    await waitFor(() => {
      expect(screen.getByLabelText("認証コード（6桁）")).toBeInTheDocument();
    });

    const codeInput = screen.getByLabelText("認証コード（6桁）");
    fireEvent.change(codeInput, { target: { value: "123456" } });

    const submitButton = screen.getByRole("button", { name: "設定を完了する" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("コードが正しくありません。もう一度お試しください。")
      ).toBeInTheDocument();
    });
  });
});


