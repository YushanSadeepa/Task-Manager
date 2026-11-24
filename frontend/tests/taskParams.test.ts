import { describe, expect, it } from "vitest";
import { parseTaskParams } from "@/lib/taskParams";

const from = (o: Record<string, string>) => (k: string) => o[k] ?? null;

describe("parseTaskParams", () => {
  it("returns defaults for an empty query", () => {
    expect(parseTaskParams(from({}))).toMatchObject({ search: "", sortBy: "createdAt", order: "desc", page: 1, limit: 10 });
  });

  it("accepts valid values", () => {
    expect(parseTaskParams(from({ status: "COMPLETED", priority: "HIGH", sortBy: "dueDate", order: "asc", page: "3" }))).toMatchObject({
      status: "COMPLETED", priority: "HIGH", sortBy: "dueDate", order: "asc", page: 3,
    });
  });

  it("ignores tampered values instead of sending them to the API", () => {
    const p = parseTaskParams(from({ status: "HACK", sortBy: "title", page: "-4" }));
    expect(p.status).toBeUndefined();
    expect(p.sortBy).toBe("createdAt");
    expect(p.page).toBe(1);
  });
});
