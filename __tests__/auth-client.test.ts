import { clearAccessToken, getAccessToken, setAccessToken } from "../app/lib/auth-client";

describe("auth-client", () => {
  test("set/get/clear access token", () => {
    setAccessToken("token123");
    expect(getAccessToken()).toBe("token123");
    clearAccessToken();
    expect(getAccessToken()).toBeNull();
  });
});
