import { describe, expect, it } from "vitest";
import { sanitizeText } from "../src/utils/sanitize";

describe("sanitizeText", () => {
  it("strips HTML tags and trims", () => {
    expect(sanitizeText("  <b>Hello</b> world ")).toBe("Hello world");
  });

  it("cannot be bypassed with nested tags", () => {
    expect(sanitizeText("<scr<b>ipt>alert(1)</scr</b>ipt>")).not.toContain("<");
  });

  it("removes control characters", () => {
    expect(sanitizeText("a\u0000b\u0007c")).toBe("abc");
  });

  it("collapses whitespace on single-line text but keeps paragraphs on multiline", () => {
    expect(sanitizeText("a    b\n\nc")).toBe("a b c");
    expect(sanitizeText("a\n\n\n\nb", { multiline: true })).toBe("a\n\nb");
  });
});
