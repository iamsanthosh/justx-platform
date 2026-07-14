import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { hashPassword } from "@/lib/auth";

const createUserSchema = z.object({
  name: z.string().min(1).max(150),
  email: z.string().email(),
  password: z.string().min(10, "Password must be at least 10 characters"),
  roleId: z.string().min(1),
});

interface UserWithRole {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  role: { id: string; name: string };
}

interface RoleRow {
  id: string;
  name: string;
}

export async function GET() {
  // User management is SUPER_ADMIN only (wildcard "*"), not exposed to EDITOR.
  const auth = await requirePermission("users:read");
  if (auth instanceof NextResponse) return auth;

  const users: UserWithRole[] = await prisma.user.findMany({
    include: { role: true },
    orderBy: { createdAt: "asc" },
  });

  const roles: RoleRow[] = await prisma.role.findMany({ orderBy: { name: "asc" } });

  return NextResponse.json({
    items: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      isActive: u.isActive,
      lastLoginAt: u.lastLoginAt,
      role: { id: u.role.id, name: u.role.name },
    })),
    roles: roles.map((r) => ({ id: r.id, name: r.name })),
  });
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission("users:write");
  if (auth instanceof NextResponse) return auth;

  const body = await req.json().catch(() => null);
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, email, password, roleId } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "A user with that email already exists" }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: { name, email, roleId, passwordHash: await hashPassword(password) },
  });

  await prisma.auditLog.create({
    data: { userId: auth.sub, action: "USER_CREATE", entity: "User", entityId: user.id },
  });

  return NextResponse.json({ item: { id: user.id, name: user.name, email: user.email } }, {
    status: 201,
  });
}
