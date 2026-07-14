import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { logger } from "@/lib/logger";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",
  "application/pdf",
]);

const MAX_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  const auth = await requirePermission("media:write");
  if (auth instanceof NextResponse) return auth;

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const folder = (form?.get("folder") as string) || "uploads";
  const altText = (form?.get("altText") as string) || null;

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json({ error: `Unsupported file type: ${file.type}` }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File exceeds the 10MB limit" }, { status: 400 });
  }

  // Sanitize folder to prevent path traversal; only allow safe segment names.
  const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 60) || "uploads";

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name).toLowerCase() || guessExt(file.type);
  const uniqueName = `${crypto.randomUUID()}${ext}`;

  const uploadDir = path.join(process.cwd(), "public", "uploads", safeFolder);
  await mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, uniqueName);

  let width: number | undefined;
  let height: number | undefined;
  let toWrite = buffer;

  // Optimize + read dimensions for raster images (skip SVG/PDF: sharp can't
  // reliably transcode SVG and doesn't handle PDFs at all).
  if (file.type.startsWith("image/") && file.type !== "image/svg+xml") {
    try {
      const image = sharp(buffer).rotate(); // auto-orient
      const metadata = await image.metadata();
      width = metadata.width;
      height = metadata.height;
      // Re-encode to strip metadata and cap dimensions for web use.
      toWrite = await image
        .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
        .toBuffer();
    } catch (err) {
      logger.warn("Image optimization skipped", { error: String(err) });
    }
  }

  await writeFile(filePath, toWrite);

  const publicUrl = `/uploads/${safeFolder}/${uniqueName}`;

  const media = await prisma.media.create({
    data: {
      filename: file.name,
      url: publicUrl,
      mimeType: file.type,
      sizeBytes: toWrite.byteLength,
      width,
      height,
      altText,
      folder: safeFolder,
    },
  });

  await prisma.auditLog.create({
    data: { userId: auth.sub, action: "MEDIA_UPLOAD", entity: "Media", entityId: media.id },
  });

  return NextResponse.json({ item: media }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const auth = await requirePermission("media:read");
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const folder = searchParams.get("folder") || undefined;
  const search = searchParams.get("q") || undefined;

  const items = await prisma.media.findMany({
    where: {
      ...(folder ? { folder } : {}),
      ...(search ? { filename: { contains: search } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const folders: { folder: string }[] = await prisma.media.findMany({
    distinct: ["folder"],
    select: { folder: true },
  });

  return NextResponse.json({ items, folders: folders.map((f) => f.folder) });
}

function guessExt(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
    "image/gif": ".gif",
    "application/pdf": ".pdf",
  };
  return map[mime] || "";
}
