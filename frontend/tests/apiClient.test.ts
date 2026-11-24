import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, request } from "@/lib/apiClient";

const mockFetch = (impl: () => unknown) => vi.stubGlobal("fetch", vi.fn(impl));
afterEach(() => vi.unstubAllGlobals());

const json = (status: number, body: unknown) => ({ status, ok: status < 400, json: async () => body });

describe("apiClient.request", () => {
  it("unwraps data and meta from the success envelope", async () => {
    mockFetch(() => json(200, { success: true, data: [1], meta: { page: 1, limit: 10, total: 1, totalPages: 1 } }));
    const r = await request<number[]>("/tasks");
    expect(r.data).toEqual([1]);
    expect(r.meta?.total).toBe(1);
  });

  it("throws ApiError carrying field details from the server", async () => {
    mockFetch(() =>
      json(400, { success: false, error: { message: "Validation failed", details: [{ field: "title", message: "Too short" }] } }),
    );
    await expect(request("/tasks")).rejects.toMatchObject({
      name: "ApiError",
      status: 400,
      details: [{ field: "title", message: "Too short" }],
    });
  });

  it("converts network failures into a friendly ApiError", async () => {
    mockFetch(() => {
      throw new TypeError("fetch failed");
    });
    const err = await request("/tasks").catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(0);
  });

  it("handles 204 and non-JSON responses", async () => {
    mockFetch(() => ({ status: 204, ok: true }));
    await expect(request("/tasks/1", { method: "DELETE" })).resolves.toEqual({ data: undefined });

    mockFetch(() => ({ status: 502, ok: false, json: async () => { throw new Error("html"); } }));
    await expect(request("/tasks")).rejects.toMatchObject({ status: 502 });
  });
});
