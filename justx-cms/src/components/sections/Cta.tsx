import Link from "next/link";
import type { CtaContent } from "@/types/content";

export default function Cta({ content }: { content: CtaContent }) {
  return (
    <section className="bg-cyan">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-16 text-center">
        <h2 className="font-display text-3xl text-ink md:text-4xl">{content.heading}</h2>
        {content.body && <p className="max-w-xl text-ink/80">{content.body}</p>}
        <Link
          href={content.buttonHref}
          className="rounded bg-ink px-8 py-3 font-medium text-white transition hover:opacity-90"
        >
          {content.buttonLabel}
        </Link>
      </div>
    </section>
  );
}
