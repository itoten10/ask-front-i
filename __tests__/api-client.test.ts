import { apiFetch } from "../app/lib/api-client";

describe("api-client", () => {
  test("adds Authorization header when accessToken is provided", async () => {
    // @ts-expect-error define fetch for jsdom
    global.fetch = jest.fn();
    const mockResponse = {
      ok: true,
      json: async () => ({ value: 1 }),
    } as unknown as Response;

    const fetchSpy = (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const result = await apiFetch("/test", {}, "abc");

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("/test"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer abc",
        }),
      })
    );
    expect(result).toEqual({ value: 1 });
    fetchSpy.mockRestore();
  });

  test("throws error detail when response is not ok", async () => {
    // @ts-expect-error define fetch for jsdom
    global.fetch = jest.fn();
    const mockResponse = {
      ok: false,
      json: async () => ({ detail: "bad" }),
    } as unknown as Response;

    const fetchSpy = (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    await expect(apiFetch("/test", {}, null)).rejects.toThrow("bad");
    fetchSpy.mockRestore();
  });
});
