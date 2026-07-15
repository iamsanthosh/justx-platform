"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface FormRow {
  id: string;
  key: string;
  name: string;
  _count: { submissions: number };
}

export default function FormsList({ initialForms }: { initialForms: FormRow[] }) {
  const router = useRouter();
  const forms = initialForms;
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function create() {
    setError(null);
    if (!name.trim() || !key.trim()) {
      setError("Name and key are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          key,
          fields: [{ name: "message", label: "Message", type: "textarea", required: true }],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create form");
      router.push(`/admin/forms/${data.item.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create form");
      setSaving(false);
    }
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="rounded border border-border bg-white p-4">
        <h2 className="text-sm font-medium text-ink">Create a new form</h2>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input
            placeholder="Display name (e.g. Careers Application)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded border border-border px-3 py-2 text-sm"
          />
          <input
            placeholder="Key (e.g. careers-application)"
            value={key}
            onChange={(e) => setKey(e.target.value.toLowerCase())}
            className="rounded border border-border px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={create}
          disabled={saving}
          className="mt-3 rounded bg-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "Creating..." : "Create form"}
        </button>
      </div>

      <div className="overflow-hidden rounded border border-border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-off text-left text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Key</th>
              <th className="px-4 py-3">Submissions</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {forms.map((f) => (
              <tr key={f.id}>
                <td className="px-4 py-3 font-medium text-ink">{f.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted">{f.key}</td>
                <td className="px-4 py-3 text-muted">{f._count.submissions}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/forms/${f.id}`} className="text-cyan hover:underline">
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
            {forms.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-muted">
                  No forms yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
