import { notFound } from "next/navigation";
import { getPageForEditing } from "@/lib/data/pages";
import { requirePagePermission } from "@/lib/rbac";
import SectionsBoard from "./SectionsBoard";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PageEditor({ params }: Props) {
  await requirePagePermission("sections:read");
  const { id } = await params;
  const page = await getPageForEditing(id);
  if (!page) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">
        {page.title} <span className="text-muted">/{page.slug}</span>
      </h1>
      <p className="mt-1 text-sm text-muted">
        Enable, disable, reorder, duplicate, or edit the sections on this page. Changes to a
        section only appear on the live site once its status is set to Published.
      </p>
      <div className="mt-6">
        <SectionsBoard pageId={page.id} initialSections={page.sections} />
      </div>
    </div>
  );
}
