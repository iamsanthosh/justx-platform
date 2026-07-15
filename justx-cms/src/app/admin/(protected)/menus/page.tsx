import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePagePermission } from "@/lib/rbac";
import MenuEditor from "./MenuEditor";
import NewMenuForm from "./NewMenuForm";

interface MenuItemRow {
  id: string;
  label: string;
  href: string;
  order: number;
  parentId: string | null;
}

interface MenuSummary {
  key: string;
  label: string;
}

interface Props {
  searchParams: Promise<{ key?: string }>;
}

export default async function MenusPage({ searchParams }: Props) {
  await requirePagePermission("menus:read");

  const allMenus: MenuSummary[] = await prisma.menu.findMany({ orderBy: { key: "asc" } });

  const { key: requestedKey } = await searchParams;
  const activeKey = requestedKey || allMenus[0]?.key || "primary-nav";

  const menu = await prisma.menu.upsert({
    where: { key: activeKey },
    update: {},
    create: { key: activeKey, label: activeKey },
    include: { items: { orderBy: { order: "asc" } } },
  });

  const items: MenuItemRow[] = menu.items;
  const menusToShow = allMenus.some((m) => m.key === activeKey)
    ? allMenus
    : [...allMenus, { key: activeKey, label: menu.label }];

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Menus</h1>
      <p className="mt-1 text-sm text-muted">
        Unlimited menus are supported — the public primary navigation reads from the{" "}
        <code className="text-xs">primary-nav</code> key specifically; other menus are available
        for future use (e.g. a footer menu) once wired into a page.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {menusToShow.map((m) => (
          <Link
            key={m.key}
            href={`/admin/menus?key=${encodeURIComponent(m.key)}`}
            className={`rounded-full px-3 py-1 text-xs ${
              m.key === activeKey
                ? "bg-ink text-white"
                : "border border-border text-ink hover:bg-off"
            }`}
          >
            {m.key}
          </Link>
        ))}
        <NewMenuForm />
      </div>

      <MenuEditor menuKey={activeKey} initialItems={items} />
    </div>
  );
}

