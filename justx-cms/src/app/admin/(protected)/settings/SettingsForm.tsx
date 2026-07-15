"use client";

import { useState } from "react";

interface SettingsValues {
  siteTitle: string;
  siteDescription: string;
  contactEmail: string;
}

export default function SettingsForm({ initial }: { initial: SettingsValues }) {
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save settings");
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-6 max-w-lg rounded border border-border bg-white p-6">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-ink">Site title</label>
          <input
            value={values.siteTitle}
            onChange={(e) => setValues({ ...values, siteTitle: e.target.value })}
            className="mt-1 w-full rounded border border-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink">Default meta description</label>
          <textarea
            value={values.siteDescription}
            onChange={(e) => setValues({ ...values, siteDescription: e.target.value })}
            rows={3}
            className="mt-1 w-full rounded border border-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink">Contact email</label>
          <input
            type="email"
            value={values.contactEmail}
            onChange={(e) => setValues({ ...values, contactEmail: e.target.value })}
            className="mt-1 w-full rounded border border-border px-3 py-2 text-sm"
          />
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {saved && <p className="mt-4 text-sm text-green-700">Settings saved.</p>}

      <button
        onClick={save}
        disabled={saving}
        className="mt-6 rounded bg-ink px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save settings"}
      </button>
    </div>
  );
}
