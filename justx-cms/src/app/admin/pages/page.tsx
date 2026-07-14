import Link from "next/link";
import { listPages } from "@/lib/data/pages";

export default async function AdminPagesList() {
  const pages = await listPages();

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Pages</h1>
      <div className="mt-6 overflow-hidden rounded border border-border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-off text-left text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pages.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-medium text-ink">{p.title}</td>
                <td className="px-4 py-3 text-muted">/{p.slug}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      p.status === "PUBLISHED"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/pages/${p.id}`} className="text-cyan hover:underline">
                    Edit sections
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
