import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublishedPageBySlug, getMenu } from "@/lib/data/pages";
import Nav from "@/components/sections/Nav";
import SectionRenderer from "@/components/sections/SectionRenderer";

export async function buildPageMetadata(slug: string): Promise<Metadata> {
  const page = await getPublishedPageBySlug(slug);
  if (!page) return {};
  return {
    title: page.metaTitle || page.title,
    description: page.metaDesc || undefined,
    openGraph: {
      title: page.metaTitle || page.title,
      description: page.metaDesc || undefined,
    },
  };
}

export default async function PageRenderer({ slug }: { slug: string }) {
  const page = await getPublishedPageBySlug(slug);
  if (!page) notFound();

  const navItems = await getMenu("primary-nav");

  return (
    <>
      <Nav
        items={
          navItems.length > 0
            ? navItems.map((i) => ({ label: i.label, href: i.href }))
            : [
                { label: "Services", href: "/#services" },
                { label: "Industries", href: "/#industries" },
                { label: "Contact", href: "/#contact" },
              ]
        }
      />
      <main>
        {page.sections.map((section) => (
          <SectionRenderer key={section.id} section={section} />
        ))}
      </main>
    </>
  );
}
