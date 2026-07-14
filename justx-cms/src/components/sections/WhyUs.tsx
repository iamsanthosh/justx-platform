import type { WhyUsContent } from "@/types/content";

export default function WhyUs({ content }: { content: WhyUsContent }) {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-3xl text-ink md:text-4xl">{content.heading}</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {content.items.map((item, i) => (
            <div key={i} className="flex gap-4">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-cyan" />
              <div>
                <h3 className="font-medium text-ink">{item.title}</h3>
                <p className="mt-1 text-sm text-body">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
