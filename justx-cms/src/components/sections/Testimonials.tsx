export interface ResolvedTestimonial {
  id: string;
  author: string;
  role?: string | null;
  company?: string | null;
  quote: string;
  avatarUrl?: string | null;
}

export default function Testimonials({
  heading,
  items,
}: {
  heading?: string;
  items: ResolvedTestimonial[];
}) {
  if (items.length === 0) return null;
  return (
    <section className="bg-off">
      <div className="mx-auto max-w-6xl px-6 py-20">
        {heading && (
          <h2 className="font-display text-3xl text-ink md:text-4xl">{heading}</h2>
        )}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {items.map((t) => (
            <blockquote key={t.id} className="rounded bg-white p-6 shadow-sm">
              <p className="text-body">&ldquo;{t.quote}&rdquo;</p>
              <footer className="mt-4 text-sm font-medium text-ink">
                {t.author}
                {t.role && <span className="text-muted"> &middot; {t.role}</span>}
                {t.company && <span className="text-muted"> &middot; {t.company}</span>}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
