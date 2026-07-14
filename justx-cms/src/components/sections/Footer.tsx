import Link from "next/link";
import type { FooterContent } from "@/types/content";

export default function Footer({ content }: { content: FooterContent }) {
  return (
    <footer className="bg-ink text-white/70">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <span className="font-display text-xl text-white">JustX Systems</span>
            {content.tagline && <p className="mt-3 text-sm">{content.tagline}</p>}
          </div>
          {content.groups.map((group, i) => (
            <div key={i}>
              <h4 className="text-sm font-medium text-white">{group.heading}</h4>
              <ul className="mt-3 space-y-2 text-sm">
                {group.links.map((link, j) => (
                  <li key={j}>
                    <Link href={link.href} className="hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs">
          <span>&copy; {new Date().getFullYear()} JustX Systems. All rights reserved.</span>
          <div className="flex gap-4">
            {content.socialLinks.map((s, i) => (
              <Link key={i} href={s.href} className="hover:text-white">
                {s.platform}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
