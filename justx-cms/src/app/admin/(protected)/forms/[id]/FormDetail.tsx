"use client";

import { useState } from "react";
import type { FormField } from "@/lib/validation/forms";

interface SubmissionRow {
  id: string;
  data: Record<string, unknown>;
  status: string;
  notes: string | null;
  createdAt: string;
}

const FIELD_TYPES: FormField["type"][] = [
  "text",
  "email",
  "tel",
  "textarea",
  "select",
  "checkbox",
  "number",
];

export default function FormDetail({
  formId,
  formKey,
  notifyEmail,
  fields: initialFields,
  submissions: initialSubmissions,
}: {
  formId: string;
  formKey: string;
  formName: string;
  notifyEmail: string | null;
  fields: FormField[];
  submissions: SubmissionRow[];
}) {
  const [fields, setFields] = useState<FormField[]>(initialFields);
  const [notify, setNotify] = useState(notifyEmail || "");
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField(index: number, patch: Partial<FormField>) {
    setFields((prev) => prev.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  }

  function addField() {
    setFields((prev) => [
      ...prev,
      { name: `field_${prev.length + 1}`, label: "New field", type: "text", required: false },
    ]);
  }

  function removeField(index: number) {
    setFields((prev) => prev.filter((_, i) => i !== index));
  }

  async function saveFields() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch(`/api/forms/${formId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields, notifyEmail: notify || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function updateSubmission(id: string, patch: { status?: string; notes?: string }) {
    const res = await fetch(`/api/forms/${formId}/submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    }
  }

  return (
    <div className="mt-6 space-y-8">
      <section className="rounded border border-border bg-white p-4">
        <h2 className="text-sm font-medium text-ink">Fields</h2>
        <div className="mt-3 space-y-2">
          {fields.map((f, i) => (
            <div key={i} className="grid grid-cols-12 gap-2">
              <input
                value={f.name}
                onChange={(e) => updateField(i, { name: e.target.value })}
                placeholder="field_name"
                className="col-span-3 rounded border border-border px-2 py-1.5 text-xs font-mono"
              />
              <input
                value={f.label}
                onChange={(e) => updateField(i, { label: e.target.value })}
                placeholder="Label"
                className="col-span-4 rounded border border-border px-2 py-1.5 text-xs"
              />
              <select
                value={f.type}
                onChange={(e) => updateField(i, { type: e.target.value as FormField["type"] })}
                className="col-span-2 rounded border border-border px-2 py-1.5 text-xs"
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <label className="col-span-2 flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={f.required}
                  onChange={(e) => updateField(i, { required: e.target.checked })}
                />
                Required
              </label>
              <button
                onClick={() => removeField(i)}
                className="col-span-1 rounded border border-red-200 text-xs text-red-600 hover:bg-red-50"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addField}
          className="mt-3 rounded border border-border px-3 py-1.5 text-xs hover:bg-off"
        >
          + Add field
        </button>

        <div className="mt-4">
          <label className="text-xs font-medium text-ink">Notification email (optional)</label>
          <input
            value={notify}
            onChange={(e) => setNotify(e.target.value)}
            placeholder="team@justxsystems.com"
            className="mt-1 w-full max-w-sm rounded border border-border px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        {saved && <p className="mt-3 text-sm text-green-700">Saved.</p>}

        <button
          onClick={saveFields}
          disabled={saving}
          className="mt-4 rounded bg-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save fields"}
        </button>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-ink">
            Submissions <span className="text-muted">({submissions.length})</span>
          </h2>
          <a
            href={`/api/forms/${formId}/submissions?format=csv`}
            className="rounded border border-border px-3 py-1.5 text-xs hover:bg-off"
          >
            Export CSV
          </a>
        </div>

        <div className="mt-3 space-y-2">
          {submissions.map((s) => (
            <div key={s.id} className="rounded border border-border bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-muted">
                  {new Date(s.createdAt).toLocaleString()}
                </span>
                <select
                  value={s.status}
                  onChange={(e) => updateSubmission(s.id, { status: e.target.value })}
                  className="rounded border border-border px-2 py-1 text-xs"
                >
                  {["NEW", "IN_PROGRESS", "RESOLVED", "SPAM"].map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
              <dl className="mt-2 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
                {Object.entries(s.data).map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs text-muted">{k}</dt>
                    <dd className="text-ink">{String(v)}</dd>
                  </div>
                ))}
              </dl>
              <textarea
                defaultValue={s.notes || ""}
                onBlur={(e) => updateSubmission(s.id, { notes: e.target.value })}
                placeholder="Internal notes..."
                rows={2}
                className="mt-2 w-full rounded border border-border px-2 py-1.5 text-xs"
              />
            </div>
          ))}
          {submissions.length === 0 && (
            <p className="text-sm text-muted">No submissions yet for /api/forms/submit/{formKey}.</p>
          )}
        </div>
      </section>
    </div>
  );
}
