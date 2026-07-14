import type { FaqContent } from "@/types/content";

export default function Faq({ content }: { content: FaqContent }) {
  return (
    <section className="bg-off">
      <div className="mx-auto max-w-3xl px-6 py-20">
        {content.heading && (
          <h2 className="font-display text-3xl text-ink md:text-4xl">{content.heading}</h2>
        )}
        <div className="mt-10 divide-y divide-border">
          {content.items.map((item, i) => (
            <details key={i} className="group py-4">
              <summary className="cursor-pointer list-none font-medium text-ink">
                {item.question}
              </summary>
              <p className="mt-3 text-sm text-body">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
