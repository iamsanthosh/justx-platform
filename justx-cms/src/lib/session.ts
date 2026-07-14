import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE_NAME, type SessionPayload } from "@/lib/session-edge";

/** Reads and verifies the current session from the request cookies. Server-only. */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}
