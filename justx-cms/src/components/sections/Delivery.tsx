import type { DeliveryContent } from "@/types/content";

export default function Delivery({ content }: { content: DeliveryContent }) {
  return (
    <section className="bg-off">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-3xl text-ink md:text-4xl">{content.heading}</h2>
        <ol className="mt-12 grid gap-8 md:grid-cols-4">
          {content.steps.map((step, i) => (
            <li key={i} className="rounded border border-border bg-white p-6">
              <span className="font-display text-2xl text-cyan">{step.step}</span>
              <h3 className="mt-2 font-medium text-ink">{step.title}</h3>
              <p className="mt-2 text-sm text-body">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
