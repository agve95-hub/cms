# CMS

A monolithic, database-backed Content Management System with a visual block editor, built with Next.js, Tailwind CSS, and SQLite. Designed for non-technical clients to manage full websites including blog posts, marketing/landing pages, and multi-page sites.

## Features

- **Visual Block Editor** — Drag-and-drop content blocks (headings, paragraphs, images, galleries, videos, testimonials, contact forms, newsletter signups, feature lists, card grids)
- **Blog** — Categories, tags, featured images, related posts
- **SEO** — Meta titles/descriptions, Open Graph, canonical URLs, robots directives, auto-generated sitemap
- **Media Library** — Upload images with automatic responsive resizing, WebP conversion, and alt text prompts
- **Navigation Menus** — Editable from admin panel with nested page support
- **Contact Forms** — Submissions stored in DB + email notifications
- **Newsletter** — Pluggable adapter (database, Mailchimp, ConvertKit, Brevo)
- **GitHub Integration** — Auto-commit content changes to main, webhook receiver for pull
- **Admin Dashboard** — Stats, recent activity, drafts, scheduled posts
- **Global Search** — FTS5-powered search across pages, posts, and media
- **Activity Log** — Who changed what, when
- **Redirects** — Auto-created on slug change, with hit tracking
- **Content Locking** — Prevents simultaneous editing
- **Auto-Save** — Draft recovery for unsaved changes
- **Trash** — Soft delete with 30-day auto-purge
- **Backups** — Automated daily backups with rotation
- **Security** — Rate limiting, CSRF protection, input sanitization, brute force protection, security headers

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router, SSR) |
| Language | TypeScript |
| Database | SQLite via better-sqlite3 |
| ORM | Drizzle ORM |
| CSS | Tailwind CSS |
| Auth | NextAuth.js (email/password + Google OAuth) |
| Image Processing | Sharp |
| Rich Text | Tiptap |
| Drag & Drop | @dnd-kit |

## Quick Start

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO

# Install
npm install

# Configure
cp .env.example .env
# Edit .env with your settings

# Generate a secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Initialize database
mkdir -p data
npx drizzle-kit push

# Run
npm run dev
```

Visit `http://localhost:3000/admin` to create your first admin account.

## Deployment

See the [Installation Guide](./docs/INSTALL.md) for full VPS deployment instructions including:
- Server setup (Ubuntu + Node.js + Nginx)
- SSL certificates (Let's Encrypt)
- Process manager (PM2)
- Firewall configuration
- GitHub integration
- Backup configuration

### Quick Deploy

```bash
npm run build
npm start
```

### With PM2

```bash
pm2 start ecosystem.config.js
pm2 save
```

## Project Structure

```
├── app/                  # Next.js App Router
│   ├── (public)/         # Public-facing pages
│   ├── admin/            # Admin panel pages
│   └── api/              # API routes
├── components/
│   ├── admin/            # Admin UI components
│   └── public/           # Public block renderers
├── lib/
│   ├── db/               # Database schema + connection
│   ├── auth/             # NextAuth config
│   ├── security/         # Sanitization, rate limiting, upload validation
│   ├── github/           # Git push/pull logic
│   ├── media/            # Image processing pipeline
│   ├── import/           # WordPress import tools
│   ├── newsletter/       # Pluggable newsletter adapters
│   ├── email/            # Nodemailer wrapper
│   ├── backup/           # Backup creation + rotation
│   ├── cron/             # Scheduled jobs
│   ├── locks/            # Content locking
│   ├── search/           # FTS5 search
│   └── seo/              # Sitemap + redirects
├── templates/            # Page templates
├── content/              # Auto-committed content JSON
├── uploads/              # Media files
├── data/                 # SQLite database
└── backups/              # Automated backups
```

## Environment Variables

See `.env.example` for the full list with documentation.

## License

MIT
