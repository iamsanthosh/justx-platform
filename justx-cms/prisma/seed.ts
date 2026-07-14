import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding roles...");
  const superAdminRole = await prisma.role.upsert({
    where: { name: "SUPER_ADMIN" },
    update: {},
    create: {
      name: "SUPER_ADMIN",
      description: "Full access to every module.",
      permissions: ["*"],
    },
  });

  await prisma.role.upsert({
    where: { name: "EDITOR" },
    update: {},
    create: {
      name: "EDITOR",
      description: "Can manage pages, sections, media, and enquiries.",
      permissions: [
        "pages:read",
        "pages:write",
        "sections:read",
        "sections:write",
        "media:read",
        "media:write",
        "enquiries:read",
      ],
    },
  });

  await prisma.role.upsert({
    where: { name: "VIEWER" },
    update: {},
    create: {
      name: "VIEWER",
      description: "Read-only access.",
      permissions: ["pages:read", "sections:read", "enquiries:read"],
    },
  });

  console.log("Seeding admin user...");
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@justxsystems.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "ChangeMe!12345";
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "JustX Admin",
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      roleId: superAdminRole.id,
    },
  });
  console.log(`   -> ${adminEmail} / ${adminPassword} (CHANGE THIS AFTER FIRST LOGIN)`);

  console.log("Seeding primary navigation...");
  const nav = await prisma.menu.upsert({
    where: { key: "primary-nav" },
    update: {},
    create: { key: "primary-nav", label: "Primary Navigation" },
  });
  const navItems = [
    { label: "Services", href: "/#services", order: 0 },
    { label: "Industries", href: "/#industries", order: 1 },
    { label: "About", href: "/about", order: 2 },
    { label: "Careers", href: "/careers", order: 3 },
    { label: "Contact", href: "/#contact", order: 4 },
  ];
  for (const item of navItems) {
    const existing = await prisma.menuItem.findFirst({
      where: { menuId: nav.id, label: item.label },
    });
    if (!existing) {
      await prisma.menuItem.create({ data: { ...item, menuId: nav.id } });
    }
  }

  console.log("Seeding home page + sections...");
  const home = await prisma.page.upsert({
    where: { slug: "" },
    update: {},
    create: {
      slug: "",
      title: "Home",
      metaTitle: "JustX Systems | AI-First Technology & Business Transformation",
      metaDesc:
        "JustX Systems partners with ambitious businesses to design, build, and scale AI-powered digital products, enterprise software, and automation.",
      status: "PUBLISHED",
    },
  });

  const existingSections = await prisma.section.count({ where: { pageId: home.id } });
  if (existingSections === 0) {
    type SeedSectionType =
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
    const sections: { type: SeedSectionType; content: Record<string, unknown> }[] = [
      {
        type: "HERO",
        content: {
          eyebrow: "Innovate · Integrate · Inspire",
          headline: "Engineering the next generation of intelligent digital business.",
          subhead:
            "JustX Systems is a strategic technology partner helping enterprises modernize their digital presence, automate operations, and adopt AI where it genuinely moves the needle.",
          primaryCtaLabel: "Start a project",
          primaryCtaHref: "/#contact",
          secondaryCtaLabel: "Explore services",
          secondaryCtaHref: "/#services",
          images: [],
        },
      },
      {
        type: "METRICS",
        content: {
          items: [
            { value: "20+", label: "Years combined engineering experience" },
            { value: "500+", label: "Person-hours delivered per engagement" },
            { value: "95+", label: "Target Lighthouse performance score" },
            { value: "100%", label: "In-house delivery, no outsourcing" },
          ],
        },
      },
      {
        type: "PROBLEMS",
        content: {
          heading: "The problems we solve",
          items: [
            {
              title: "Outdated digital presence",
              description:
                "Legacy websites that don't reflect the scale or ambition of the business behind them.",
            },
            {
              title: "Manual, disconnected operations",
              description:
                "Field teams, inventory, and service workflows still running on spreadsheets and phone calls.",
            },
            {
              title: "No single source of truth",
              description:
                "Leadership lacking real-time visibility into AMC status, engineer utilization, or pipeline health.",
            },
          ],
        },
      },
      {
        type: "SERVICES",
        content: {
          heading: "What we do",
          subheading: "End-to-end digital transformation, from strategy to shipped product.",
          items: [
            {
              title: "Website & Digital Presence",
              description:
                "Modern, fast, CMS-driven corporate websites built on JAMstack architecture.",
            },
            {
              title: "SEO & Growth",
              description:
                "Technical SEO, structured data, and local search strategy tied to measurable outcomes.",
            },
            {
              title: "Business Operations Portals",
              description:
                "Custom platforms for AMC management, field engineer workflows, inventory, and analytics.",
            },
            {
              title: "AI & Automation",
              description:
                "Practical AI integration — where it reduces real operational cost, not as a buzzword.",
            },
          ],
        },
      },
      {
        type: "ECOSYSTEM",
        content: {
          heading: "Our technology ecosystem",
          technologies: [
            { name: "Next.js" },
            { name: "TypeScript" },
            { name: "Prisma" },
            { name: "MySQL" },
            { name: "Tailwind CSS" },
            { name: "Node.js" },
          ],
        },
      },
      {
        type: "WHY_US",
        content: {
          heading: "Why JustX",
          items: [
            {
              title: "Consultative, not transactional",
              description: "We diagnose the actual business problem before proposing a build.",
            },
            {
              title: "Senior engineering throughout",
              description: "No junior hand-offs — the people who scope it also build it.",
            },
            {
              title: "Built for extensibility",
              description: "Every platform we ship is designed for the next module, not just v1.",
            },
            {
              title: "Transparent delivery",
              description: "Milestone-based delivery with full visibility into scope and cost.",
            },
          ],
        },
      },
      {
        type: "DELIVERY",
        content: {
          heading: "How we deliver",
          steps: [
            { step: "01", title: "Discover", description: "Understand goals, constraints, and success metrics." },
            { step: "02", title: "Design", description: "Architecture, UX, and a milestone roadmap." },
            { step: "03", title: "Build", description: "Iterative delivery, one complete milestone at a time." },
            { step: "04", title: "Scale", description: "Handoff, documentation, and ongoing evolution." },
          ],
        },
      },
      {
        type: "INDUSTRIES",
        content: {
          heading: "Industries we serve",
          items: [
            { name: "Energy & Power" },
            { name: "Manufacturing" },
            { name: "Professional Services" },
            { name: "Technology" },
            { name: "Logistics" },
          ],
        },
      },
      {
        type: "CTA",
        content: {
          heading: "Ready to modernize your digital operations?",
          body: "Let's talk about where JustX Systems can help your business move faster.",
          buttonLabel: "Get in touch",
          buttonHref: "/#contact",
        },
      },
      {
        type: "CONTACT",
        content: {
          heading: "Get in touch",
          subheading: "Tell us about your project — we'll follow up within one business day.",
          formKey: "primary-contact",
          email: "hello@justxsystems.com",
        },
      },
      {
        type: "FOOTER",
        content: {
          tagline: "Innovate · Integrate · Inspire",
          groups: [
            {
              heading: "Company",
              links: [
                { label: "About", href: "/about" },
                { label: "Careers", href: "/careers" },
              ],
            },
            {
              heading: "Legal",
              links: [
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms", href: "/terms" },
              ],
            },
          ],
          socialLinks: [],
        },
      },
    ];

    for (const [i, section] of sections.entries()) {
      await prisma.section.create({
        data: {
          pageId: home.id,
          type: section.type,
          content: section.content,
          order: i,
          enabled: true,
          status: "PUBLISHED",
        },
      });
    }
  }

  console.log("Seeding remaining static pages (draft shells)...");
  const otherPages = [
    { slug: "about", title: "About" },
    { slug: "services", title: "Services" },
    { slug: "solutions", title: "Solutions" },
    { slug: "industries", title: "Industries" },
    { slug: "technologies", title: "Technologies" },
    { slug: "careers", title: "Careers" },
    { slug: "privacy", title: "Privacy Policy" },
    { slug: "terms", title: "Terms" },
  ];
  for (const p of otherPages) {
    await prisma.page.upsert({
      where: { slug: p.slug },
      update: {},
      create: { slug: p.slug, title: p.title, status: "DRAFT" },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
