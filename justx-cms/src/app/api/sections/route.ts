import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { sectionUpsertSchema, validateSectionContent } from "@/lib/validation/sections";
import { z } from "zod";

const createSectionSchema = sectionUpsertSchema
  .pick({ pageId: true, type: true, content: true })
  .extend({ order: z.number().int().optional() });

export async function GET(req: NextRequest) {
  const auth = await requirePermission("sections:read");
  if (auth instanceof NextResponse) return auth;

  const pageId = req.nextUrl.searchParams.get("pageId");
  if (!pageId) {
    return NextResponse.json({ error: "pageId query param is required" }, { status: 400 });
  }

  const sections = await prisma.section.findMany({
    where: { pageId },
    orderBy: { order: "asc" },
  });
  return NextResponse.json({ items: sections });
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission("sections:write");
  if (auth instanceof NextResponse) return auth;

  const body = await req.json().catch(() => null);
  const parsed = createSectionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { pageId, type, content, order } = parsed.data;

  // Validate the section content against its type-specific schema —
  // this is what makes "no code changes required" safe: bad content
  // never reaches the database.
  const contentCheck = validateSectionContent(type, content);
  if (!contentCheck.success) {
    return NextResponse.json(
      { error: `Invalid content for section type ${type}`, issues: contentCheck.error.flatten() },
      { status: 400 }
    );
  }

  const maxOrder = await prisma.section.aggregate({
    where: { pageId },
    _max: { order: true },
  });

  const section = await prisma.section.create({
    data: {
      pageId,
      type,
      content: contentCheck.data,
      order: order ?? (maxOrder._max.order ?? -1) + 1,
      enabled: true,
      status: "DRAFT",
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: auth.sub,
      action: "SECTION_CREATE",
      entity: "Section",
      entityId: section.id,
    },
  });

  return NextResponse.json({ item: section }, { status: 201 });
}
