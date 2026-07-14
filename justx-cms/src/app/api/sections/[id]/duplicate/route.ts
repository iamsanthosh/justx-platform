import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(_req: NextRequest, { params }: Params) {
  const auth = await requirePermission("sections:write");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const original = await prisma.section.findUnique({ where: { id } });
  if (!original) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  const maxOrder = await prisma.section.aggregate({
    where: { pageId: original.pageId },
    _max: { order: true },
  });

  const copy = await prisma.section.create({
    data: {
      pageId: original.pageId,
      type: original.type,
      content: original.content as unknown as Record<string, unknown>,
      order: (maxOrder._max.order ?? -1) + 1,
      enabled: false, // duplicates start disabled so editors can review before publishing
      status: "DRAFT",
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: auth.sub,
      action: "SECTION_DUPLICATE",
      entity: "Section",
      entityId: copy.id,
    },
  });

  return NextResponse.json({ item: copy }, { status: 201 });
}
