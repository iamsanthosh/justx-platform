"use client";

import { useState } from "react";
import type { SectionRecord } from "@/types/content";

export default function SectionsBoard({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept for API context/future use
  pageId,
  initialSections,
}: {
  pageId: string;
  initialSections: SectionRecord[];
}) {
  const [sections, setSections] = useState(
    [...initialSections].sort((a, b) => a.order - b.order)
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftJson, setDraftJson] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function refreshFromServer(next: SectionRecord[]) {
    setSections([...next].sort((a, b) => a.order - b.order));
  }

  async function patch(id: string, body: Record<string, unknown>) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/sections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Update failed");
        return null;
      }
      return data.item as SectionRecord;
    } finally {
      setBusyId(null);
    }
  }

  async function toggleEnabled(s: SectionRecord) {
    const updated = await patch(s.id, { enabled: !s.enabled });
    if (updated) refreshFromServer(sections.map((x) => (x.id === s.id ? updated : x)));
  }

  async function toggleStatus(s: SectionRecord) {
    const nextStatus = s.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const updated = await patch(s.id, { status: nextStatus });
    if (updated) refreshFromServer(sections.map((x) => (x.id === s.id ? updated : x)));
  }

  async function move(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const a = sections[index];
    const b = sections[targetIndex];
    if (!a || !b) return;

    const [updatedA, updatedB] = await Promise.all([
      patch(a.id, { order: b.order }),
      patch(b.id, { order: a.order }),
    ]);

    if (updatedA && updatedB) {
      refreshFromServer(
        sections.map((x) => (x.id === a.id ? updatedA : x.id === b.id ? updatedB : x))
      );
    }
  }

  async function duplicate(s: SectionRecord) {
    setBusyId(s.id);
    setError(null);
    try {
      const res = await fetch(`/api/sections/${s.id}/duplicate`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Duplicate failed");
        return;
      }
      refreshFromServer([...sections, data.item]);
    } finally {
      setBusyId(null);
    }
  }

  async function remove(s: SectionRecord) {
    if (!confirm(`Delete this ${s.type} section? This can't be undone.`)) return;
    setBusyId(s.id);
    setError(null);
    try {
      const res = await fetch(`/api/sections/${s.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Delete failed");
        return;
      }
      refreshFromServer(sections.filter((x) => x.id !== s.id));
    } finally {
      setBusyId(null);
    }
  }

  function startEdit(s: SectionRecord) {
    setEditingId(s.id);
    setDraftJson(JSON.stringify(s.content, null, 2));
    setError(null);
  }

  async function saveEdit(s: SectionRecord) {
    let parsedContent: Record<string, unknown>;
    try {
      parsedContent = JSON.parse(draftJson);
    } catch {
      setError("That's not valid JSON — check for a missing comma or bracket.");
      return;
    }
    const updated = await patch(s.id, { content: parsedContent });
    if (updated) {
      refreshFromServer(sections.map((x) => (x.id === s.id ? updated : x)));
      setEditingId(null);
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {sections.length === 0 && (
        <p className="text-sm text-muted">No sections yet on this page.</p>
      )}

      {sections.map((s, i) => (
        <div key={s.id} className="rounded border border-border bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="rounded bg-off px-2 py-1 text-xs font-medium text-ink">
                {s.type}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  s.status === "PUBLISHED"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {s.status}
              </span>
              {!s.enabled && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                  Disabled
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm">
              <button
                disabled={busyId === s.id || i === 0}
                onClick={() => move(i, -1)}
                className="rounded border border-border px-2 py-1 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                disabled={busyId === s.id || i === sections.length - 1}
                onClick={() => move(i, 1)}
                className="rounded border border-border px-2 py-1 disabled:opacity-30"
              >
                ↓
              </button>
              <button
                disabled={busyId === s.id}
                onClick={() => toggleEnabled(s)}
                className="rounded border border-border px-3 py-1 hover:bg-off"
              >
                {s.enabled ? "Disable" : "Enable"}
              </button>
              <button
                disabled={busyId === s.id}
                onClick={() => toggleStatus(s)}
                className="rounded border border-border px-3 py-1 hover:bg-off"
              >
                {s.status === "PUBLISHED" ? "Unpublish" : "Publish"}
              </button>
              <button
                disabled={busyId === s.id}
                onClick={() => startEdit(s)}
                className="rounded border border-border px-3 py-1 hover:bg-off"
              >
                Edit
              </button>
              <button
                disabled={busyId === s.id}
                onClick={() => duplicate(s)}
                className="rounded border border-border px-3 py-1 hover:bg-off"
              >
                Duplicate
              </button>
              <button
                disabled={busyId === s.id}
                onClick={() => remove(s)}
                className="rounded border border-red-200 px-3 py-1 text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>

          {editingId === s.id && (
            <div className="border-t border-border bg-off p-4">
              <textarea
                value={draftJson}
                onChange={(e) => setDraftJson(e.target.value)}
                rows={10}
                className="w-full rounded border border-border bg-white p-3 font-mono text-xs"
              />
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => saveEdit(s)}
                  className="rounded bg-ink px-4 py-2 text-sm text-white hover:opacity-90"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="rounded border border-border px-4 py-2 text-sm hover:bg-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
