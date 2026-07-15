import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

interface SettingRow {
  key: string;
  value: unknown;
}

// Known settings keys with their expected shape. New keys can still be
// stored (the model is a generic key-value store) but these are the ones
// the admin Settings screen edits directly.
const settingsSchema = z.object({
  siteTitle: z.string().min(1).max(150).optional(),
  siteDescription: z.string().max(300).optional(),
  defaultOgImage: z.string().optional(),
  logoUrl: z.string().max(500).optional(),
  contactEmail: z.string().email().optional(),
  socialLinks: z
    .array(z.object({ platform: z.string(), href: z.string().url() }))
    .optional(),
});

export async function GET() {
  const auth = await requirePermission("settings:read");
  if (auth instanceof NextResponse) return auth;

  const rows: SettingRow[] = await prisma.setting.findMany();
  const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return NextResponse.json({ settings });
}

export async function PATCH(req: NextRequest) {
  const auth = await requirePermission("settings:write");
  if (auth instanceof NextResponse) return auth;

  const body = await req.json().catch(() => null);
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const entries = Object.entries(parsed.data).filter(([, v]) => v !== undefined);

  await Promise.all(
    entries.map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: value as object },
        create: { key, value: value as object },
      })
    )
  );

  await prisma.auditLog.create({
    data: { userId: auth.sub, action: "SETTINGS_UPDATE", entity: "Setting" },
  });

  const rows: SettingRow[] = await prisma.setting.findMany();
  return NextResponse.json({ settings: Object.fromEntries(rows.map((r) => [r.key, r.value])) });
}
