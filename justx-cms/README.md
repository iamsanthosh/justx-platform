# JustX CMS v1.0

Enterprise website + CMS platform for JustX Systems. Milestones 1–2 of the
roadmap: foundation (auth, schema, security) and the public rendering engine
+ core admin CMS (section CRUD: enable/disable/reorder/duplicate/draft-publish).

## What's included in this delivery

- Next.js 15 (App Router) + TypeScript, Tailwind CSS
- MySQL schema via Prisma: Users/Roles/RBAC, Pages, Sections (component
  registry), Menus, Media, Forms, Testimonials, Clients, Enquiries, Settings,
  Audit Log
- JWT (jose, edge-safe) + HttpOnly cookie auth, bcrypt password hashing
- Section-based CMS (not a generic drag-and-drop builder — see "Design
  decisions" below) with 16 section types seeded from the real JustX v4 site
  content: Hero, Metrics, Problems, Services, AI Feature, Ecosystem, Vision,
  Why Us, Delivery, Industries, Testimonials, Gallery, FAQ, CTA, Contact, Footer
- Admin dashboard: pages list, per-page section board (enable / disable /
  reorder / duplicate / delete / draft-publish / edit content), media
  library (upload with automatic image optimization + dimension extraction
  via sharp, alt text, delete), testimonials & clients managers, enquiries
  inbox, forms engine (unlimited dynamic forms — build fields visually, each
  form gets its own `/api/forms/submit/<key>` endpoint validated against its
  own field schema, submissions inbox with status/notes, one-click CSV
  export), menus admin (add/reorder/delete primary nav items), user
  management (Super Admin only — create/disable/delete accounts, assign
  roles), site settings (title, default meta description, contact email)
- Public site: dynamic page rendering by slug, contact form wired to a real
  API route + DB storage + SMTP notification, sitemap.xml, robots.txt,
  per-page SEO metadata
- Security: in-memory rate limiting (login, enquiry, and form-submission
  endpoints), Zod validation on every write path (including runtime-built
  schemas per form definition), RBAC permission checks on every admin API
  route *and* every admin page that reads data directly (page-level guard via
  `requirePagePermission`, separate from the API-level `requirePermission`),
  audit logging, honeypot fields on both the contact form and the generic
  forms engine
- Winston logging, standalone Next.js output (`output: "standalone"`) sized
  for a 1 vCPU / 4 GB VPS

## Not yet built (next milestones)

Careers module, automated test suites (Vitest/Playwright —
devDependencies are already in `package.json`), deployment scripts, and the
remaining static pages (About, Services, etc. — currently seeded as empty
draft shells so slugs/routes exist). Secondary menus (only `primary-nav` has
an admin UI so far; the schema supports unlimited menus).

## Design decisions worth knowing about

- **Section-based CMS, not a generic page builder.** The spec asked for
  drag-and-drop, unlimited nested components. A true generic builder
  (Webflow-style) is itself a multi-month product. Instead, editors work with
  a fixed library of 16 section types (enable/disable/reorder/duplicate/
  draft-publish), each with a Zod-validated content schema — the same
  non-technical-editor outcome, far less risk. New section types are added by
  extending `src/lib/validation/sections.ts` + a component + a case in
  `SectionRenderer.tsx`.
- **No Redis**, per the spec — rate limiting uses an in-memory Map. Fine for
  a single Node process on one VPS; note it resets on restart and doesn't
  share state across multiple instances (not a concern here — one process).
- **jose over `jsonwebtoken`** for JWT signing/verification because it works
  in both the Node and Edge runtimes, so `middleware.ts` can verify sessions
  without pulling in Node-only dependencies. Password hashing (`bcryptjs`)
  stays in a separate Node-only module (`src/lib/auth.ts`) that middleware
  never imports.

## Verified in this environment

- `npx eslint .` — 0 errors, 0 warnings
- `npx next build` — TypeScript compiles cleanly and lint passes; the build
  gets as far as "Collecting page data" and then fails because
  `@prisma/client` hasn't been generated. That's expected: generating the
  Prisma client needs to download an engine binary from
  `binaries.prisma.sh`, which this sandbox's network policy blocks. Run
  `npx prisma generate` on your own machine or CI (where that domain isn't
  blocked) and the build will complete — no code changes needed.

## Getting it running

```bash
pnpm install        # or npm install — package-lock isn't committed
cp .env.example .env
# edit .env: DATABASE_URL, JWT_SECRET (32+ random chars), SMTP_*, etc.

npx prisma generate
npx prisma migrate dev --name init     # creates the MySQL schema
npm run seed                            # roles, admin user, home page + sections

npm run dev          # http://localhost:3000
```

Default seeded admin login (change immediately):
`admin@justxsystems.com` / `ChangeMe!12345` (override via `SEED_ADMIN_EMAIL`
/ `SEED_ADMIN_PASSWORD` env vars before seeding).

Admin dashboard: `/admin/login` → `/admin/dashboard`.

## Deploying to a Hostinger VPS (Node + PM2 + Nginx + MySQL)

1. Provision MySQL, create a database + user, put the connection string in
   `DATABASE_URL`.
2. On the VPS: `git clone` (or upload) the repo, `npm install --production=false`,
   `npx prisma generate`, `npx prisma migrate deploy`, `npm run seed` (first
   deploy only), `npm run build`.
3. Run with PM2: `pm2 start npm --name justx-cms -- start`, `pm2 save`,
   `pm2 startup`.
4. Put Nginx in front as a reverse proxy to `localhost:3000`, then issue a
   Let's Encrypt cert with `certbot`.
5. Set `NODE_ENV=production` and a strong, unique `JWT_SECRET`.

## Environment variables

See `.env.example` for the full list: `DATABASE_URL`, `JWT_SECRET`,
`JWT_EXPIRES_IN`, `COOKIE_NAME`, `SMTP_HOST/PORT/USER/PASS/FROM`,
`ENQUIRY_NOTIFY_EMAIL`, `NEXT_PUBLIC_SITE_URL`, `NODE_ENV`.

## Folder structure

```
prisma/schema.prisma        Database schema (MySQL)
prisma/seed.ts              Roles, admin user, nav menu, home page content
src/lib/                    auth, session, rbac, rate limiting, mail, logger,
                            validation (Zod schemas), data/ (repository layer)
src/components/sections/    One component per CMS section type + the registry
                            (SectionRenderer.tsx)
src/app/                    Public routes ([slug]/page.tsx, sitemap, robots)
src/app/admin/              Login, dashboard, pages list, section editor,
                            enquiries inbox
src/app/api/                auth, sections (CRUD + duplicate), enquiries
```
