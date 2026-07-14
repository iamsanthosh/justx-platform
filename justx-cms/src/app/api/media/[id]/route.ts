import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { logger } from "@/lib/logger";

interface Params {
  params: Promise<{ id: string }>;
}

const patchSchema = z.object({
  altText: z.string().max(300).nullable().optional(),
  folder: z.string().max(60).optional(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await requirePermission("media:write");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const existing = await prisma.media.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Media not found" }, { status: 404 });
  }

  const updated = await prisma.media.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ item: updated });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const auth = await requirePermission("media:write");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const existing = await prisma.media.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Media not found" }, { status: 404 });
  }

  await prisma.media.delete({ where: { id } });

  // Best-effort file removal; DB record is already gone either way.
  try {
    const filePath = path.join(process.cwd(), "public", existing.url.replace(/^\//, ""));
    await unlink(filePath);
  } catch (err) {
    logger.warn("Media file cleanup failed", { id, error: String(err) });
  }

  await prisma.auditLog.create({
    data: { userId: auth.sub, action: "MEDIA_DELETE", entity: "Media", entityId: id },
  });

  return NextResponse.json({ ok: true });
}
