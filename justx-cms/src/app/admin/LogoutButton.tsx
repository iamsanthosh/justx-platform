"use client";

import { useRouter } from "next/navigation";

export default function AdminLogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      className="w-full rounded px-3 py-2 text-left text-sm text-white/70 hover:bg-white/10 hover:text-white"
    >
      Sign out
    </button>
  );
}
