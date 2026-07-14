import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enquirySchema } from "@/lib/validation/enquiry";
import { rateLimit, clientIpFromHeaders } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";
import { sendMail } from "@/lib/mail";
import { requirePermission } from "@/lib/rbac";

export async function POST(req: NextRequest) {
  const ip = clientIpFromHeaders(req.headers);
  const limit = rateLimit(`enquiry:${ip}`, 10, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { website, ...data } = parsed.data;
  // Honeypot: a filled-in "website" field means it was almost certainly a bot.
  if (website) {
    return NextResponse.json({ ok: true });
  }

  const enquiry = await prisma.enquiry.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      company: data.company || null,
      message: data.message,
      ipAddress: ip,
    },
  });

  try {
    await sendMail({
      subject: `New enquiry from ${data.name}`,
      text: `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone ?? "-"}\nCompany: ${
        data.company ?? "-"
      }\n\n${data.message}`,
    });
  } catch (err) {
    // Don't fail the request if email delivery has an issue — the
    // enquiry is already safely stored in the database.
    logger.error("Enquiry notification email failed", { error: String(err) });
  }

  return NextResponse.json({ ok: true, id: enquiry.id });
}

/** Admin: list enquiries with basic pagination + status filter. */
export async function GET(req: NextRequest) {
  const auth = await requirePermission("enquiries:read");
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status") || undefined;
  const status = statusParam as
    | "NEW"
    | "IN_PROGRESS"
    | "RESOLVED"
    | "SPAM"
    | undefined;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = 20;

  const [items, total] = await Promise.all([
    prisma.enquiry.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.enquiry.count({ where: status ? { status } : undefined }),
  ]);

  return NextResponse.json({ items, total, page, pageSize });
}
