import { prisma } from "@/lib/prisma";
import { requirePagePermission } from "@/lib/rbac";
import MediaLibrary from "./MediaLibrary";

interface MediaRow {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  altText: string | null;
  folder: string;
  createdAt: Date;
}

export default async function MediaPage() {
  await requirePagePermission("media:read");

  const items: MediaRow[] = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  const folderRows: { folder: string }[] = await prisma.media.findMany({
    distinct: ["folder"],
    select: { folder: true },
  });

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Media Library</h1>
      <p className="mt-1 text-sm text-muted">
        Images, PDFs, and SVGs used across the site. Uploads are optimized and
        re-encoded automatically (except SVG/PDF).
      </p>
      <MediaLibrary
        initialItems={items.map((i) => ({ ...i, createdAt: i.createdAt.toISOString() }))}
        folders={folderRows.map((f) => f.folder)}
      />
    </div>
  );
}
