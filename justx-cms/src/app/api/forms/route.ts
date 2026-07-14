import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { formDefSchema } from "@/lib/validation/forms";

export async function GET() {
  const auth = await requirePermission("forms:read");
  if (auth instanceof NextResponse) return auth;

  const forms = await prisma.formDef.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { submissions: true } } },
  });

  return NextResponse.json({ items: forms });
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission("forms:write");
  if (auth instanceof NextResponse) return auth;

  const body = await req.json().catch(() => null);
  const parsed = formDefSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existing = await prisma.formDef.findUnique({ where: { key: parsed.data.key } });
  if (existing) {
    return NextResponse.json({ error: "A form with that key already exists" }, { status: 409 });
  }

  const form = await prisma.formDef.create({
    data: {
      key: parsed.data.key,
      name: parsed.data.name,
      fields: parsed.data.fields,
      notifyEmail: parsed.data.notifyEmail || null,
    },
  });

  await prisma.auditLog.create({
    data: { userId: auth.sub, action: "FORM_CREATE", entity: "FormDef", entityId: form.id },
  });

  return NextResponse.json({ item: form }, { status: 201 });
}
