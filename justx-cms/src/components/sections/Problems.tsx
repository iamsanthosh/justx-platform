import type { ProblemsContent } from "@/types/content";

export default function Problems({ content }: { content: ProblemsContent }) {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-3xl text-ink md:text-4xl">{content.heading}</h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {content.items.map((item, i) => (
            <div key={i} className="rounded border border-border p-6 shadow-sm">
              <h3 className="font-medium text-ink">{item.title}</h3>
              <p className="mt-2 text-sm text-body">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
