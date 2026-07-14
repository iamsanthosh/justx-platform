import { describe, it, expect, vi, afterEach } from "vitest";
import { rateLimit, clientIpFromHeaders } from "@/lib/rateLimit";

describe("rateLimit", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests up to the configured limit", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      expect(rateLimit(key, 3, 60_000).allowed).toBe(true);
    }
  });

  it("blocks the request once the limit is exceeded within the window", () => {
    const key = `test-${Math.random()}`;
    rateLimit(key, 2, 60_000);
    rateLimit(key, 2, 60_000);
    const third = rateLimit(key, 2, 60_000);
    expect(third.allowed).toBe(false);
    expect(third.remaining).toBe(0);
  });

  it("resets the count after the window expires", () => {
    vi.useFakeTimers();
    const key = `test-${Math.random()}`;

    expect(rateLimit(key, 1, 1000).allowed).toBe(true);
    expect(rateLimit(key, 1, 1000).allowed).toBe(false);

    vi.advanceTimersByTime(1001);

    expect(rateLimit(key, 1, 1000).allowed).toBe(true);
  });

  it("tracks separate keys independently", () => {
    const keyA = `a-${Math.random()}`;
    const keyB = `b-${Math.random()}`;
    rateLimit(keyA, 1, 60_000);
    expect(rateLimit(keyA, 1, 60_000).allowed).toBe(false);
    expect(rateLimit(keyB, 1, 60_000).allowed).toBe(true);
  });
});

describe("clientIpFromHeaders", () => {
  it("prefers the first entry in x-forwarded-for", () => {
    const headers = new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    expect(clientIpFromHeaders(headers)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", () => {
    const headers = new Headers({ "x-real-ip": "9.9.9.9" });
    expect(clientIpFromHeaders(headers)).toBe("9.9.9.9");
  });

  it("falls back to 'unknown' when no IP headers are present", () => {
    const headers = new Headers();
    expect(clientIpFromHeaders(headers)).toBe("unknown");
  });
});
