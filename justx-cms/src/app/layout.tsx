import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "JustX Systems | AI-First Technology & Business Transformation",
    template: "%s | JustX Systems",
  },
  description:
    "JustX Systems is an AI-first technology and business transformation company building intelligent automation, enterprise software, and digital products.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-off font-sans text-body antialiased">{children}</body>
    </html>
  );
}
