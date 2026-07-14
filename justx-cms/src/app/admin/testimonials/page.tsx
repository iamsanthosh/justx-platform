import { prisma } from "@/lib/prisma";
import { requirePagePermission } from "@/lib/rbac";
import TestimonialsManager from "./TestimonialsManager";

export default async function TestimonialsPage() {
  await requirePagePermission("content:read");

  const items = await prisma.testimonial.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Testimonials</h1>
      <p className="mt-1 text-sm text-muted">
        Shown on the site via the Testimonials section — reference these by ID when
        configuring that section.
      </p>
      <TestimonialsManager initialItems={items} />
    </div>
  );
}
