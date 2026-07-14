import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePagePermission } from "@/lib/rbac";
import type { FormField } from "@/lib/validation/forms";
import FormDetail from "./FormDetail";

interface Props {
  params: Promise<{ id: string }>;
}

interface SubmissionRow {
  id: string;
  data: unknown;
  status: string;
  notes: string | null;
  createdAt: Date;
}

export default async function FormDetailPage({ params }: Props) {
  await requirePagePermission("forms:read");

  const { id } = await params;
  const form = await prisma.formDef.findUnique({ where: { id } });
  if (!form) notFound();

  const submissions: SubmissionRow[] = await prisma.formSubmission.findMany({
    where: { formId: id },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">{form.name}</h1>
      <p className="mt-1 font-mono text-xs text-muted">
        key: {form.key} · POST to /api/forms/submit/{form.key}
      </p>
      <FormDetail
        formId={form.id}
        formKey={form.key}
        formName={form.name}
        notifyEmail={form.notifyEmail}
        fields={form.fields as unknown as FormField[]}
        submissions={submissions.map((s) => ({
          ...s,
          data: s.data as Record<string, unknown>,
          createdAt: s.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
