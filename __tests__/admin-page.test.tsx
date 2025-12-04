import { render, screen, waitFor } from "@testing-library/react";
import AdminHomePage from "../app/admin/page";

const replaceMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

jest.mock("../app/lib/session", () => ({
  fetchMe: jest.fn().mockResolvedValue({
    id: 1,
    full_name: "Admin User",
    full_name_kana: "アドミン",
    email: "admin@example.com",
    role: "admin",
    school_person_id: null,
    grade: null,
    class_name: null,
    gender: "unknown",
    date_of_birth: null,
  }),
}));

describe("AdminHomePage", () => {
  test("shows admin link when user is admin", async () => {
    render(<AdminHomePage />);
    await waitFor(() => {
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/admin/users");
    });
  });
});
