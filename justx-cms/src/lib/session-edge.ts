import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = process.env.COOKIE_NAME || "justx_session";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "JWT_SECRET is missing or too short. Set a strong random value in your environment."
    );
  }
  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  sub: string; // user id
  email: string;
  role: string; // role name, e.g. SUPER_ADMIN
  permissions: string[];
}

/** Sign a JWT for a given user session. Edge + Node runtime safe (jose only). */
export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(getSecretKey());
}

/** Verify and decode a session JWT. Returns null if invalid/expired. Edge-safe. */
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;

/** Standard cookie options for the session cookie. */
export function sessionCookieOptions(maxAgeSeconds = 60 * 60 * 24 * 7) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

/** Checks whether a role's permission list grants a given permission. */
export function hasPermission(permissions: string[], required: string): boolean {
  return permissions.includes("*") || permissions.includes(required);
}
