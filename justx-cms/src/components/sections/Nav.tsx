"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu as MenuIcon, X } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
}

export default function Nav({ items, logoUrl }: { items: NavItem[]; logoUrl?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-display text-lg text-white">
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="JustX Systems" className="h-8 w-8" />
          )}
          JustX Systems
        </Link>

        <ul className="hidden gap-8 md:flex">
          {items.map((item, i) => (
            <li key={i}>
              <Link href={item.href} className="text-sm text-white/80 hover:text-white">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <button
          className="text-white md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <MenuIcon size={22} />}
        </button>
      </nav>

      {open && (
        <ul className="space-y-1 border-t border-white/10 px-6 py-4 md:hidden">
          {items.map((item, i) => (
            <li key={i}>
              <Link
                href={item.href}
                className="block py-2 text-sm text-white/80"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
