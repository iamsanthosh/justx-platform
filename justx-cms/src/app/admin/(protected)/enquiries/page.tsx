import { prisma } from "@/lib/prisma";
import { requirePagePermission } from "@/lib/rbac";

interface EnquiryRow {
  id: string;
  name: string;
  email: string;
  company: string | null;
  status: string;
  createdAt: Date;
}

export default async function EnquiriesPage() {
  await requirePagePermission("enquiries:read");

  const enquiries = await prisma.enquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Enquiries</h1>
      <div className="mt-6 overflow-x-auto rounded border border-border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-off text-left text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Received</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {enquiries.map((e: EnquiryRow) => (
              <tr key={e.id}>
                <td className="px-4 py-3 font-medium text-ink">{e.name}</td>
                <td className="px-4 py-3 text-muted">{e.email}</td>
                <td className="px-4 py-3 text-muted">{e.company || "—"}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-off px-2 py-0.5 text-xs">{e.status}</span>
                </td>
                <td className="px-4 py-3 text-muted">
                  {new Date(e.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {enquiries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted">
                  No enquiries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
