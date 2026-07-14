import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

interface Params {
  params: Promise<{ id: string; subId: string }>;
}

const patchSchema = z.object({
  status: z.enum(["NEW", "IN_PROGRESS", "RESOLVED", "SPAM"]).optional(),
  notes: z.string().max(3000).optional().nullable(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await requirePermission("forms:write");
  if (auth instanceof NextResponse) return auth;

  const { subId } = await params;
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const existing = await prisma.formSubmission.findUnique({ where: { id: subId } });
  if (!existing) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  const updated = await prisma.formSubmission.update({
    where: { id: subId },
    data: parsed.data,
  });

  return NextResponse.json({ item: updated });
}
