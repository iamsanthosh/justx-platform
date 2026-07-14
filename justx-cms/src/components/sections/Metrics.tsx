import type { MetricsContent } from "@/types/content";

export default function Metrics({ content }: { content: MetricsContent }) {
  return (
    <section className="border-y border-border bg-off">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4">
        {content.items.map((item, i) => (
          <div key={i} className="text-center">
            <div className="font-display text-3xl text-ink md:text-4xl">{item.value}</div>
            <div className="mt-2 text-sm text-muted">{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
