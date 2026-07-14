import type { AiFeatureContent } from "@/types/content";

export default function AiFeature({ content }: { content: AiFeatureContent }) {
  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="font-display text-3xl text-ink md:text-4xl">{content.heading}</h2>
          <p className="mt-4 text-body">{content.body}</p>
        </div>
        {content.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={content.image}
            alt={content.heading}
            className="w-full rounded shadow-md"
          />
        )}
      </div>
    </section>
  );
}
