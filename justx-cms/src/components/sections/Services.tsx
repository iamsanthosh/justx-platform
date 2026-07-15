import Link from "next/link";
import type { ServicesContent } from "@/types/content";

export default function Services({ content }: { content: ServicesContent }) {
  return (
    <section id="services" className="bg-off">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-3xl text-ink md:text-4xl">{content.heading}</h2>
        {content.subheading && (
          <p className="mt-4 max-w-2xl text-body">{content.subheading}</p>
        )}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {content.items.map((item, i) => {
            const Card = (
              <div className="h-full overflow-hidden rounded bg-white shadow-sm transition hover:shadow-md">
                {item.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-40 w-full object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="font-medium text-ink">{item.title}</h3>
                  <p className="mt-2 text-sm text-body">{item.description}</p>
                </div>
              </div>
            );
            return item.href ? (
              <Link key={i} href={item.href}>
                {Card}
              </Link>
            ) : (
              <div key={i}>{Card}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
