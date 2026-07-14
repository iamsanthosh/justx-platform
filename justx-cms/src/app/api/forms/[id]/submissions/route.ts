import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

interface Params {
  params: Promise<{ id: string }>;
}

interface SubmissionRow {
  id: string;
  data: unknown;
  status: string;
  notes: string | null;
  createdAt: Date;
}

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await requirePermission("forms:read");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const form = await prisma.formDef.findUnique({ where: { id } });
  if (!form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  const submissions: SubmissionRow[] = await prisma.formSubmission.findMany({
    where: { formId: id },
    orderBy: { createdAt: "desc" },
  });

  const format = req.nextUrl.searchParams.get("format");
  if (format === "csv") {
    const fields = (form.fields as { name: string; label: string }[]) || [];
    const headers = ["Submitted at", "Status", ...fields.map((f) => f.label), "Notes"];
    const rows = submissions.map((s) => {
      const data = (s.data as Record<string, unknown>) || {};
      return [
        s.createdAt.toISOString(),
        s.status,
        ...fields.map((f) => csvEscape(String(data[f.name] ?? ""))),
        csvEscape(s.notes ?? ""),
      ];
    });
    const csv = [headers.map(csvEscape).join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${form.key}-submissions.csv"`,
      },
    });
  }

  return NextResponse.json({ items: submissions, form });
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
