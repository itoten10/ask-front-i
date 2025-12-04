import { ensureAccessToken, fetchMe } from "../app/lib/session";
import { apiFetch } from "../app/lib/api-client";
import * as authClient from "../app/lib/auth-client";

jest.mock("../app/lib/api-client");
jest.mock("../app/lib/auth-client");

describe("session helpers", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test("returns existing access token without refresh", async () => {
    jest.spyOn(authClient, "getAccessToken").mockReturnValue("existing");
    const token = await ensureAccessToken();
    expect(token).toBe("existing");
    expect(apiFetch).not.toHaveBeenCalled();
  });

  test("refreshes token when missing and succeeds", async () => {
    jest.spyOn(authClient, "getAccessToken").mockReturnValue(null);
    (apiFetch as jest.Mock).mockResolvedValue({
      access_token: "refreshed",
      token_type: "bearer",
      expires_in: 60,
    });
    const setSpy = jest.spyOn(authClient, "setAccessToken").mockImplementation();

    const token = await ensureAccessToken();
    expect(token).toBe("refreshed");
    expect(setSpy).toHaveBeenCalledWith("refreshed");
  });

  test("refresh failure clears access token", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(authClient, "getAccessToken").mockReturnValue(null);
    (apiFetch as jest.Mock).mockRejectedValue(new Error("fail"));
    const clearSpy = jest.spyOn(authClient, "clearAccessToken").mockImplementation();

    const token = await ensureAccessToken();
    expect(token).toBeNull();
    expect(clearSpy).toHaveBeenCalled();
  });

  test("fetchMe calls api with refreshed token", async () => {
    jest.spyOn(authClient, "getAccessToken").mockReturnValue("abc");
    (apiFetch as jest.Mock).mockResolvedValue({
      id: 1,
      full_name: "T",
      full_name_kana: null,
      email: "t@example.com",
      role: "teacher",
      school_person_id: null,
      grade: null,
      class_name: null,
      gender: "unknown",
      date_of_birth: null,
    });

    const me = await fetchMe();
    expect(me.email).toBe("t@example.com");
    expect(apiFetch).toHaveBeenCalledWith("/users/me", {}, "abc");
  });
});
