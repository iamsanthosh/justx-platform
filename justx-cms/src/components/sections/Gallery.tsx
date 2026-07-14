export interface ResolvedGalleryItem {
  mediaId: string;
  url: string;
  altText?: string | null;
  caption?: string;
}

export default function Gallery({
  heading,
  items,
}: {
  heading?: string;
  items: ResolvedGalleryItem[];
}) {
  if (items.length === 0) return null;
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20">
        {heading && (
          <h2 className="font-display text-3xl text-ink md:text-4xl">{heading}</h2>
        )}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {items.map((item) => (
            <figure key={item.mediaId} className="overflow-hidden rounded">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={item.altText || item.caption || ""}
                className="h-56 w-full object-cover"
              />
              {item.caption && (
                <figcaption className="mt-2 text-sm text-muted">{item.caption}</figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
