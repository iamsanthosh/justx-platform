import { z } from "zod";

/**
 * Component registry: one Zod schema per SectionType.
 * This is the single source of truth for what a valid `Section.content`
 * JSON blob looks like for each type. The admin editor form and the
 * public renderer both import from here, so schema and rendering can
 * never drift apart.
 */

export const heroSchema = z.object({
  eyebrow: z.string().max(80).optional(),
  headline: z.string().min(1).max(200),
  subhead: z.string().max(500).optional(),
  primaryCtaLabel: z.string().max(60).optional(),
  primaryCtaHref: z.string().max(300).optional(),
  secondaryCtaLabel: z.string().max(60).optional(),
  secondaryCtaHref: z.string().max(300).optional(),
  images: z.array(z.string()).max(10).default([]),
});

export const metricSchema = z.object({
  value: z.string().max(20),
  label: z.string().max(80),
});
export const metricsSchema = z.object({
  items: z.array(metricSchema).max(8),
});

export const problemItemSchema = z.object({
  title: z.string().max(120),
  description: z.string().max(400),
  icon: z.string().max(60).optional(),
});
export const problemsSchema = z.object({
  heading: z.string().max(200),
  items: z.array(problemItemSchema).max(12),
});

export const serviceItemSchema = z.object({
  title: z.string().max(120),
  description: z.string().max(500),
  icon: z.string().max(60).optional(),
  href: z.string().max(300).optional(),
});
export const servicesSchema = z.object({
  heading: z.string().max(200),
  subheading: z.string().max(400).optional(),
  items: z.array(serviceItemSchema).max(20),
});

export const aiFeatureSchema = z.object({
  heading: z.string().max(200),
  body: z.string().max(1000),
  image: z.string().max(300).optional(),
});

export const ecosystemSchema = z.object({
  heading: z.string().max(200),
  technologies: z.array(z.object({ name: z.string().max(80), icon: z.string().max(60).optional() })).max(30),
});

export const visionSchema = z.object({
  heading: z.string().max(200),
  body: z.string().max(1000),
});

export const whyUsItemSchema = z.object({
  title: z.string().max(120),
  description: z.string().max(400),
});
export const whyUsSchema = z.object({
  heading: z.string().max(200),
  items: z.array(whyUsItemSchema).max(10),
});

export const deliveryStepSchema = z.object({
  step: z.string().max(10),
  title: z.string().max(120),
  description: z.string().max(400),
});
export const deliverySchema = z.object({
  heading: z.string().max(200),
  steps: z.array(deliveryStepSchema).max(10),
});

export const industriesSchema = z.object({
  heading: z.string().max(200),
  items: z.array(z.object({ name: z.string().max(80), icon: z.string().max(60).optional() })).max(30),
});

export const testimonialsSchema = z.object({
  heading: z.string().max(200).optional(),
  // References Testimonial rows by id; empty = show all enabled testimonials
  testimonialIds: z.array(z.string()).default([]),
});

export const galleryItemSchema = z.object({
  mediaId: z.string(),
  caption: z.string().max(200).optional(),
});
export const gallerySchema = z.object({
  heading: z.string().max(200).optional(),
  items: z.array(galleryItemSchema).max(50),
});

export const faqItemSchema = z.object({
  question: z.string().max(300),
  answer: z.string().max(2000),
});
export const faqSchema = z.object({
  heading: z.string().max(200).optional(),
  items: z.array(faqItemSchema).max(50),
});

export const ctaSchema = z.object({
  heading: z.string().max(200),
  body: z.string().max(500).optional(),
  buttonLabel: z.string().max(60),
  buttonHref: z.string().max(300),
});

export const contactSchema = z.object({
  heading: z.string().max(200),
  subheading: z.string().max(400).optional(),
  formKey: z.string().max(80).default("primary-contact"),
  email: z.string().email().optional(),
  phone: z.string().max(40).optional(),
  address: z.string().max(300).optional(),
});

export const footerLinkGroupSchema = z.object({
  heading: z.string().max(80),
  links: z.array(z.object({ label: z.string().max(80), href: z.string().max(300) })).max(20),
});
export const footerSchema = z.object({
  tagline: z.string().max(200).optional(),
  groups: z.array(footerLinkGroupSchema).max(6),
  socialLinks: z.array(z.object({ platform: z.string().max(40), href: z.string().max(300) })).max(10).default([]),
});

export const sectionSchemaByType = {
  HERO: heroSchema,
  METRICS: metricsSchema,
  PROBLEMS: problemsSchema,
  SERVICES: servicesSchema,
  AI_FEATURE: aiFeatureSchema,
  ECOSYSTEM: ecosystemSchema,
  VISION: visionSchema,
  WHY_US: whyUsSchema,
  DELIVERY: deliverySchema,
  INDUSTRIES: industriesSchema,
  TESTIMONIALS: testimonialsSchema,
  GALLERY: gallerySchema,
  FAQ: faqSchema,
  CTA: ctaSchema,
  CONTACT: contactSchema,
  FOOTER: footerSchema,
} as const;

export type SectionTypeKey = keyof typeof sectionSchemaByType;

/** Validates arbitrary JSON content against the schema for a given section type. */
export function validateSectionContent(type: SectionTypeKey, content: unknown) {
  return sectionSchemaByType[type].safeParse(content);
}

export const sectionUpsertSchema = z.object({
  pageId: z.string().min(1),
  type: z.enum([
    "HERO", "METRICS", "PROBLEMS", "SERVICES", "AI_FEATURE", "ECOSYSTEM",
    "VISION", "WHY_US", "DELIVERY", "INDUSTRIES", "TESTIMONIALS", "GALLERY",
    "FAQ", "CTA", "CONTACT", "FOOTER",
  ]),
  content: z.record(z.any()),
  order: z.number().int().min(0).default(0),
  enabled: z.boolean().default(true),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});
