import { prisma } from "@/lib/prisma";
import { requirePagePermission } from "@/lib/rbac";
import SettingsForm from "./SettingsForm";

interface SettingRow {
  key: string;
  value: unknown;
}

export default async function SettingsPage() {
  await requirePagePermission("settings:read");

  const rows: SettingRow[] = await prisma.setting.findMany();
  const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Settings</h1>
      <p className="mt-1 text-sm text-muted">
        Global site settings and default SEO metadata.
      </p>
      <SettingsForm
        initial={{
          siteTitle: (settings.siteTitle as string) || "",
          siteDescription: (settings.siteDescription as string) || "",
          contactEmail: (settings.contactEmail as string) || "",
          logoUrl: (settings.logoUrl as string) || "/uploads/seed/logo.png",
        }}
      />
    </div>
  );
}
