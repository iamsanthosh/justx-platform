import { prisma } from "@/lib/prisma";
import { requirePagePermission } from "@/lib/rbac";
import UsersManager from "./UsersManager";

interface UserWithRole {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  role: { id: string; name: string };
}

interface RoleRow {
  id: string;
  name: string;
}

export default async function UsersPage() {
  await requirePagePermission("users:read");

  const users: UserWithRole[] = await prisma.user.findMany({
    include: { role: true },
    orderBy: { createdAt: "asc" },
  });
  const roles: RoleRow[] = await prisma.role.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Users</h1>
      <p className="mt-1 text-sm text-muted">
        Manage admin accounts. Only Super Admins can access this page.
      </p>
      <UsersManager
        initialUsers={users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          isActive: u.isActive,
          role: { id: u.role.id, name: u.role.name },
        }))}
        roles={roles.map((r) => ({ id: r.id, name: r.name }))}
      />
    </div>
  );
}
