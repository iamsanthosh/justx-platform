import type { EcosystemContent } from "@/types/content";

export default function Ecosystem({ content }: { content: EcosystemContent }) {
  return (
    <section className="bg-ink text-white">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-3xl md:text-4xl">{content.heading}</h2>
        <div className="mt-10 flex flex-wrap gap-4">
          {content.technologies.map((tech, i) => (
            <span
              key={i}
              className="rounded-full border border-white/20 px-5 py-2 text-sm"
            >
              {tech.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
