import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyPassword,
  signSession,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
} from "@/lib/auth";
import { loginSchema } from "@/lib/validation/auth";
import { rateLimit, clientIpFromHeaders } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const ip = clientIpFromHeaders(req.headers);
  const limit = rateLimit(`login:${ip}`, 5, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Try again shortly." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });

  if (!user || !user.isActive || !(await verifyPassword(password, user.passwordHash))) {
    logger.warn("Login failed", { email });
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const permissions = Array.isArray(user.role.permissions)
    ? (user.role.permissions as string[])
    : [];

  const token = await signSession({
    sub: user.id,
    email: user.email,
    role: user.role.name,
    permissions,
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "LOGIN_SUCCESS",
      ipAddress: ip,
    },
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions());
  return res;
}
