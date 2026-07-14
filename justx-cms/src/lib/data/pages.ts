import { prisma } from "@/lib/prisma";
import type { PageRecord, SectionRecord } from "@/types/content";

/**
 * Repository layer for the public rendering engine.
 * Keeps Prisma calls out of components/pages so the data-access
 * strategy (Prisma today, something else tomorrow) can change without
 * touching the UI layer.
 */

function toSectionRecord(s: {
  id: string;
  pageId: string;
  type: string;
  order: number;
  enabled: boolean;
  status: string;
  content: unknown;
}): SectionRecord {
  return {
    id: s.id,
    pageId: s.pageId,
    type: s.type as SectionRecord["type"],
    order: s.order,
    enabled: s.enabled,
    status: s.status as SectionRecord["status"],
    content: (s.content as Record<string, unknown>) ?? {},
  };
}

/** Fetches a published page by slug, with its enabled + published sections in order. */
export async function getPublishedPageBySlug(slug: string): Promise<PageRecord | null> {
  const page = await prisma.page.findUnique({
    where: { slug },
    include: {
      sections: {
        where: { enabled: true, status: "PUBLISHED" },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!page || page.status !== "PUBLISHED") return null;

  return {
    id: page.id,
    slug: page.slug,
    title: page.title,
    metaTitle: page.metaTitle,
    metaDesc: page.metaDesc,
    status: page.status,
    sections: page.sections.map(toSectionRecord),
  };
}

/** Admin-facing: fetch a page (any status) with all sections, for the CMS editor. */
export async function getPageForEditing(pageId: string): Promise<PageRecord | null> {
  const page = await prisma.page.findUnique({
    where: { id: pageId },
    include: { sections: { orderBy: { order: "asc" } } },
  });
  if (!page) return null;
  return {
    id: page.id,
    slug: page.slug,
    title: page.title,
    metaTitle: page.metaTitle,
    metaDesc: page.metaDesc,
    status: page.status,
    sections: page.sections.map(toSectionRecord),
  };
}

export interface PageSummary {
  id: string;
  slug: string;
  title: string;
  status: "DRAFT" | "PUBLISHED";
  updatedAt: Date;
}

export async function listPages(): Promise<PageSummary[]> {
  return prisma.page.findMany({ orderBy: { createdAt: "asc" } });
}

export interface TestimonialRow {
  id: string;
  author: string;
  role: string | null;
  company: string | null;
  quote: string;
  avatarUrl: string | null;
  enabled: boolean;
  order: number;
}

/** Resolves testimonial rows referenced by a TESTIMONIALS section (or all enabled ones). */
export async function resolveTestimonials(ids: string[]): Promise<TestimonialRow[]> {
  const where = ids.length > 0 ? { id: { in: ids }, enabled: true } : { enabled: true };
  return prisma.testimonial.findMany({ where, orderBy: { order: "asc" } });
}

export interface MediaRow {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  altText: string | null;
}

/** Resolves media rows referenced by a GALLERY section. */
export async function resolveMedia(ids: string[]): Promise<MediaRow[]> {
  if (ids.length === 0) return [];
  return prisma.media.findMany({ where: { id: { in: ids } } });
}

export interface MenuItemRow {
  id: string;
  label: string;
  href: string;
  order: number;
  parentId: string | null;
}

/** Fetches menu items for a given menu key (e.g. "primary-nav"), nested by parentId. */
export async function getMenu(key: string): Promise<MenuItemRow[]> {
  const menu = await prisma.menu.findUnique({
    where: { key },
    include: { items: { orderBy: { order: "asc" } } },
  });
  return menu?.items ?? [];
}
