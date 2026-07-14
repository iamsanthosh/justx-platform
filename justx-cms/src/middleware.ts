import { NextRequest, NextResponse } from "next/server";
import { verifySession, SESSION_COOKIE_NAME } from "@/lib/session-edge";

export const config = {
  matcher: ["/admin/:path*"],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Login page itself must stay reachable.
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
