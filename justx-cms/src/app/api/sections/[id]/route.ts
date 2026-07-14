import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { validateSectionContent, type SectionTypeKey } from "@/lib/validation/sections";
import { z } from "zod";

const updateSchema = z.object({
  content: z.record(z.any()).optional(),
  order: z.number().int().min(0).optional(),
  enabled: z.boolean().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
});

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await requirePermission("sections:write");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const existing = await prisma.section.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { content, order, enabled, status } = parsed.data;

  if (content) {
    const check = validateSectionContent(existing.type as SectionTypeKey, content);
    if (!check.success) {
      return NextResponse.json(
        { error: "Invalid content", issues: check.error.flatten() },
        { status: 400 }
      );
    }
  }

  const updated = await prisma.section.update({
    where: { id },
    data: {
      ...(content ? { content } : {}),
      ...(order !== undefined ? { order } : {}),
      ...(enabled !== undefined ? { enabled } : {}),
      ...(status !== undefined ? { status } : {}),
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: auth.sub,
      action: "SECTION_UPDATE",
      entity: "Section",
      entityId: id,
    },
  });

  return NextResponse.json({ item: updated });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const auth = await requirePermission("sections:write");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const existing = await prisma.section.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  await prisma.section.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      userId: auth.sub,
      action: "SECTION_DELETE",
      entity: "Section",
      entityId: id,
    },
  });

  return NextResponse.json({ ok: true });
}
