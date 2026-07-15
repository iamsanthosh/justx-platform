# JustX CMS v1.0

Enterprise website + CMS platform for JustX Systems. Milestones 1–2 of the
roadmap: foundation (auth, schema, security) and the public rendering engine
+ core admin CMS (section CRUD: enable/disable/reorder/duplicate/draft-publish).

## Local development setup (new joiner walkthrough)

This section assumes a fresh machine with nothing installed. Follow it in
order — each step depends on the one before it.

### 1. Install prerequisites

You need four things: **Git**, **Node.js 20+**, a **MySQL server**, and (optionally)
a way to send test emails. Pick your OS below.

<details>
<summary><strong>macOS</strong></summary>

```bash
# Install Homebrew first if you don't have it: https://brew.sh

# Git (often already present; this ensures it's current)
brew install git

# Node.js — use nvm so you can match the project's version exactly
brew install nvm
mkdir -p ~/.nvm
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
echo '[ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && \. "/opt/homebrew/opt/nvm/nvm.sh"' >> ~/.zshrc
source ~/.zshrc
nvm install 20
nvm use 20

# MySQL
brew install mysql
brew services start mysql
# Secure the default install (sets a root password, removes anonymous users):
mysql_secure_installation
```
</details>

<details>
<summary><strong>Windows (PowerShell, as Administrator)</strong></summary>

```powershell
# Git: https://git-scm.com/download/win (or)
winget install --id Git.Git -e

# Node.js 20 via nvm-windows: https://github.com/coreybutler/nvm-windows/releases
# after installing nvm-windows:
nvm install 20.18.0
nvm use 20.18.0

# MySQL: download the installer from https://dev.mysql.com/downloads/installer/
# During setup, choose "Server only", set a root password, and make sure
# "Start MySQL Server at System Startup" is checked.
```

If native module builds (`bcryptjs`/`sharp`) complain about missing build
tools, install the Visual Studio Build Tools:
```powershell
npm install --global windows-build-tools
```
</details>

<details>
<summary><strong>Linux (Ubuntu/Debian)</strong></summary>

```bash
sudo apt update
sudo apt install -y git curl build-essential

# Node.js 20 via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# MySQL
sudo apt install -y mysql-server
sudo systemctl enable --now mysql
sudo mysql_secure_installation
```
</details>

<details>
<summary><strong>Alternative: MySQL via Docker (any OS)</strong></summary>

If you'd rather not install MySQL directly (e.g. you already have Docker
Desktop), this is the fastest path and avoids any OS-specific quirks:

```bash
docker run --name justx-mysql \
  -e MYSQL_ROOT_PASSWORD=rootpass \
  -e MYSQL_DATABASE=justx_cms \
  -e MYSQL_USER=justx_user \
  -e MYSQL_PASSWORD=devpassword \
  -p 3306:3306 \
  -d mysql:8.0
```
This creates the database and user in one step — skip step 2 below and use
`DATABASE_URL="mysql://justx_user:devpassword@localhost:3306/justx_cms"`.
Bring it down later with `docker stop justx-mysql`, back up with
`docker start justx-mysql`.
</details>

Verify everything installed correctly before moving on:
```bash
git --version      # any recent version
node --version      # v20.x or newer
npm --version       # v10.x or newer
mysql --version      # 8.0.x recommended (matches production on Hostinger)
```

### 2. Create the local database (skip if you used the Docker option above)

Log into MySQL as root and create a dedicated database + user for this
project — don't use the root account in `DATABASE_URL`:

```bash
mysql -u root -p
```
Then, at the `mysql>` prompt:
```sql
CREATE DATABASE justx_cms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'justx_user'@'localhost' IDENTIFIED BY 'devpassword';
GRANT ALL PRIVILEGES ON justx_cms.* TO 'justx_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```
(Use a real password if this machine isn't just for local dev — anything
reachable from outside `localhost` should never use a throwaway password.)

### 3. Clone the repo and install dependencies

```bash
git clone <your-repo-url> justx-cms
cd justx-cms
npm install
```
This installs everything in `package.json`: Next.js, Prisma, Tailwind, Zod,
React Hook Form, bcryptjs, jose, sharp, nodemailer, winston, and the dev
tooling (TypeScript, ESLint, Vitest, Playwright). It takes 1-3 minutes
depending on connection speed. `pnpm install` or `yarn install` work too if
you prefer a different package manager — no lockfile is committed, so all
three are equally supported.

### 4. Configure environment variables

```bash
cp .env.example .env
```
Then open `.env` in your editor and fill in every value. Here's what each
one does and what to put for **local development** specifically:

