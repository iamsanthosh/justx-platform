// Mirrors src/lib/validation/sections.ts. Kept as plain interfaces (not
// z.infer) so components can import types without pulling in Zod on
// the client bundle.

export interface HeroContent {
  eyebrow?: string;
  headline: string;
  subhead?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  images: string[];
}

export interface MetricItem {
  value: string;
  label: string;
}
export interface MetricsContent {
  items: MetricItem[];
}

export interface ProblemItem {
  title: string;
  description: string;
  icon?: string;
}
export interface ProblemsContent {
  heading: string;
  items: ProblemItem[];
}

export interface ServiceItem {
  title: string;
  description: string;
  icon?: string;
  href?: string;
}
export interface ServicesContent {
  heading: string;
  subheading?: string;
  items: ServiceItem[];
}

export interface AiFeatureContent {
  heading: string;
  body: string;
  image?: string;
}

export interface TechItem {
  name: string;
  icon?: string;
}
export interface EcosystemContent {
  heading: string;
  technologies: TechItem[];
}

export interface VisionContent {
  heading: string;
  body: string;
}

export interface WhyUsItem {
  title: string;
  description: string;
}
export interface WhyUsContent {
  heading: string;
  items: WhyUsItem[];
}

export interface DeliveryStep {
  step: string;
  title: string;
  description: string;
}
export interface DeliveryContent {
  heading: string;
  steps: DeliveryStep[];
}

export interface IndustryItem {
  name: string;
  icon?: string;
}
export interface IndustriesContent {
  heading: string;
  items: IndustryItem[];
}

export interface TestimonialsContent {
  heading?: string;
  testimonialIds: string[];
}

export interface GalleryItem {
  mediaId: string;
  caption?: string;
}
export interface GalleryContent {
  heading?: string;
  items: GalleryItem[];
}

export interface FaqItem {
  question: string;
  answer: string;
}
export interface FaqContent {
  heading?: string;
  items: FaqItem[];
}

export interface CtaContent {
  heading: string;
  body?: string;
  buttonLabel: string;
  buttonHref: string;
}

export interface ContactContent {
  heading: string;
  subheading?: string;
  formKey: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface FooterLinkGroup {
  heading: string;
  links: { label: string; href: string }[];
}
export interface FooterContent {
  tagline?: string;
  groups: FooterLinkGroup[];
  socialLinks: { platform: string; href: string }[];
}

export type SectionType =
  | "HERO"
  | "METRICS"
  | "PROBLEMS"
  | "SERVICES"
  | "AI_FEATURE"
  | "ECOSYSTEM"
  | "VISION"
  | "WHY_US"
  | "DELIVERY"
  | "INDUSTRIES"
  | "TESTIMONIALS"
  | "GALLERY"
  | "FAQ"
  | "CTA"
  | "CONTACT"
  | "FOOTER";

/** A rendered/DB-shaped section: type + validated content + display state. */
export interface SectionRecord {
  id: string;
  pageId: string;
  type: SectionType;
  order: number;
  enabled: boolean;
  status: "DRAFT" | "PUBLISHED";
  // Content shape depends on `type`; narrowed by the renderer/editor.
  content: Record<string, unknown>;
}

export interface PageRecord {
  id: string;
  slug: string;
  title: string;
  metaTitle?: string | null;
  metaDesc?: string | null;
  status: "DRAFT" | "PUBLISHED";
  sections: SectionRecord[];
}
