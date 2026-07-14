import { prisma } from "@/lib/prisma";
import { requirePagePermission } from "@/lib/rbac";
import FormsList from "./FormsList";

interface FormRow {
  id: string;
  key: string;
  name: string;
  _count: { submissions: number };
}

export default async function FormsPage() {
  await requirePagePermission("forms:read");

  const forms: FormRow[] = await prisma.formDef.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { submissions: true } } },
  });

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Forms</h1>
      <p className="mt-1 text-sm text-muted">
        Each form has its own key, field set, and submission inbox. Embed a form on the site
        by posting to <code className="text-xs">/api/forms/submit/&lt;key&gt;</code>.
      </p>
      <FormsList initialForms={forms} />
    </div>
  );
}