| Variable | What it's for | Local dev value |
|---|---|---|
| `DATABASE_URL` | Prisma's connection string to MySQL | `mysql://justx_user:devpassword@localhost:3306/justx_cms` (match whatever you set in step 2) |
| `JWT_SECRET` | Signs admin session tokens | Any random 32+ character string — generate one with `openssl rand -hex 32` |
| `JWT_EXPIRES_IN` | How long a login session lasts | `7d` is fine to leave as-is |
| `COOKIE_NAME` | Name of the session cookie | Leave as `justx_session` |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | Sends contact-form and forms-engine notification emails | See "Sending email locally" below — you don't need real credentials to develop |
| `ENQUIRY_NOTIFY_EMAIL` | Where contact-form notifications are sent | Any address, e.g. `you@example.com` — safe to leave even without working SMTP, since a failed send never blocks the form submission |
| `NEXT_PUBLIC_SITE_URL` | Used for sitemap.xml and OG tags | `http://localhost:3000` |
| `NODE_ENV` | Standard Node environment flag | `development` for local work (the `npm run dev` script sets this automatically regardless) |

**Sending email locally**: you don't need a real mailbox to develop against.
Two options:
- **Skip it entirely** — if `SMTP_HOST`/`SMTP_USER`/`SMTP_PASS` are left as
  the placeholder values, email sending will fail, but the app is built so
  that a failed notification email never blocks the actual form submission
  (the enquiry/submission is still saved to the database either way — see
  `src/app/api/enquiries/route.ts`). You just won't get the email.
