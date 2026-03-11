# CMS Installation Guide

Complete guide to installing, configuring, and deploying the CMS — from a fresh VPS to a production-ready site.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Local Development Setup](#2-local-development-setup)
3. [VPS Server Setup](#3-vps-server-setup)
4. [CMS Installation on VPS](#4-cms-installation-on-vps)
5. [Environment Configuration](#5-environment-configuration)
6. [Database Setup](#6-database-setup)
7. [Google OAuth Setup](#7-google-oauth-setup)
8. [GitHub Integration Setup](#8-github-integration-setup)
9. [Email / SMTP Setup](#9-email--smtp-setup)
10. [Reverse Proxy (Nginx)](#10-reverse-proxy-nginx)
11. [SSL Certificate (Let's Encrypt)](#11-ssl-certificate-lets-encrypt)
12. [Process Manager (PM2)](#12-process-manager-pm2)
13. [Firewall Configuration](#13-firewall-configuration)
14. [Backup Configuration](#14-backup-configuration)
15. [First Run & Admin Setup](#15-first-run--admin-setup)
16. [Deploying Updates](#16-deploying-updates)
17. [Setting Up a New Client Site](#17-setting-up-a-new-client-site)
18. [Troubleshooting](#18-troubleshooting)
19. [Maintenance Checklist](#19-maintenance-checklist)
20. [Uninstalling / Removing](#20-uninstalling--removing)

---

## 1. Prerequisites

### Your Local Machine

You need these installed on your development machine:

| Tool | Minimum Version | Check Command | Install |
|---|---|---|---|
| Node.js | 18.17+ (LTS recommended: 20.x) | `node --version` | https://nodejs.org or use `nvm` |
| npm | 9.0+ | `npm --version` | Comes with Node.js |
| Git | 2.30+ | `git --version` | https://git-scm.com |

**Install Node.js via nvm (recommended):**

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Restart terminal, then:
nvm install 20
nvm use 20
nvm alias default 20

# Verify
node --version   # v20.x.x
npm --version    # 10.x.x
```

### Your VPS (Production Server)

| Requirement | Minimum | Recommended |
|---|---|---|
| OS | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |
| RAM | 1 GB | 2 GB+ |
| CPU | 1 vCPU | 2 vCPU |
| Disk | 20 GB SSD | 40 GB+ SSD |
| Network | Public IPv4 | + IPv6 |

**Recommended VPS providers:** DigitalOcean, Hetzner, Linode, Vultr, or any provider you prefer.

---

## 2. Local Development Setup

### Step 1: Clone the Repository

```bash
# Clone from GitHub
git clone https://github.com/YOUR_USERNAME/YOUR_CMS_REPO.git
cd YOUR_CMS_REPO

# Or if starting fresh, create the project
mkdir my-cms && cd my-cms
git init
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs all packages defined in `package.json`, including:
- Next.js, React, TypeScript
- Drizzle ORM, better-sqlite3
- Tailwind CSS
- NextAuth.js
- Sharp (image processing)
- Tiptap (rich text editor)
- @dnd-kit (drag & drop)
- simple-git, node-cron, nodemailer, pino, DOMPurify, etc.

### Step 3: Create Environment File

```bash
# Copy the example environment file
cp .env.example .env

# Open in your editor
nano .env    # or: code .env
```

Fill in the minimum required values for local development:

```env
# Minimum for local dev
DATABASE_PATH=./data/cms.db
NEXTAUTH_SECRET=generate-a-random-string-here
NEXTAUTH_URL=http://localhost:3000
SITE_URL=http://localhost:3000
SITE_NAME=My CMS Dev

# Generate a secure secret:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Initialize the Database

```bash
# Create the data directory
mkdir -p data

# Run Drizzle migrations to create all tables
npx drizzle-kit push
```

This creates the SQLite database at `./data/cms.db` with all 17 tables.

### Step 5: Start Development Server

```bash
npm run dev
```

The CMS is now running at `http://localhost:3000`.

- Public site: `http://localhost:3000`
- Admin panel: `http://localhost:3000/admin`

On first visit to `/admin`, you'll see the setup wizard to create your initial admin account.

### Step 6: Verify Everything Works

```bash
# Check the database was created
ls -la data/cms.db

# Check the uploads directory exists
ls -la uploads/

# Run linting
npm run lint

# Run type checking
npx tsc --noEmit
```

---

## 3. VPS Server Setup

### Step 1: SSH into Your Server

```bash
ssh root@YOUR_SERVER_IP
```

### Step 2: Update System

```bash
apt update && apt upgrade -y
```

### Step 3: Create a Non-Root User

Never run the CMS as root.

```bash
# Create user
adduser cmsadmin

# Add to sudo group
usermod -aG sudo cmsadmin

# Switch to new user
su - cmsadmin
```

### Step 4: Set Up SSH Key Authentication

On your **local machine**:

```bash
# Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -C "your-email@example.com"

# Copy public key to server
ssh-copy-id cmsadmin@YOUR_SERVER_IP
```

Then on the **server**, disable password authentication:

```bash
sudo nano /etc/ssh/sshd_config
```

Set these values:

```
PasswordAuthentication no
PermitRootLogin no
PubkeyAuthentication yes
```

Restart SSH:

```bash
sudo systemctl restart sshd
```

**Important:** Test that you can still SSH in with your key before closing your current session!

### Step 5: Install Node.js on the Server

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Reload shell
source ~/.bashrc

# Install Node.js LTS
nvm install 20
nvm use 20
nvm alias default 20

# Verify
node --version
npm --version
```

### Step 6: Install Required System Packages

```bash
sudo apt install -y git build-essential nginx certbot python3-certbot-nginx
```

- **git** — for GitHub integration
- **build-essential** — needed to compile native Node modules (better-sqlite3, sharp)
- **nginx** — reverse proxy
- **certbot** — free SSL certificates

---

## 4. CMS Installation on VPS

### Step 1: Clone the Repository

```bash
# Create app directory
sudo mkdir -p /var/www/cms
sudo chown cmsadmin:cmsadmin /var/www/cms

# Clone
cd /var/www
git clone https://github.com/YOUR_USERNAME/YOUR_CMS_REPO.git cms
cd cms
```

### Step 2: Install Dependencies

```bash
npm install --production=false
```

We use `--production=false` to ensure dev dependencies (TypeScript, etc.) are available for the build step.

### Step 3: Create Required Directories

```bash
# Database directory (outside web root)
mkdir -p data
chmod 700 data

# Uploads directory
mkdir -p uploads
chmod 755 uploads

# Backups directory
mkdir -p backups
chmod 700 backups

# Content directory (for GitHub auto-commits)
mkdir -p content/pages content/posts content/menus content/settings
```

### Step 4: Create Environment File

```bash
cp .env.example .env
nano .env
```

See [Section 5](#5-environment-configuration) for the complete configuration.

### Step 5: Build for Production

```bash
npm run build
```

This compiles TypeScript, builds the Next.js application, and outputs optimized production bundles.

### Step 6: Initialize Database

```bash
npx drizzle-kit push
```

### Step 7: Test That It Starts

```bash
# Quick test (Ctrl+C to stop)
npm start
```

You should see the server start on port 3000. Don't leave it running this way — we'll set up PM2 next.

---

## 5. Environment Configuration

Here's the complete `.env` file with explanations. All values after `=` are examples — replace with your own.

```env
# ============================================================
# DATABASE
# ============================================================
# Path to SQLite database file (relative to project root)
DATABASE_PATH=./data/cms.db

# ============================================================
# AUTHENTICATION
# ============================================================
# Secret for signing JWT tokens. MUST be unique and random.
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
NEXTAUTH_SECRET=a1b2c3d4e5f6...your-64-char-hex-string

# The public URL of your site (no trailing slash)
NEXTAUTH_URL=https://yourdomain.com

# Google OAuth credentials (see Section 7)
GOOGLE_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxx

# ============================================================
# SECURITY
# ============================================================
# Optional: restrict admin panel to specific IPs (comma-separated)
# Leave empty to allow all IPs
ADMIN_ALLOWED_IPS=

# Secret for CSRF token generation
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
CSRF_SECRET=f6e5d4c3b2a1...your-64-char-hex-string

# Enable rate limiting (disable only for development)
RATE_LIMIT_ENABLED=true

# ============================================================
# EMAIL (for contact form notifications)
# ============================================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com
CONTACT_FORM_TO=admin@yourdomain.com

# ============================================================
# GITHUB (push — auto-commit content changes)
# ============================================================
GITHUB_AUTO_COMMIT=true
GITHUB_REMOTE=origin
GITHUB_BRANCH=main
GITHUB_COMMIT_PREFIX=content:

# ============================================================
# GITHUB (pull — receive updates from repo)
# ============================================================
# Secret for validating GitHub webhook signatures
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
GITHUB_WEBHOOK_SECRET=your-webhook-secret

# Allow pulling from GitHub
GITHUB_PULL_ENABLED=true

# Auto-pull when webhook fires (false = manual only from admin panel)
GITHUB_PULL_AUTO=false

# Restart the Node process if non-content files change
GITHUB_PULL_RESTART_ON_CODE=true

# ============================================================
# NEWSLETTER
# ============================================================
# Provider: database | mailchimp | convertkit | brevo
NEWSLETTER_PROVIDER=database

# Uncomment and fill when switching to Mailchimp:
# MAILCHIMP_API_KEY=your-api-key
# MAILCHIMP_LIST_ID=your-list-id

# ============================================================
# BACKUPS
# ============================================================
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAILY=7
BACKUP_RETENTION_WEEKLY=4
BACKUP_RETENTION_MONTHLY=3
BACKUP_PATH=./backups

# Optional: remote backup to S3
BACKUP_REMOTE_ENABLED=false
# BACKUP_S3_BUCKET=your-bucket
# BACKUP_S3_REGION=us-east-1

# ============================================================
# ANALYTICS
# ============================================================
# Paste your analytics script tag (injected into frontend <head>)
# Example for Plausible:
# ANALYTICS_SCRIPT=<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
ANALYTICS_SCRIPT=

# ============================================================
# LOGGING
# ============================================================
# Options: fatal, error, warn, info, debug, trace
LOG_LEVEL=info

# ============================================================
# SITE
# ============================================================
SITE_URL=https://yourdomain.com
SITE_NAME=Your Site Name
```

### Security Notes on .env

```bash
# Set restrictive permissions — only the CMS user can read it
chmod 600 .env

# NEVER commit .env to Git
# .gitignore should already include it, but verify:
grep ".env" .gitignore
```

---

## 6. Database Setup

SQLite requires no separate database server — the database is a single file.

### Initial Setup

```bash
# The database is auto-created when you run:
npx drizzle-kit push
```

This executes all Drizzle migrations and creates the 17 tables defined in the schema.

### Verify Tables Were Created

```bash
# Install sqlite3 CLI (if not already)
sudo apt install sqlite3

# Open the database
sqlite3 data/cms.db

# List all tables
.tables

# You should see:
# activity_log      content_locks     form_submissions  login_attempts
# categories        import_jobs       media             navigation_menus
# pages             post_categories   post_tags         posts
# redirects         site_settings     tags              users

# Check a table schema
.schema users

# Exit
.quit
```

### SQLite Performance Tuning

The CMS applies these PRAGMAs automatically on startup, but you can verify:

```bash
sqlite3 data/cms.db "PRAGMA journal_mode;"     # Should return: wal
sqlite3 data/cms.db "PRAGMA synchronous;"      # Should return: 1 (NORMAL)
sqlite3 data/cms.db "PRAGMA foreign_keys;"     # Should return: 1 (ON)
```

### Manual Backup

```bash
# Create a manual backup at any time
sqlite3 data/cms.db ".backup data/cms-backup-$(date +%Y%m%d).db"
```

---

## 7. Google OAuth Setup

### Step 1: Create a Google Cloud Project

1. Go to https://console.cloud.google.com
2. Click "Select a project" → "New Project"
3. Name it (e.g., "My CMS Auth") → Create
4. Select the new project

### Step 2: Configure OAuth Consent Screen

1. Navigate to **APIs & Services → OAuth consent screen**
2. Choose **External** user type → Create
3. Fill in:
   - App name: Your CMS name
   - User support email: your email
   - Authorized domains: `yourdomain.com`
   - Developer contact: your email
4. Click **Save and Continue** through scopes (no extra scopes needed)
5. Add test users if still in testing mode
6. Publish the app when ready for production

### Step 3: Create OAuth Credentials

1. Navigate to **APIs & Services → Credentials**
2. Click **Create Credentials → OAuth Client ID**
3. Application type: **Web application**
4. Name: "CMS Login"
5. **Authorized JavaScript origins:**
   - `https://yourdomain.com`
   - `http://localhost:3000` (for development)
6. **Authorized redirect URIs:**
   - `https://yourdomain.com/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (for development)
7. Click **Create**
8. Copy **Client ID** and **Client Secret** into your `.env` file

---

## 8. GitHub Integration Setup

### Part A: Push (Auto-Commit Content Changes)

#### Step 1: Create a GitHub Repository

1. Go to https://github.com/new
2. Create a new repository (public or private)
3. Don't initialize with README (you'll push existing code)

#### Step 2: Set Up SSH Key on the Server

The CMS needs SSH access to push to GitHub without a password.

```bash
# On your VPS, as the cmsadmin user:
ssh-keygen -t ed25519 -C "cms-server" -f ~/.ssh/github_cms
# Press Enter for no passphrase (required for automated pushes)
```

#### Step 3: Add Deploy Key to GitHub

```bash
# Display the public key
cat ~/.ssh/github_cms.pub
```

1. Go to your GitHub repo → **Settings → Deploy keys**
2. Click **Add deploy key**
3. Title: "CMS Server"
4. Key: paste the public key
5. Check **Allow write access**
6. Click **Add key**

#### Step 4: Configure SSH to Use the Key

```bash
nano ~/.ssh/config
```

Add:

```
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/github_cms
  IdentitiesOnly yes
```

Test the connection:

```bash
ssh -T git@github.com
# Should output: Hi YOUR_USERNAME/YOUR_REPO! You've successfully authenticated...
```

#### Step 5: Set Up the Remote

```bash
cd /var/www/cms

# If the repo was cloned via HTTPS, switch to SSH:
git remote set-url origin git@github.com:YOUR_USERNAME/YOUR_CMS_REPO.git

# Verify
git remote -v

# Configure git user for commits
git config user.email "cms@yourdomain.com"
git config user.name "CMS Auto-Commit"
```

### Part B: Pull (Receive Updates via Webhook)

#### Step 1: Create Webhook on GitHub

1. Go to your repo → **Settings → Webhooks**
2. Click **Add webhook**
3. **Payload URL:** `https://yourdomain.com/api/github/webhook`
4. **Content type:** `application/json`
5. **Secret:** Use the same value as `GITHUB_WEBHOOK_SECRET` in your `.env`
6. **Events:** Select "Just the push event"
7. Click **Add webhook**

#### Step 2: Test the Webhook

1. Make a small change in the repo (edit README, etc.)
2. Push to main
3. Check GitHub webhook delivery log (Settings → Webhooks → Recent Deliveries)
4. Should show a green checkmark with 200 response

---

## 9. Email / SMTP Setup

The CMS sends emails for contact form notifications. Here are common SMTP configurations:

### Option A: Gmail

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx-xxxx-xxxx-xxxx
```

**Important:** Use a Gmail "App Password", not your regular password:
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and your device
3. Copy the 16-character password

### Option B: SendGrid

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Option C: Mailgun

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your-mailgun-password
```

### Option D: Amazon SES

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASS=your-ses-smtp-password
```

### Test Email Configuration

```bash
# Run the built-in email test command
node -e "
const nodemailer = require('nodemailer');
const t = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});
t.sendMail({
  from: process.env.SMTP_FROM,
  to: process.env.CONTACT_FORM_TO,
  subject: 'CMS Email Test',
  text: 'If you see this, email is working!'
}).then(() => console.log('Email sent!')).catch(console.error);
"
```

---

## 10. Reverse Proxy (Nginx)

Nginx sits in front of your Node.js app, handling SSL, static files, and proxying requests.

### Step 1: Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/cms
```

Paste:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS (will be set up by Certbot)
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificates (Certbot will fill these in)
    # ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers (defense in depth — also set in Next.js)
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Max upload size (match your CMS config — default 20MB for images)
    client_max_body_size 25M;

    # Serve uploaded media directly via Nginx (faster than Node)
    location /uploads/ {
        alias /var/www/cms/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Serve Next.js static assets
    location /_next/static/ {
        alias /var/www/cms/.next/static/;
        expires 365d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Proxy everything else to Next.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### Step 2: Enable the Site

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/cms /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 11. SSL Certificate (Let's Encrypt)

### Step 1: Point Your Domain

Before running Certbot, make sure your domain's DNS A record points to your server's IP address. This is done at your domain registrar (Namecheap, Cloudflare, GoDaddy, etc.):

```
Type: A
Name: @
Value: YOUR_SERVER_IP
TTL: 300
```

If you want `www.yourdomain.com` too:

```
Type: A
Name: www
Value: YOUR_SERVER_IP
TTL: 300
```

Wait for DNS propagation (usually 5-30 minutes). Verify:

```bash
dig yourdomain.com +short
# Should show your server IP
```

### Step 2: Run Certbot

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts:
1. Enter your email address
2. Agree to terms
3. Choose whether to redirect HTTP to HTTPS (yes)

Certbot automatically modifies your Nginx config to include SSL certificates.

### Step 3: Verify Auto-Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot auto-renews via systemd timer — verify it's active:
sudo systemctl status certbot.timer
```

---

## 12. Process Manager (PM2)

PM2 keeps your CMS running, auto-restarts on crashes, and manages logs.

### Step 1: Install PM2

```bash
npm install -g pm2
```

### Step 2: Create PM2 Ecosystem File

```bash
nano /var/www/cms/ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'cms',
    cwd: '/var/www/cms',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },

    // Restart policy
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 4000,

    // Logging
    error_file: '/var/www/cms/logs/error.log',
    out_file: '/var/www/cms/logs/output.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,

    // Memory limit — restart if exceeded
    max_memory_restart: '500M',

    // Watch for file changes (disabled in production)
    watch: false,
  }]
};
```

### Step 3: Create Logs Directory

```bash
mkdir -p /var/www/cms/logs
```

### Step 4: Start the CMS

```bash
cd /var/www/cms
pm2 start ecosystem.config.js
```

### Step 5: Set PM2 to Start on Boot

```bash
pm2 startup systemd
# PM2 will print a command — copy and run it (it requires sudo)
# Example: sudo env PATH=$PATH:/home/cmsadmin/.nvm/versions/node/v20.x.x/bin pm2 startup systemd -u cmsadmin --hp /home/cmsadmin

# Save the current process list
pm2 save
```

### Useful PM2 Commands

```bash
pm2 status          # Check if CMS is running
pm2 logs cms        # View live logs
pm2 logs cms --lines 100  # View last 100 log lines
pm2 restart cms     # Restart the CMS
pm2 stop cms        # Stop the CMS
pm2 reload cms      # Zero-downtime reload
pm2 monit           # Live monitoring dashboard
```

---

## 13. Firewall Configuration

### Using UFW (Ubuntu's Firewall)

```bash
# Enable UFW
sudo ufw enable

# Allow SSH (IMPORTANT — do this first or you'll lock yourself out!)
sudo ufw allow OpenSSH

# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'

# Block direct access to Node.js port (only accessible via Nginx)
sudo ufw deny 3000

# Check status
sudo ufw status
```

Expected output:

```
Status: active

To                         Action      From
--                         ------      ----
OpenSSH                    ALLOW       Anywhere
Nginx Full                 ALLOW       Anywhere
3000                       DENY        Anywhere
```

### Additional Hardening

```bash
# Install fail2ban (auto-blocks IPs with too many failed SSH attempts)
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Check fail2ban status
sudo fail2ban-client status sshd
```

---

## 14. Backup Configuration

### Automated Backups

With `BACKUP_ENABLED=true` in your `.env`, the CMS automatically creates daily backups. Verify the backup directory:

```bash
ls -la /var/www/cms/backups/
```

### Off-Server Backup (Recommended)

Even with local backups, you should copy them off the server. Simple approach with cron + rsync:

```bash
# On your LOCAL machine, set up a cron job:
crontab -e
```

Add:

```
# Pull CMS backups daily at 4 AM local time
0 4 * * * rsync -avz cmsadmin@YOUR_SERVER_IP:/var/www/cms/backups/ ~/cms-backups/
```

### Manual Backup

You can also trigger a backup from the admin panel at `/admin/settings/backups`, or via the command line:

```bash
# Manual database backup
cd /var/www/cms
sqlite3 data/cms.db ".backup backups/manual-$(date +%Y%m%d-%H%M%S).db"

# Full backup (database + uploads)
tar -czf backups/full-$(date +%Y%m%d-%H%M%S).tar.gz data/ uploads/ content/
```

---

## 15. First Run & Admin Setup

### Step 1: Visit the Admin Panel

Open your browser and navigate to:

```
https://yourdomain.com/admin
```

### Step 2: Setup Wizard

On first run (empty database with no users), you'll see a setup wizard:

1. **Create Admin Account**
   - Enter your name, email, and a strong password (12+ characters)
   - Or click "Sign in with Google" to use OAuth for the first account

2. **Site Settings**
   - Site name
   - Site URL (should match `SITE_URL` in `.env`)
   - Timezone

3. **Done!**
   - You're redirected to the admin dashboard

### Step 3: Verify Core Features

Test each feature to make sure everything is wired up:

| Feature | How to Test |
|---|---|
| Page creation | Create a test page with a few blocks → Publish → View on public site |
| Blog post | Create a post with featured image, category, tags → Publish |
| Media upload | Upload an image → Check that variants (thumb, medium, large, WebP) are generated in `/uploads/` |
| Navigation | Edit the main menu → Add pages → Check the public site navigation |
| SEO | Fill in SEO fields on a page → Inspect page source for meta tags |
| Contact form | Add a contact form block → Submit on public site → Check admin Forms tab + email |
| GitHub sync | Edit a page → Check GitHub repo for new commit |
| Preview | Edit a draft → Click Preview → Check all 3 device sizes |
| Search | Use the admin global search → Verify it finds pages, posts, and media |
| Sitemap | Visit `https://yourdomain.com/sitemap.xml` |

---

## 16. Deploying Updates

### When You Push Code Changes

```bash
# On your local machine:
git add .
git commit -m "feat: add new block type"
git push origin main
```

### On the Server (Manual Deploy)

```bash
ssh cmsadmin@YOUR_SERVER_IP
cd /var/www/cms

# Pull latest code
git pull origin main

# Install any new dependencies
npm install

# Rebuild
npm run build

# Run migrations (if schema changed)
npx drizzle-kit push

# Restart
pm2 restart cms
```

### Automated Deploy Script

Create a deploy script to simplify this:

```bash
nano /var/www/cms/deploy.sh
```

```bash
#!/bin/bash
set -e

echo "==> Pulling latest code..."
git pull origin main

echo "==> Installing dependencies..."
npm install

echo "==> Running migrations..."
npx drizzle-kit push

echo "==> Building..."
npm run build

echo "==> Restarting..."
pm2 restart cms

echo "==> Deploy complete!"
pm2 status
```

```bash
chmod +x deploy.sh

# Run deployment:
./deploy.sh
```

### Auto-Deploy via GitHub Webhook

If you enabled `GITHUB_PULL_AUTO=true` and `GITHUB_PULL_RESTART_ON_CODE=true`, code pushes to GitHub will automatically trigger a pull and restart. Monitor via:

```bash
pm2 logs cms --lines 50
```

---

## 17. Setting Up a New Client Site

Quick checklist for spinning up a new CMS instance for a client:

```bash
# 1. Provision a new VPS (or use a subdomain on existing server)

# 2. Follow Sections 3-14 above

# 3. Clone the repo
git clone git@github.com:YOUR_USERNAME/YOUR_CMS_REPO.git /var/www/clientname

# 4. Configure .env with client-specific values:
#    - SITE_URL, SITE_NAME
#    - NEXTAUTH_SECRET (generate new!)
#    - CSRF_SECRET (generate new!)
#    - SMTP settings (client's email)
#    - New GitHub repo for this client

# 5. Set up database
cd /var/www/clientname
npx drizzle-kit push

# 6. Build
npm run build

# 7. Configure Nginx for client domain

# 8. Set up SSL

# 9. Start with PM2
pm2 start ecosystem.config.js --name "clientname"
pm2 save

# 10. Create admin account at https://clientdomain.com/admin

# 11. Import from WordPress (if migrating)
#     Admin → Import → WordPress → Upload WXR file

# 12. Set up page templates and initial content

# 13. Hand off to client with their login credentials
```

---

## 18. Troubleshooting

### CMS Won't Start

```bash
# Check PM2 logs
pm2 logs cms --lines 100

# Check if port 3000 is already in use
sudo lsof -i :3000

# Check Node.js version
node --version   # Must be 18.17+

# Check if database file exists and has correct permissions
ls -la data/cms.db   # Should be -rw------- (600)

# Try starting manually to see errors
cd /var/www/cms
NODE_ENV=production npm start
```

### 502 Bad Gateway (Nginx)

```bash
# Check if the CMS process is running
pm2 status

# Check Nginx error log
sudo tail -50 /var/log/nginx/error.log

# Verify Nginx can reach port 3000
curl http://127.0.0.1:3000
```

### Database Locked Error

```bash
# Check for stuck processes
fuser data/cms.db

# Verify WAL mode is enabled
sqlite3 data/cms.db "PRAGMA journal_mode;"

# If corrupt, restore from backup
cp backups/latest/database/cms.db data/cms.db
pm2 restart cms
```

### Images Not Processing (Sharp Errors)

```bash
# Reinstall sharp with correct binaries
npm rebuild sharp

# If that fails, remove and reinstall
rm -rf node_modules/sharp
npm install sharp
```

### GitHub Push Failing

```bash
# Test SSH connection
ssh -T git@github.com

# Check git config
cd /var/www/cms
git remote -v
git config user.email
git config user.name

# Try manual push
git add content/
git commit -m "test"
git push origin main
```

### Email Not Sending

```bash
# Test SMTP connection
node -e "
const net = require('net');
const s = net.connect(587, 'smtp.gmail.com');
s.on('connect', () => { console.log('SMTP reachable'); s.end(); });
s.on('error', (e) => console.error('SMTP unreachable:', e.message));
"

# Check firewall allows outbound port 587
sudo ufw status
```

### High Memory Usage

```bash
# Check memory
pm2 monit

# If SQLite cache is too large, reduce in PRAGMA
# Edit lib/db/index.ts: PRAGMA cache_size = -32000  (32MB instead of 64MB)

# Restart
pm2 restart cms
```

---

## 19. Maintenance Checklist

### Weekly

- [ ] Check `pm2 status` — CMS running without issues
- [ ] Review admin activity log for unusual activity
- [ ] Check disk space: `df -h`
- [ ] Glance at error logs: `pm2 logs cms --err --lines 50`

### Monthly

- [ ] Update system packages: `sudo apt update && sudo apt upgrade`
- [ ] Update Node dependencies: `npm audit` then `npm update`
- [ ] Check SSL certificate expiry: `sudo certbot certificates`
- [ ] Verify backups are running: `ls -la backups/`
- [ ] Test a backup restore on a staging environment
- [ ] Review and clean up form submissions in admin panel
- [ ] Check redirect hit counts — remove unused redirects

### Quarterly

- [ ] Review and update Node.js LTS version
- [ ] Review security headers with https://securityheaders.com
- [ ] Full security audit: check `npm audit`, review dependencies
- [ ] Performance check: test page load speeds
- [ ] Review database size: `du -h data/cms.db`
- [ ] Clean up unused media in the media library

---

## 20. Uninstalling / Removing

If you need to completely remove the CMS from a server:

```bash
# Stop the CMS
pm2 stop cms
pm2 delete cms
pm2 save

# Remove Nginx config
sudo rm /etc/nginx/sites-enabled/cms
sudo rm /etc/nginx/sites-available/cms
sudo systemctl reload nginx

# Remove SSL certificate (optional)
sudo certbot delete --cert-name yourdomain.com

# Remove application files
sudo rm -rf /var/www/cms

# Remove backups (if you've already copied them off-server)
# Double-check before running this!
```

**Before removing:** Make sure you've exported/backed up:
- The database (`data/cms.db`)
- All uploaded media (`uploads/`)
- The `.env` file (contains all configuration)
- The Git repository (should already be on GitHub)

---

## Quick Reference Card

```
Project directory:    /var/www/cms
Database:             /var/www/cms/data/cms.db
Uploads:              /var/www/cms/uploads/
Backups:              /var/www/cms/backups/
Logs:                 /var/www/cms/logs/
Environment:          /var/www/cms/.env
Nginx config:         /etc/nginx/sites-available/cms
SSL certificates:     /etc/letsencrypt/live/yourdomain.com/

Start:                pm2 start cms
Stop:                 pm2 stop cms
Restart:              pm2 restart cms
Logs:                 pm2 logs cms
Deploy:               ./deploy.sh
Manual backup:        sqlite3 data/cms.db ".backup backups/manual.db"
```
