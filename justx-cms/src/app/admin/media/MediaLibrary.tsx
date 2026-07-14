"use client";

import { useRef, useState } from "react";
import { Upload, Trash2, X } from "lucide-react";

export interface MediaItemRow {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  altText: string | null;
  folder: string;
  createdAt: string;
}

export default function MediaLibrary({
  initialItems,
  folders,
}: {
  initialItems: MediaItemRow[];
  folders: string[];
}) {
  const [items, setItems] = useState<MediaItemRow[]>(initialItems);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<MediaItemRow | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    setError(null);

    for (const file of Array.from(fileList)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "uploads");

      try {
        const res = await fetch("/api/media", { method: "POST", body: formData });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Upload failed");
        setItems((prev) => [
          { ...json.item, createdAt: new Date(json.item.createdAt).toISOString() },
          ...prev,
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      }
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this file? This cannot be undone.")) return;
    const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function handleSaveAlt(id: string, altText: string) {
    const res = await fetch(`/api/media/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ altText }),
    });
    if (res.ok) {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, altText } : i)));
      setEditing(null);
    }
  }

  return (
    <div className="mt-6">
      <div className="flex items-center gap-4">
        <label className="flex cursor-pointer items-center gap-2 rounded bg-ink px-4 py-2 text-sm font-medium text-white hover:opacity-90">
          <Upload size={16} />
          {uploading ? "Uploading..." : "Upload files"}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif,application/pdf"
            className="hidden"
            disabled={uploading}
            onChange={(e) => handleUpload(e.target.files)}
          />
        </label>
        {folders.length > 0 && (
          <span className="text-xs text-muted">Folders: {folders.join(", ")}</span>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {items.map((item) => (
          <div key={item.id} className="group relative overflow-hidden rounded border border-border bg-white">
            <div className="flex h-28 items-center justify-center bg-off">
              {item.mimeType.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.url} alt={item.altText || item.filename} className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs text-muted">{item.mimeType}</span>
              )}
            </div>
            <div className="p-2">
              <p className="truncate text-xs font-medium text-ink" title={item.filename}>
                {item.filename}
              </p>
              <p className="text-xs text-muted">{(item.sizeBytes / 1024).toFixed(0)} KB</p>
            </div>
            <div className="absolute right-1 top-1 hidden gap-1 group-hover:flex">
              <button
                onClick={() => setEditing(item)}
                className="rounded bg-white/90 px-1.5 py-1 text-xs shadow"
                title="Edit alt text"
              >
                Alt
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="rounded bg-white/90 p-1.5 text-red-600 shadow"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <p className="mt-8 text-sm text-muted">No media uploaded yet.</p>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded bg-white p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-ink">Edit alt text</h3>
              <button onClick={() => setEditing(null)}>
                <X size={18} />
              </button>
            </div>
            <p className="mt-2 truncate text-xs text-muted">{editing.filename}</p>
            <input
              autoFocus
              defaultValue={editing.altText || ""}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveAlt(editing.id, e.currentTarget.value);
              }}
              className="mt-3 w-full rounded border border-border px-3 py-2 text-sm"
              placeholder="Describe the image for accessibility & SEO"
              id="alt-text-input"
            />
            <button
              onClick={() =>
                handleSaveAlt(
                  editing.id,
                  (document.getElementById("alt-text-input") as HTMLInputElement).value
                )
              }
              className="mt-4 w-full rounded bg-ink py-2 text-sm font-medium text-white"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
