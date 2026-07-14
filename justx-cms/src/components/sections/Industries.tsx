import type { IndustriesContent } from "@/types/content";

export default function Industries({ content }: { content: IndustriesContent }) {
  return (
    <section className="overflow-hidden bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-3xl text-ink md:text-4xl">{content.heading}</h2>
        <div className="mt-10 flex flex-wrap justify-center gap-6">
          {content.items.map((item, i) => (
            <span
              key={i}
              className="rounded border border-border px-6 py-3 text-sm font-medium text-ink"
            >
              {item.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
