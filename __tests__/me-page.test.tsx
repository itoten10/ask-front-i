import { render, screen, waitFor } from "@testing-library/react";
import MePage from "../app/me/page";
import { fetchMe } from "../app/lib/session";
import { clearAccessToken } from "../app/lib/auth-client";

const replaceMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

jest.mock("../app/lib/auth-client", () => ({
  clearAccessToken: jest.fn(),
}));

jest.mock("../app/lib/session", () => ({
  fetchMe: jest.fn().mockResolvedValue({
    id: 1,
    full_name: "Teacher User",
    full_name_kana: "ティーチャー",
    email: "teacher@example.com",
    role: "teacher",
    school_person_id: "000001",
    grade: 1,
    class_name: "A",
    gender: "unknown",
    date_of_birth: null,
  }),
}));

describe("MePage", () => {
  test("renders user info from fetchMe", async () => {
    render(<MePage />);
    await waitFor(() =>
      expect(screen.getByText(/Teacher User/)).toBeInTheDocument()
    );
    expect(screen.getByText(/teacher@example.com/)).toBeInTheDocument();
  });

  test("redirects to login on error", async () => {
    (fetchMe as jest.Mock).mockRejectedValueOnce(new Error("fail"));
    render(<MePage />);
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/login"));
    expect(clearAccessToken).toHaveBeenCalled();
  });
});