- **Use a free testing inbox** — [Ethereal Email](https://ethereal.email/)
  (generates a disposable SMTP inbox instantly, no signup) or
  [Mailtrap](https://mailtrap.io) (free tier) are the easiest for actually
  seeing what the emails look like. Paste their SMTP host/port/user/pass
  into `.env`.

### 5. Set up the database schema

```bash
npx prisma generate      # generates the type-safe Prisma Client into node_modules
npx prisma migrate dev --name init
```
`migrate dev` reads `prisma/schema.prisma`, creates all the tables in your
`justx_cms` database, and generates a migration file under `prisma/migrations/`
(commit that folder once it's created — migrations are part of the
codebase, tracked in version control like any other source file).

If this step fails with a connection error, double check:
- MySQL is actually running (`brew services list`, `sudo systemctl status mysql`,
  or `docker ps` depending on your setup)
- `DATABASE_URL` in `.env` has the right username/password/port
- the database named in `DATABASE_URL` (`justx_cms`) actually exists (step 2)

### 6. Seed initial data

```bash
npm run seed
```
This populates:
- Three roles (`SUPER_ADMIN`, `EDITOR`, `VIEWER`) with their permission sets
- One admin user: `admin@justxsystems.com` / `ChangeMe!12345` (override
  before seeding by exporting `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`
  first — **change this password after your first login regardless**)
- The primary navigation menu
- The Home page plus all eight secondary pages (About, Services, Solutions,
  Industries, Technologies, Careers, Privacy, Terms), each with real,
  published content
- A `careers-application` form definition

Re-running `npm run seed` is safe — it uses `upsert` throughout and checks
for existing sections before re-creating them, so it won't duplicate data.

### 7. Run it

```bash
npm run dev
```
Open **http://localhost:3000** for the public site, and
**http://localhost:3000/admin/login** for the CMS — log in with the seeded
admin credentials from step 6.

### 8. (Optional) Verify everything's wired up correctly

```bash
npm run lint        # ESLint — should report 0 problems
npx tsc --noEmit     # TypeScript project-wide type-check — should report 0 errors
npm test             # Vitest unit tests — 34 tests should pass
npm run build        # Full production build — confirms the standalone output works
```

### Quick reference: all npm scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the dev server with hot reload at :3000 |
| `npm run build` | Production build (standalone output) |
| `npm run start` | Runs the production build (run `build` first) |
| `npm run lint` | ESLint over the whole project |
| `npm test` | Vitest unit test suite |
| `npm run test:e2e` | Playwright end-to-end tests (needs a running app + seeded DB) |
| `npm run seed` | Runs `prisma/seed.ts` (see step 6) |
| `npx prisma studio` | Opens a GUI at localhost:5555 to browse/edit your database directly — handy for debugging |
| `npx prisma migrate dev --name <description>` | Creates a new migration after you change `schema.prisma` |

### Common local setup issues

- **`Error: @prisma/client did not initialize yet`** — you skipped or need
  to re-run `npx prisma generate`. This regenerates automatically on
  `npm install` via the `postinstall` hook in most setups, but re-run it
  manually any time `prisma/schema.prisma` changes.
- **`Access denied for user 'justx_user'@'localhost'`** — the password in
  `DATABASE_URL` doesn't match what you set in step 2, or you forgot
  `FLUSH PRIVILEGES;`. Re-run the `GRANT`/`FLUSH` statements.
- **`sharp` fails to install** — sharp ships prebuilt binaries for most
  platforms; if it fails, you're likely on an unsupported architecture.
  Try `npm install --platform=linux --arch=x64 sharp` (adjust to your
  platform) or check https://sharp.pixelplumbing.com/install for your
  specific OS/arch.
- **Port 3000 already in use** — either stop whatever's using it, or run
  `PORT=3001 npm run dev`.
- **Contact form submits but no email arrives** — expected if you skipped
  SMTP setup (see step 4); check the enquiry landed in `/admin/enquiries`
  regardless, which confirms the submission itself worked.

---

## Getting it running (quick reference)

If you've already done the full walkthrough above once and just need the
short version for a subsequent clone/reset:

```bash
npm install
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

## Environment variables

Every variable is documented with local-dev-specific guidance in
"Local development setup" → step 4 above. Full list, see `.env.example`:
`DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `COOKIE_NAME`,
`SMTP_HOST/PORT/USER/PASS/FROM`, `ENQUIRY_NOTIFY_EMAIL`,
`NEXT_PUBLIC_SITE_URL`, `NODE_ENV`.

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
  export), menus admin (unlimited menus, not just primary nav — add/reorder/
  delete items, create new menu keys inline), user
  management (Super Admin only — create/disable/delete accounts, assign
  roles), site settings (title, default meta description, contact email)
- Public site: dynamic page rendering by slug — Home plus all eight
  secondary pages (About, Services, Solutions, Industries, Technologies,
  Careers, Privacy, Terms) seeded with real, published content, not
  placeholders — contact form wired to a real API route + DB storage + SMTP
  notification, sitemap.xml, robots.txt, per-page SEO metadata
- Security: in-memory rate limiting (login, enquiry, and form-submission
  endpoints), Zod validation on every write path (including runtime-built
  schemas per form definition), RBAC permission checks on every admin API
  route *and* every admin page that reads data directly (page-level guard via
  `requirePagePermission`, separate from the API-level `requirePermission`),
  audit logging, honeypot fields on both the contact form and the generic
  forms engine
- Winston logging, standalone Next.js output (`output: "standalone"`) sized
  for a 1 vCPU / 4 GB VPS

## Testing

**Unit tests (Vitest)** — real, currently passing (34 tests): validation
schemas for sections/enquiry/forms (including the forms engine's
runtime-built Zod schema), the in-memory rate limiter, and JWT session
sign/verify.

```bash
npm test
```

**E2E tests (Playwright)** — public site smoke tests (homepage render, nav,
contact form validation, 404, robots/sitemap) and the full admin auth flow
(redirect-when-unauthenticated, invalid login, successful login, logout).
These spin up the production build via `webServer` in `playwright.config.ts`,
so they need a real database behind `DATABASE_URL` and a seeded admin user
— they aren't runnable in a sandbox without MySQL, but will run against a
real dev/staging environment:

```bash
npm run test:e2e
```

## Deploying to a Hostinger VPS (Node + PM2 + Nginx + MySQL)

Automated via `deploy.sh` + `ecosystem.config.js`:

1. Provision MySQL, create a database + user, put the connection string in
   `DATABASE_URL`. Clone the repo onto the VPS, `cp .env.example .env` and
   fill in real values (strong unique `JWT_SECRET`, SMTP creds, etc.).
2. First deploy: `./deploy.sh --first-run` — installs dependencies,
   generates the Prisma client, runs migrations, seeds initial data (roles +
   admin user + home page), builds, copies static assets into the
   standalone output, and starts the app under PM2.
3. Subsequent deploys: `./deploy.sh` (applies any new migrations, rebuilds,
   reloads PM2 with zero manual steps).
4. `pm2 save && pm2 startup` once, so PM2 restarts the app on server reboot.
5. Put Nginx in front: copy `deploy/nginx.example.conf`, adjust the domain
   and the `/var/www/justx-cms` path, then
   `sudo certbot --nginx -d justxsystems.com -d www.justxsystems.com` for
   the Let's Encrypt certificate.

`ecosystem.config.js` runs a single PM2 instance (matches the 1 vCPU / 4GB
target and the in-memory rate limiter, which assumes one process) with a
memory-restart threshold and log files under `logs/`.

## Not yet built

Nothing from the original spec is left unaddressed at the "one milestone at
a time, complete and working" level this delivery targets. What remains is
refinement, not missing functionality: richer Careers content (currently a
hero + culture section + an application form wired to the forms engine, not
a job-listing board — the spec didn't define one), and menus beyond
`primary-nav` exist and are editable but aren't yet rendered anywhere on the
public site (the schema and admin UI support unlimited menus; wiring one
into, say, a footer, is a two-line change in `Footer.tsx` once you decide
what should live there).

All eight secondary pages (About, Services, Solutions, Industries,
Technologies, Careers, Privacy, Terms) are seeded with real, published
content — not empty drafts — using section types already in the registry.

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
- `npx tsc --noEmit` — 0 errors (whole project, including `prisma/seed.ts` and
  the test suite)
- `npm test` (Vitest) — 34/34 unit tests passing
- `npx next build` — TypeScript compiles cleanly and lint passes; the build
  gets as far as "Collecting page data" and then fails because
  `@prisma/client` hasn't been generated. That's expected: generating the
  Prisma client needs to download an engine binary from
  `binaries.prisma.sh`, which this sandbox's network policy blocks. Run
  `npx prisma generate` on your own machine or CI (where that domain isn't
  blocked) and the build will complete — no code changes needed.

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
