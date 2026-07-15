"use client";

import { useState } from "react";

interface MenuItemRow {
  id: string;
  label: string;
  href: string;
  order: number;
  parentId: string | null;
}

export default function MenuEditor({
  menuKey,
  initialItems,
}: {
  menuKey: string;
  initialItems: MenuItemRow[];
}) {
  const [items, setItems] = useState([...initialItems].sort((a, b) => a.order - b.order));
  const [form, setForm] = useState({ label: "", href: "" });
  const [error, setError] = useState<string | null>(null);

  async function add() {
    if (!form.label.trim() || !form.href.trim()) {
      setError("Label and link are required.");
      return;
    }
    setError(null);
    const res = await fetch("/api/menus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ menuKey, label: form.label, href: form.href, order: items.length }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to add");
      return;
    }
    setItems((prev) => [...prev, data.item]);
    setForm({ label: "", href: "" });
  }

  async function remove(id: string) {
    const res = await fetch(`/api/menus/${id}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function move(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const a = items[index];
    const b = items[targetIndex];
    if (!a || !b) return;

    await Promise.all([
      fetch(`/api/menus/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: b.order }),
      }),
      fetch(`/api/menus/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: a.order }),
      }),
    ]);

    setItems((prev) => {
      const next = prev.map((item) => {
        if (item.id === a.id) return { ...item, order: b.order };
        if (item.id === b.id) return { ...item, order: a.order };
        return item;
      });
      return [...next].sort((x, y) => x.order - y.order);
    });
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="rounded border border-border bg-white p-4">
        <h2 className="text-sm font-medium text-ink">Add menu item</h2>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input
            placeholder="Label"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            className="rounded border border-border px-3 py-2 text-sm"
          />
          <input
            placeholder="Link (e.g. /about or /#contact)"
            value={form.href}
            onChange={(e) => setForm({ ...form, href: e.target.value })}
            className="rounded border border-border px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={add}
          className="mt-3 rounded bg-ink px-4 py-2 text-sm font-medium text-white"
        >
          Add
        </button>
      </div>

      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded border border-border bg-white p-3"
          >
            <div>
              <span className="text-sm font-medium text-ink">{item.label}</span>
              <span className="ml-2 text-xs text-muted">{item.href}</span>
            </div>
            <div className="flex gap-2">
              <button
                disabled={i === 0}
                onClick={() => move(i, -1)}
                className="rounded border border-border px-2 py-1 text-xs disabled:opacity-30"
              >
                ↑
              </button>
              <button
                disabled={i === items.length - 1}
                onClick={() => move(i, 1)}
                className="rounded border border-border px-2 py-1 text-xs disabled:opacity-30"
              >
                ↓
              </button>
              <button
                onClick={() => remove(item.id)}
                className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-muted">No menu items yet.</p>}
      </div>
    </div>
  );
}
