import type { MetadataRoute } from "next";
import { listPages } from "@/lib/data/pages";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://justxsystems.com";
  const pages = await listPages();

  return pages
    .filter((p) => p.status === "PUBLISHED")
    .map((p) => ({
      url: p.slug ? `${siteUrl}/${p.slug}` : siteUrl,
      lastModified: p.updatedAt,
    }));
}
