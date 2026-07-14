import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

const testimonialSchema = z.object({
  author: z.string().min(1).max(120),
  role: z.string().max(120).optional().nullable(),
  company: z.string().max(120).optional().nullable(),
  quote: z.string().min(1).max(2000),
  avatarUrl: z.string().url().optional().nullable(),
  enabled: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

export async function GET() {
  const auth = await requirePermission("content:read");
  if (auth instanceof NextResponse) return auth;

  const items = await prisma.testimonial.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission("content:write");
  if (auth instanceof NextResponse) return auth;

  const body = await req.json().catch(() => null);
  const parsed = testimonialSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const item = await prisma.testimonial.create({ data: parsed.data });
  return NextResponse.json({ item }, { status: 201 });
}
