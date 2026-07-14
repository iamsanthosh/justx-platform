import { prisma } from "@/lib/prisma";
import { requirePagePermission } from "@/lib/rbac";
import MenuEditor from "./MenuEditor";

interface MenuItemRow {
  id: string;
  label: string;
  href: string;
  order: number;
  parentId: string | null;
}

export default async function MenusPage() {
  await requirePagePermission("menus:read");

  const menu = await prisma.menu.upsert({
    where: { key: "primary-nav" },
    update: {},
    create: { key: "primary-nav", label: "Primary Navigation" },
    include: { items: { orderBy: { order: "asc" } } },
  });

  const items: MenuItemRow[] = menu.items;

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Menus</h1>
      <p className="mt-1 text-sm text-muted">
        Primary navigation shown across the public site.
      </p>
      <MenuEditor menuKey="primary-nav" initialItems={items} />
    </div>
  );
}
