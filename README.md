# House Construction Expense Tracker

A personal web app for tracking daily expenses while building a house. Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase** for authentication and data storage. Deploys to Vercel.

## Table of Contents
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Supabase Setup](#supabase-setup)
- [Local Development](#local-development)
- [Deployment to Vercel](#deployment-to-vercel)
- [Project Structure](#project-structure)
- [Design & UI](#design--ui)
- [License](#license)

---

## Tech Stack
- **Framework**: Next.js 14 (App Router) – TypeScript
- **Styling**: Tailwind CSS
- **Auth & Database**: Supabase (PostgreSQL) – password‑less email magic link
- **Hosting**: Vercel (any Next.js‑compatible host works)
- **Utilities**: dayjs, classnames, heroicons, framer‑motion (for animations)

---

## Prerequisites
- **Node** ≥ 20 (pnpm recommended)
- **Git**
- A **Supabase** account (free tier works)
- A **Vercel** account (for deployment)

---

## Supabase Setup
1. **Create a new project** at https://app.supabase.com.
2. **Enable Magic‑Link email authentication**:
   - Go to **Authentication → Settings** → enable *Email confirmations* and *Passwordless*.
3. **Run the migration**:
   - In Supabase console, open **SQL → New migration**.
   - Paste the contents of `supabase/migrations/20231119_init.sql` (included in this repo) and click **Run**.
4. **Copy the project URL and anon key** – you’ll need them for the `.env` file.

---

## Local Development
```bash
# 1. Clone the repo (or copy the folder you receive)
git clone <repo‑url>
cd house-construction-expense-tracker

# 2. Install dependencies
pnpm install   # or npm install / yarn install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local and fill in your Supabase URL and anon key

# 4. Run the dev server
pnpm dev
# Open http://localhost:3000 in your browser
```

The app will open on the login page. Use any email address – Supabase will send you a magic link.

---

## Deployment to Vercel
1. Push the code to a Git repository (GitHub, GitLab, etc.).
2. In the Vercel dashboard, click **New Project** → **Import Git Repository**.
3. Vercel auto‑detects the Next.js framework. Set the following **Environment Variables** (same values you placed in `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**. Once the build finishes you’ll get a live URL (e.g., `https://your‑project.vercel.app`).

> **Note:** No server‑side secrets are needed for the front‑end; all DB operations are performed client‑side via Supabase RLS policies.

---

## Project Structure
```
house-construction-expense-tracker/
│
├─ app/                     # Next.js App Router
│   ├─ layout.tsx           # Global layout + Supabase session provider
│   ├─ login/
│   │   └─ page.tsx        # Email‑only login page
│   └─ dashboard/
│       └─ page.tsx        # Protected dashboard UI
│
├─ components/              # Re‑usable UI components
│   ├─ Header.tsx
│   ├─ SummaryCards.tsx
│   ├─ CategorySection.tsx
│   ├─ ExpenseForm.tsx
│   ├─ Filters.tsx
│   └─ ProtectedRoute.tsx
│
├─ hooks/                   # Custom React hooks
│   └─ useExpenses.ts
│
├─ lib/                     # Utility libraries
│   └─ supabaseClient.ts
│
├─ public/                  # Static assets (favicon, etc.)
│
├─ supabase/
│   └─ migrations/
│       └─ 20231119_init.sql   # DB schema + RLS + seed trigger
│
├─ styles/
│   └─ globals.css          # Tailwind imports + base styles
│
├─ tailwind.config.ts       # Tailwind custom colors & fonts
├─ tsconfig.json
├─ next.config.js
├─ package.json
├─ .env.example
└─ README.md
```

---

## Design & UI
- **Palette**: Off‑white background (`#fafafa`), charcoal text (`#212121`), accent deep‑green (`#2e7d32`).
- **Fonts**: `Inter` (Latin) and `Noto Sans Bengali` (Bengali) via Google Fonts.
- **Responsive**: Mobile‑first layout, large tap targets, fluid grid.
- **Micro‑interactions**: `framer-motion` for collapsible cards, modal fade‑ins, button hover states.
- **Currency**: Bengali “৳” symbol, numbers formatted with thousand separators; a toggle can switch between Bengali and English digits (default English).

---

## License
MIT © 2026 Your Name

---

Feel free to open any of the files in the `house-construction-expense-tracker` folder to see the full implementation. Let me know if you’d like any specific file generated next (e.g., `package.json`, `tailwind.config.ts`, a component, etc.).
