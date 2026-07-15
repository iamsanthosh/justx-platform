import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const [pages, sections, enquiries, media] = await Promise.all([
    prisma.page.count(),
    prisma.section.count(),
    prisma.enquiry.count({ where: { status: "NEW" } }),
    prisma.media.count(),
  ]);

  const cards = [
    { label: "Pages", value: pages },
    { label: "Sections", value: sections },
    { label: "New enquiries", value: enquiries },
    { label: "Media assets", value: media },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded border border-border bg-white p-6">
            <div className="text-3xl font-semibold text-ink">{c.value}</div>
            <div className="mt-1 text-sm text-muted">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
