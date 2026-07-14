import type { VisionContent } from "@/types/content";

export default function Vision({ content }: { content: VisionContent }) {
  return (
    <section className="bg-off">
      <div className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h2 className="font-display text-3xl text-ink md:text-4xl">{content.heading}</h2>
        <p className="mt-6 text-lg text-body">{content.body}</p>
      </div>
    </section>
  );
}
