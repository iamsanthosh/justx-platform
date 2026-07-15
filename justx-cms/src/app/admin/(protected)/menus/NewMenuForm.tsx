"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewMenuForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState("");

  function submit() {
    const clean = key.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
    if (!clean) return;
    setOpen(false);
    setKey("");
    router.push(`/admin/menus?key=${encodeURIComponent(clean)}`);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border border-dashed border-border px-3 py-1 text-xs text-muted hover:bg-off"
      >
        + New menu
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <input
        autoFocus
        value={key}
        onChange={(e) => setKey(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="footer-menu"
        className="rounded border border-border px-2 py-1 text-xs"
      />
      <button onClick={submit} className="rounded bg-ink px-2 py-1 text-xs text-white">
        Create
      </button>
    </div>
  );
}
