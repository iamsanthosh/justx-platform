"use client";

import { useState } from "react";

interface Testimonial {
  id: string;
  author: string;
  role: string | null;
  company: string | null;
  quote: string;
  avatarUrl: string | null;
  enabled: boolean;
  order: number;
}

const empty = { author: "", role: "", company: "", quote: "", avatarUrl: "" };

export default function TestimonialsManager({ initialItems }: { initialItems: Testimonial[] }) {
  const [items, setItems] = useState(initialItems);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function create() {
    if (!form.author.trim() || !form.quote.trim()) {
      setError("Author and quote are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: form.author,
          role: form.role || null,
          company: form.company || null,
          quote: form.quote,
          avatarUrl: form.avatarUrl || null,
          order: items.length,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setItems((prev) => [...prev, data.item]);
      setForm(empty);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function toggleEnabled(t: Testimonial) {
    const res = await fetch(`/api/testimonials/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !t.enabled }),
    });
    if (res.ok) {
      setItems((prev) => prev.map((i) => (i.id === t.id ? { ...i, enabled: !i.enabled } : i)));
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    const res = await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="rounded border border-border bg-white p-4">
        <h2 className="text-sm font-medium text-ink">Add testimonial</h2>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input
            placeholder="Author name"
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
            className="rounded border border-border px-3 py-2 text-sm"
          />
          <input
            placeholder="Role (optional)"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="rounded border border-border px-3 py-2 text-sm"
          />
          <input
            placeholder="Company (optional)"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            className="rounded border border-border px-3 py-2 text-sm"
          />
          <input
            placeholder="Avatar URL (optional)"
            value={form.avatarUrl}
            onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
            className="rounded border border-border px-3 py-2 text-sm"
          />
          <textarea
            placeholder="Quote"
            value={form.quote}
            onChange={(e) => setForm({ ...form, quote: e.target.value })}
            rows={3}
            className="sm:col-span-2 rounded border border-border px-3 py-2 text-sm"
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

      <div className="space-y-2">
        {items.map((t) => (
          <div key={t.id} className="flex items-start justify-between rounded border border-border bg-white p-4">
            <div>
              <p className="text-sm text-body">&ldquo;{t.quote}&rdquo;</p>
              <p className="mt-1 text-xs font-medium text-ink">
                {t.author}
                {t.role && <span className="text-muted"> · {t.role}</span>}
                {t.company && <span className="text-muted"> · {t.company}</span>}
              </p>
              <p className="mt-1 font-mono text-xs text-muted">id: {t.id}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => toggleEnabled(t)}
                className="rounded border border-border px-3 py-1 text-xs hover:bg-off"
              >
                {t.enabled ? "Disable" : "Enable"}
              </button>
              <button
                onClick={() => remove(t.id)}
                className="rounded border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-muted">No testimonials yet.</p>}
      </div>
    </div>
  );
}
