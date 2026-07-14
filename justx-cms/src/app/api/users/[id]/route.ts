import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

interface Params {
  params: Promise<{ id: string }>;
}

const patchSchema = z.object({
  isActive: z.boolean().optional(),
  roleId: z.string().min(1).optional(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await requirePermission("users:write");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  if (id === auth.sub) {
    return NextResponse.json(
      { error: "You can't change your own role or active status." },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const updated = await prisma.user.update({ where: { id }, data: parsed.data });

  await prisma.auditLog.create({
    data: { userId: auth.sub, action: "USER_UPDATE", entity: "User", entityId: id },
  });

  return NextResponse.json({ item: { id: updated.id, isActive: updated.isActive } });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const auth = await requirePermission("users:write");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  if (id === auth.sub) {
    return NextResponse.json({ error: "You can't delete your own account." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await prisma.user.delete({ where: { id } });

  await prisma.auditLog.create({
    data: { userId: auth.sub, action: "USER_DELETE", entity: "User", entityId: id },
  });

  return NextResponse.json({ ok: true });
}
