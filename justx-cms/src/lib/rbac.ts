import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import type { SessionPayload } from "@/lib/auth";

/**
 * Verifies the caller is authenticated and holds `permission`
 * (or the wildcard "*"). Returns the session on success, or a
 * ready-to-return NextResponse on failure — call sites do:
 *
 *   const auth = await requirePermission("pages:write");
 *   if (auth instanceof NextResponse) return auth;
 *   // auth is now a SessionPayload
 */
export async function requirePermission(
  permission: string
): Promise<SessionPayload | NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (!session.permissions.includes("*") && !session.permissions.includes(permission)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return session;
}
