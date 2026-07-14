import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildSubmissionSchema, type FormField } from "@/lib/validation/forms";
import { rateLimit, clientIpFromHeaders } from "@/lib/rateLimit";
import { sendMail } from "@/lib/mail";
import { logger } from "@/lib/logger";

interface Params {
  params: Promise<{ key: string }>;
}

export async function POST(req: NextRequest, { params }: Params) {
  const { key } = await params;
  const ip = clientIpFromHeaders(req.headers);

  const limit = rateLimit(`form-submit:${ip}`, 10, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const form = await prisma.formDef.findUnique({ where: { key } });
  if (!form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const fields = form.fields as unknown as FormField[];
  const schema = buildSubmissionSchema(fields);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { website, ...data } = parsed.data as Record<string, unknown> & { website?: string };
  if (website) {
    // Honeypot tripped — pretend success, don't store or notify.
    return NextResponse.json({ ok: true });
  }

  const submission = await prisma.formSubmission.create({
    data: { formId: form.id, data, ipAddress: ip },
  });

  const notifyTo = form.notifyEmail || undefined;
  if (notifyTo) {
    try {
      await sendMail({
        to: notifyTo,
        subject: `New submission: ${form.name}`,
        text: Object.entries(data)
          .map(([k, v]) => `${k}: ${v}`)
          .join("\n"),
      });
    } catch (err) {
      logger.error("Form submission notification email failed", { error: String(err) });
    }
  }

  return NextResponse.json({ ok: true, id: submission.id });
}
