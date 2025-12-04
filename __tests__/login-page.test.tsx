import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import LoginPage from "../app/login/page";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

const apiFetchMock = jest.fn().mockResolvedValue({
  token: { access_token: "abc", token_type: "bearer", expires_in: 60 },
});

jest.mock("../app/lib/api-client", () => ({
  apiFetch: (...args: unknown[]) => apiFetchMock(...args),
}));

jest.mock("../app/lib/auth-client", () => ({
  setAccessToken: jest.fn(),
  clearAccessToken: jest.fn(),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
    apiFetchMock.mockResolvedValue({
      token: { access_token: "abc", token_type: "bearer", expires_in: 60 },
    });
    pushMock.mockReset();
  });

  test("shows validation error when form is submitted empty", async () => {
    render(<LoginPage />);

    const form = screen.getByTestId("local-login-form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(
        screen.getByText(/ID.*パスワードを入力してください/)
      ).toBeInTheDocument();
    });
  });

  test("submits local login and sets access token", async () => {
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText("ログインID"), {
      target: { value: "teacher01" },
    });
    fireEvent.change(screen.getByLabelText("パスワード"), {
      target: { value: "pass123" },
    });

    fireEvent.submit(screen.getByTestId("local-login-form"));

    await waitFor(() => {
      expect(apiFetchMock).toHaveBeenCalledWith(
        "/auth/login/local",
        expect.any(Object)
      );
      expect(pushMock).toHaveBeenCalledWith("/me");
    });
  });

  test("shows google login error message", async () => {
    apiFetchMock.mockRejectedValueOnce(new Error("fail"));
    render(<LoginPage />);

    fireEvent.click(
      screen.getByRole("button", { name: "Googleでログイン" })
    );

    await waitFor(() =>
      expect(
        screen.getByText("Googleログインの開始に失敗しました。")
      ).toBeInTheDocument()
    );
  });
});
