import { prisma } from "@/lib/prisma";
import { requirePagePermission } from "@/lib/rbac";
import ClientsManager from "./ClientsManager";

export default async function ClientsPage() {
  await requirePagePermission("content:read");

  const items = await prisma.client.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Clients</h1>
      <p className="mt-1 text-sm text-muted">Logos shown in client/partner sections.</p>
      <ClientsManager initialItems={items} />
    </div>
  );
}
