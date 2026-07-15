import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

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
        "menus:read",
        "menus:write",
        "content:read",
        "content:write",
        "forms:read",
        "forms:write",
        "enquiries:read",
        "enquiries:write",
        "settings:read",
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

  console.log("Seeding site settings (logo)...");
  await prisma.setting.upsert({
    where: { key: "logoUrl" },
    update: {},
    create: { key: "logoUrl", value: "/uploads/seed/logo.png" },
  });

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
          images: [
            "/uploads/seed/hero-1.jpg",
            "/uploads/seed/hero-2.jpg",
            "/uploads/seed/hero-3.jpg",
          ],
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
              image:
                "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80&auto=format&fit=crop",
            },
            {
              title: "SEO & Growth",
              description:
                "Technical SEO, structured data, and local search strategy tied to measurable outcomes.",
              image:
                "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80&auto=format&fit=crop",
            },
            {
              title: "Business Operations Portals",
              description:
                "Custom platforms for AMC management, field engineer workflows, inventory, and analytics.",
              image:
                "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80&auto=format&fit=crop",
            },
            {
              title: "AI & Automation",
              description:
                "Practical AI integration — where it reduces real operational cost, not as a buzzword.",
              image:
                "https://images.unsplash.com/photo-1618172193622-ae2d025f4032?w=1200&q=80&auto=format&fit=crop",
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

  console.log("Seeding careers application form...");
  const careersForm = await prisma.formDef.upsert({
    where: { key: "careers-application" },
    update: {},
    create: {
      key: "careers-application",
      name: "Careers Application",
      notifyEmail: "careers@justxsystems.com",
      fields: [
        { name: "fullName", label: "Full name", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "phone", label: "Phone", type: "tel", required: false },
        {
          name: "role",
          label: "Role you're applying for",
          type: "select",
          required: true,
          options: ["Software Engineer", "Product Designer", "Solutions Consultant", "Other"],
        },
        { name: "portfolioUrl", label: "Portfolio / LinkedIn URL", type: "text", required: false },
        { name: "message", label: "Tell us about yourself", type: "textarea", required: true },
      ],
    },
  });

  console.log("Seeding remaining static pages with real content...");

  async function seedPage(
    slug: string,
    title: string,
    metaDesc: string,
    sections: { type: SeedSectionType; content: Record<string, unknown> }[]
  ) {
    const page = await prisma.page.upsert({
      where: { slug },
      update: {},
      create: { slug, title, metaTitle: `${title} | JustX Systems`, metaDesc, status: "PUBLISHED" },
    });
    const count = await prisma.section.count({ where: { pageId: page.id } });
    if (count === 0) {
      for (const [i, section] of sections.entries()) {
        await prisma.section.create({
          data: {
            pageId: page.id,
            type: section.type,
            content: section.content,
            order: i,
            enabled: true,
            status: "PUBLISHED",
          },
        });
      }
    }
  }

  await seedPage(
    "about",
    "About",
    "JustX Systems is an AI-first technology and business transformation company partnering with ambitious enterprises.",
    [
      {
        type: "HERO",
        content: {
          eyebrow: "About JustX Systems",
          headline: "A strategic technology partner, not just a vendor.",
          subhead:
            "We're a small team of senior engineers and designers who partner closely with a handful of clients at a time, rather than spreading thin across dozens of accounts.",
          images: [],
        },
      },
      {
        type: "VISION",
        content: {
          heading: "Our vision",
          body: "We believe most businesses don't need more software — they need the right software, built by people who take the time to understand the actual problem first. JustX Systems exists to be that kind of partner: consultative, senior-led, and honest about what a project really needs.",
        },
      },
      {
        type: "WHY_US",
        content: {
          heading: "How we work",
          items: [
            { title: "Small, senior team", description: "No junior hand-offs. The people who scope your project also build it." },
            { title: "Milestone-based delivery", description: "You see and approve working software at every stage, not just at the end." },
            { title: "Built for what's next", description: "Every platform is architected so the next phase doesn't require a rewrite." },
            { title: "Transparent about tradeoffs", description: "If a request will overcomplicate your system, we'll tell you before we build it." },
          ],
        },
      },
      {
        type: "CTA",
        content: {
          heading: "Want to work with us?",
          buttonLabel: "Get in touch",
          buttonHref: "/#contact",
        },
      },
    ]
  );

  await seedPage(
    "services",
    "Services",
    "Website & digital presence, SEO & growth, business operations portals, and practical AI & automation.",
    [
      {
        type: "HERO",
        content: {
          eyebrow: "Services",
          headline: "End-to-end delivery, from strategy to shipped product.",
          images: [],
        },
      },
      {
        type: "SERVICES",
        content: {
          heading: "What we do",
          items: [
            { title: "Website & Digital Presence", description: "Modern, fast, CMS-driven corporate websites built on JAMstack architecture." },
            { title: "SEO & Growth", description: "Technical SEO, structured data, and local search strategy tied to measurable outcomes." },
            { title: "Business Operations Portals", description: "Custom platforms for AMC management, field engineer workflows, inventory, and analytics." },
            { title: "AI & Automation", description: "Practical AI integration — where it reduces real operational cost, not as a buzzword." },
          ],
        },
      },
      {
        type: "DELIVERY",
        content: {
          heading: "How an engagement runs",
          steps: [
            { step: "01", title: "Discover", description: "Understand goals, constraints, and success metrics." },
            { step: "02", title: "Design", description: "Architecture, UX, and a milestone roadmap." },
            { step: "03", title: "Build", description: "Iterative delivery, one complete milestone at a time." },
            { step: "04", title: "Scale", description: "Handoff, documentation, and ongoing evolution." },
          ],
        },
      },
      {
        type: "CTA",
        content: { heading: "Have a project in mind?", buttonLabel: "Start a conversation", buttonHref: "/#contact" },
      },
    ]
  );

  await seedPage(
    "solutions",
    "Solutions",
    "Purpose-built solutions for common operational bottlenecks: AMC management, field service, and internal portals.",
    [
      {
        type: "HERO",
        content: { eyebrow: "Solutions", headline: "Purpose-built platforms for how you actually operate.", images: [] },
      },
      {
        type: "PROBLEMS",
        content: {
          heading: "Common problems we solve",
          items: [
            { title: "AMC & service contract tracking", description: "Contracts, renewal dates, and site visits scattered across spreadsheets." },
            { title: "Field engineer coordination", description: "No real-time visibility into who's where, working on what." },
            { title: "Inventory & spares", description: "Manual stock checks across multiple sites or warehouses." },
          ],
        },
      },
      {
        type: "CTA",
        content: { heading: "Tell us about your operational bottleneck", buttonLabel: "Talk to us", buttonHref: "/#contact" },
      },
    ]
  );

  await seedPage(
    "industries",
    "Industries",
    "JustX Systems works across energy & power, manufacturing, professional services, technology, and logistics.",
    [
      {
        type: "HERO",
        content: { eyebrow: "Industries", headline: "Domain-aware delivery across the sectors we know best.", images: [] },
      },
      {
        type: "INDUSTRIES",
        content: {
          heading: "Where we've delivered",
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
        content: { heading: "Don't see your industry?", body: "We're always happy to talk — domain expertise grows with every engagement.", buttonLabel: "Get in touch", buttonHref: "/#contact" },
      },
    ]
  );

  await seedPage(
    "technologies",
    "Technologies",
    "The technology stack JustX Systems builds with: Next.js, TypeScript, Prisma, MySQL, Tailwind CSS, and Node.js.",
    [
      {
        type: "HERO",
        content: { eyebrow: "Technologies", headline: "A deliberately small, battle-tested stack.", images: [] },
      },
      {
        type: "ECOSYSTEM",
        content: {
          heading: "What we build with",
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
        type: "VISION",
        content: {
          heading: "Why we keep the stack small",
          body: "Every additional technology is another thing that can break, another skill your future team needs, and another line item in hosting costs. We choose boring, well-supported tools on purpose, so what we build for you stays maintainable long after we hand it off.",
        },
      },
    ]
  );

  await seedPage(
    "careers",
    "Careers",
    "Join JustX Systems — a small, senior team building AI-first technology and business transformation platforms.",
    [
      {
        type: "HERO",
        content: {
          eyebrow: "Careers",
          headline: "Work on real problems, with a small senior team.",
          subhead: "We're not hiring at scale — we're looking for a few people who want ownership over what they build.",
          images: [],
        },
      },
      {
        type: "WHY_US",
        content: {
          heading: "Why JustX",
          items: [
            { title: "Direct client exposure", description: "You'll talk to the people using what you build, not just a project manager." },
            { title: "No bureaucracy", description: "Small team, fast decisions, no multi-layer approval chains." },
            { title: "Ownership", description: "You scope it, you build it, you see it through to production." },
          ],
        },
      },
      {
        type: "CONTACT",
        content: {
          heading: "Apply",
          subheading: "Tell us a bit about yourself and the role you're interested in.",
          formKey: "careers-application",
          email: "careers@justxsystems.com",
        },
      },
    ]
  );

  await seedPage(
    "privacy",
    "Privacy Policy",
    "How JustX Systems collects, uses, and protects information submitted through this website.",
    [
      {
        type: "VISION",
        content: {
          heading: "Privacy Policy",
          body: "JustX Systems collects only the information you voluntarily submit through our contact and application forms — name, email, phone, and message content — to respond to your enquiry or application. We do not sell or share this information with third parties. Data submitted through this site is stored securely and retained only as long as needed to respond to your request. Contact hello@justxsystems.com with any questions about your data.",
        },
      },
    ]
  );

  await seedPage(
    "terms",
    "Terms",
    "Terms of use for the JustX Systems website.",
    [
      {
        type: "VISION",
        content: {
          heading: "Terms of Use",
          body: "By using this website, you agree to use it only for lawful purposes. Content on this site is provided for general informational purposes and does not constitute a binding offer or contract. JustX Systems reserves the right to update these terms at any time. Continued use of the site after changes constitutes acceptance of the updated terms. Contact hello@justxsystems.com with any questions.",
        },
      },
    ]
  );

  console.log(`   -> Careers form ready: ${careersForm.name} (${careersForm.key})`);

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
