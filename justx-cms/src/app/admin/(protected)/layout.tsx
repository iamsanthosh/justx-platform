import Link from "next/link";
import { getSession } from "@/lib/session";
import AdminLogoutButton from "./LogoutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    // Note: Middleware handles redirects to /admin/login
    // This shouldn't be reached, but just in case
    return null;
  }

  return (
    <div className="flex min-h-screen bg-off">
      <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-ink text-white">
        <div className="px-6 py-6">
          <span className="font-display text-lg">JustX CMS</span>
        </div>
        <nav className="space-y-1 px-3">
          {[
            { href: "/admin/dashboard", label: "Dashboard" },
            { href: "/admin/pages", label: "Pages" },
            { href: "/admin/menus", label: "Menus" },
            { href: "/admin/media", label: "Media" },
            { href: "/admin/forms", label: "Forms" },
            { href: "/admin/testimonials", label: "Testimonials" },
            { href: "/admin/clients", label: "Clients" },
            { href: "/admin/enquiries", label: "Enquiries" },
            { href: "/admin/users", label: "Users" },
            { href: "/admin/settings", label: "Settings" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto px-3 py-6">
          <div className="mb-3 px-3 text-xs text-white/50">{session.email}</div>
          <AdminLogoutButton />
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
