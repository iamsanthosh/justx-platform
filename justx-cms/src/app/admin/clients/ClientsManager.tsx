"use client";

import { useState } from "react";

interface ClientRow {
  id: string;
  name: string;
  logoUrl: string;
  website: string | null;
  enabled: boolean;
  order: number;
}

export default function ClientsManager({ initialItems }: { initialItems: ClientRow[] }) {
  const [items, setItems] = useState(initialItems);
  const [form, setForm] = useState({ name: "", logoUrl: "", website: "" });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function create() {
    if (!form.name.trim() || !form.logoUrl.trim()) {
      setError("Name and logo URL are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          logoUrl: form.logoUrl,
          website: form.website || null,
          order: items.length,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setItems((prev) => [...prev, data.item]);
      setForm({ name: "", logoUrl: "", website: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function toggleEnabled(c: ClientRow) {
    const res = await fetch(`/api/clients/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !c.enabled }),
    });
    if (res.ok) {
      setItems((prev) => prev.map((i) => (i.id === c.id ? { ...i, enabled: !i.enabled } : i)));
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this client?")) return;
    const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="rounded border border-border bg-white p-4">
        <h2 className="text-sm font-medium text-ink">Add client</h2>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded border border-border px-3 py-2 text-sm"
          />
          <input
            placeholder="Logo URL"
            value={form.logoUrl}
            onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
            className="rounded border border-border px-3 py-2 text-sm"
          />
          <input
            placeholder="Website (optional)"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            className="rounded border border-border px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={create}
          disabled={saving}
          className="mt-3 rounded bg-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Add"}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {items.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded border border-border bg-white p-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{c.name}</p>
              {c.website && <p className="truncate text-xs text-muted">{c.website}</p>}
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => toggleEnabled(c)}
                className="rounded border border-border px-2 py-1 text-xs hover:bg-off"
              >
                {c.enabled ? "Disable" : "Enable"}
              </button>
              <button
                onClick={() => remove(c.id)}
                className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-muted">No clients yet.</p>}
      </div>
    </div>
  );
}
