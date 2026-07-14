import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
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

/**
 * Same permission check as `requirePermission`, but for Server Components
 * (page.tsx files) that query Prisma directly rather than going through an
 * API route. Redirects instead of returning a JSON response. Every admin
 * page that reads data directly should call this — the `/admin` layout only
 * confirms the visitor is *logged in*, not that they hold the specific
 * permission a given page's data requires.
 */
export async function requirePagePermission(permission: string): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!session.permissions.includes("*") && !session.permissions.includes(permission)) {
    redirect("/admin/dashboard");
  }
  return session;
}
