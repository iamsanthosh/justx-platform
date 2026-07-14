import { describe, it, expect, beforeAll } from "vitest";
import { signSession, verifySession, hasPermission } from "@/lib/session-edge";

beforeAll(() => {
  // signSession/verifySession require a real secret at call time.
  process.env.JWT_SECRET = "test-secret-please-do-not-use-in-prod-xxxx";
  process.env.JWT_EXPIRES_IN = "1h";
});

describe("signSession / verifySession", () => {
  const payload = {
    sub: "user_123",
    email: "admin@justxsystems.com",
    role: "SUPER_ADMIN",
    permissions: ["*"],
  };

  it("round-trips a signed session token", async () => {
    const token = await signSession(payload);
    const decoded = await verifySession(token);
    expect(decoded?.sub).toBe(payload.sub);
    expect(decoded?.email).toBe(payload.email);
    expect(decoded?.role).toBe(payload.role);
    expect(decoded?.permissions).toEqual(payload.permissions);
  });

  it("returns null for a malformed token", async () => {
    const decoded = await verifySession("not.a.valid.jwt");
    expect(decoded).toBeNull();
  });

  it("returns null for a token signed with a different secret", async () => {
    const token = await signSession(payload);
    process.env.JWT_SECRET = "a-completely-different-secret-value";
    const decoded = await verifySession(token);
    expect(decoded).toBeNull();
    // restore for subsequent tests
    process.env.JWT_SECRET = "test-secret-please-do-not-use-in-prod-xxxx";
  });
});

describe("hasPermission", () => {
  it("grants access when the wildcard permission is present", () => {
    expect(hasPermission(["*"], "anything:at-all")).toBe(true);
  });

  it("grants access when the exact permission is present", () => {
    expect(hasPermission(["pages:read", "pages:write"], "pages:write")).toBe(true);
  });

  it("denies access when the permission is absent", () => {
    expect(hasPermission(["pages:read"], "pages:write")).toBe(false);
  });
});
