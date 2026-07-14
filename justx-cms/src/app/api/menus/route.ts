import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

const itemSchema = z.object({
  menuKey: z.string().min(1),
  label: z.string().min(1).max(100),
  href: z.string().min(1).max(300),
  order: z.number().int().min(0).optional(),
  parentId: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const auth = await requirePermission("menus:read");
  if (auth instanceof NextResponse) return auth;

  const key = req.nextUrl.searchParams.get("key") || "primary-nav";
  const menu = await prisma.menu.upsert({
    where: { key },
    update: {},
    create: { key, label: key },
    include: { items: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json({ menu });
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission("menus:write");
  if (auth instanceof NextResponse) return auth;

  const body = await req.json().catch(() => null);
  const parsed = itemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { menuKey, label, href, order, parentId } = parsed.data;

  const menu = await prisma.menu.upsert({
    where: { key: menuKey },
    update: {},
    create: { key: menuKey, label: menuKey },
  });

  const maxOrder = await prisma.menuItem.aggregate({
    where: { menuId: menu.id },
    _max: { order: true },
  });

  const item = await prisma.menuItem.create({
    data: {
      menuId: menu.id,
      label,
      href,
      order: order ?? (maxOrder._max.order ?? -1) + 1,
      parentId: parentId || null,
    },
  });

  return NextResponse.json({ item }, { status: 201 });
}
