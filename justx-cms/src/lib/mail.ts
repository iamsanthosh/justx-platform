import nodemailer from "nodemailer";

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      "SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env"
    );
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}

export async function sendMail(opts: { subject: string; text: string; to?: string }) {
  const to = opts.to || process.env.ENQUIRY_NOTIFY_EMAIL;
  if (!to) {
    throw new Error("No recipient configured (ENQUIRY_NOTIFY_EMAIL)");
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await getTransporter().sendMail({
    from,
    to,
    subject: opts.subject,
    text: opts.text,
  });
}
