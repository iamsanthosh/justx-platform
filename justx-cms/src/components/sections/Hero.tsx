import Link from "next/link";
import type { HeroContent } from "@/types/content";

export default function Hero({ content }: { content: HeroContent }) {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        {content.eyebrow && (
          <span className="inline-block rounded-full bg-white/10 px-4 py-1 text-sm tracking-wide">
            {content.eyebrow}
          </span>
        )}
        <h1 className="mt-6 max-w-3xl font-display text-4xl leading-tight md:text-6xl">
          {content.headline}
        </h1>
        {content.subhead && (
          <p className="mt-6 max-w-xl text-lg text-white/80">{content.subhead}</p>
        )}
        <div className="mt-10 flex flex-wrap gap-4">
          {content.primaryCtaLabel && content.primaryCtaHref && (
            <Link
              href={content.primaryCtaHref}
              className="rounded bg-cyan px-6 py-3 font-medium text-ink transition hover:opacity-90"
            >
              {content.primaryCtaLabel}
            </Link>
          )}
          {content.secondaryCtaLabel && content.secondaryCtaHref && (
            <Link
              href={content.secondaryCtaHref}
              className="rounded border border-white/30 px-6 py-3 font-medium text-white transition hover:bg-white/10"
            >
              {content.secondaryCtaLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
