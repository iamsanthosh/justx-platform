import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { formDefUpdateSchema } from "@/lib/validation/forms";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await requirePermission("forms:write");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const existing = await prisma.formDef.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = formDefUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { key, name, fields, notifyEmail } = parsed.data;

  if (key && key !== existing.key) {
    const clash = await prisma.formDef.findUnique({ where: { key } });
    if (clash) {
      return NextResponse.json({ error: "That key is already in use" }, { status: 409 });
    }
  }

  const updated = await prisma.formDef.update({
    where: { id },
    data: {
      ...(key ? { key } : {}),
      ...(name ? { name } : {}),
      ...(fields ? { fields } : {}),
      ...(notifyEmail !== undefined ? { notifyEmail } : {}),
    },
  });

  await prisma.auditLog.create({
    data: { userId: auth.sub, action: "FORM_UPDATE", entity: "FormDef", entityId: id },
  });

  return NextResponse.json({ item: updated });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const auth = await requirePermission("forms:write");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const existing = await prisma.formDef.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  await prisma.formDef.delete({ where: { id } }); // cascades to submissions

  await prisma.auditLog.create({
    data: { userId: auth.sub, action: "FORM_DELETE", entity: "FormDef", entityId: id },
  });

  return NextResponse.json({ ok: true });
}
