import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

const clientSchema = z.object({
  name: z.string().min(1).max(120),
  logoUrl: z.string().min(1).max(500),
  website: z.string().url().optional().nullable(),
  enabled: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

export async function GET() {
  const auth = await requirePermission("content:read");
  if (auth instanceof NextResponse) return auth;

  const items = await prisma.client.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission("content:write");
  if (auth instanceof NextResponse) return auth;

  const body = await req.json().catch(() => null);
  const parsed = clientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const item = await prisma.client.create({ data: parsed.data });
  return NextResponse.json({ item }, { status: 201 });
}
