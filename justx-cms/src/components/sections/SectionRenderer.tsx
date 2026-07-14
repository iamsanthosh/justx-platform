import type {
  SectionRecord,
  HeroContent,
  MetricsContent,
  ProblemsContent,
  ServicesContent,
  AiFeatureContent,
  EcosystemContent,
  VisionContent,
  WhyUsContent,
  DeliveryContent,
  IndustriesContent,
  FaqContent,
  CtaContent,
  ContactContent,
  FooterContent,
} from "@/types/content";
import { resolveTestimonials, resolveMedia } from "@/lib/data/pages";

import Hero from "./Hero";
import Metrics from "./Metrics";
import Problems from "./Problems";
import Services from "./Services";
import AiFeature from "./AiFeature";
import Ecosystem from "./Ecosystem";
import Vision from "./Vision";
import WhyUs from "./WhyUs";
import Delivery from "./Delivery";
import Industries from "./Industries";
import Testimonials from "./Testimonials";
import Gallery, { type ResolvedGalleryItem } from "./Gallery";
import Faq from "./Faq";
import Cta from "./Cta";
import Contact from "./Contact";
import Footer from "./Footer";

/**
 * Component registry: the single source of truth mapping a Section.type
 * (see prisma/schema.prisma SectionType enum) to its renderer.
 * Adding a new section type = add a schema entry (validation/sections.ts)
 * + a component + a case here.
 */
export default async function SectionRenderer({ section }: { section: SectionRecord }) {
  switch (section.type) {
    case "HERO":
      return <Hero content={section.content as unknown as HeroContent} />;
    case "METRICS":
      return <Metrics content={section.content as unknown as MetricsContent} />;
    case "PROBLEMS":
      return <Problems content={section.content as unknown as ProblemsContent} />;
    case "SERVICES":
      return <Services content={section.content as unknown as ServicesContent} />;
    case "AI_FEATURE":
      return <AiFeature content={section.content as unknown as AiFeatureContent} />;
    case "ECOSYSTEM":
      return <Ecosystem content={section.content as unknown as EcosystemContent} />;
    case "VISION":
      return <Vision content={section.content as unknown as VisionContent} />;
    case "WHY_US":
      return <WhyUs content={section.content as unknown as WhyUsContent} />;
    case "DELIVERY":
      return <Delivery content={section.content as unknown as DeliveryContent} />;
    case "INDUSTRIES":
      return <Industries content={section.content as unknown as IndustriesContent} />;

    case "TESTIMONIALS": {
      const content = section.content as { heading?: string; testimonialIds: string[] };
      const rows = await resolveTestimonials(content.testimonialIds ?? []);
      return <Testimonials heading={content.heading} items={rows} />;
    }

    case "GALLERY": {
      const content = section.content as {
        heading?: string;
        items: { mediaId: string; caption?: string }[];
      };
      const mediaIds = (content.items ?? []).map((i) => i.mediaId);
      const media = await resolveMedia(mediaIds);
      const byId = new Map(media.map((m) => [m.id, m]));
      const resolved: ResolvedGalleryItem[] = [];
      for (const item of content.items ?? []) {
        const m = byId.get(item.mediaId);
        if (!m) continue;
        resolved.push({
          mediaId: item.mediaId,
          url: m.url,
          altText: m.altText,
          caption: item.caption,
        });
      }
      return <Gallery heading={content.heading} items={resolved} />;
    }

    case "FAQ":
      return <Faq content={section.content as unknown as FaqContent} />;
    case "CTA":
      return <Cta content={section.content as unknown as CtaContent} />;
    case "CONTACT":
      return <Contact content={section.content as unknown as ContactContent} />;
    case "FOOTER":
      return <Footer content={section.content as unknown as FooterContent} />;

    default:
      return null;
  }
}
