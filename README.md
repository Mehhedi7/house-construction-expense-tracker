# House Construction Expense Tracker 🏠

A modern, minimal, mobile-first web app to track house construction expenses by category in Bangladeshi Taka (৳). Built with Next.js 14 (App Router), Tailwind CSS, TypeScript, and Supabase.

---

## 🚀 Features

- **Bangladeshi Taka (৳) Display**: Large formatted total spent (`৳ 0.00` format with thousand separators and 2 decimal points).
- **Preset Construction Categories**:
  - Land & Registration 🏞️
  - Design & Approval 📋
  - Foundation 🏗️
  - Bricks & Masonry 🧱
  - Cement & Sand ⏳
  - Rod & Steel 🔩
  - Labor Wages 👷‍♂️
  - Electrical ⚡
  - Plumbing & Sanitary 🚿
  - Tiles & Flooring 🪵
  - Doors & Windows 🚪
  - Paint & Finish 🎨
  - Furniture & Fixtures 🛋️
  - Transport 🚚
  - Miscellaneous 📦
- **Category Accordion**: Grouped expenses with expandable category cards showing entry dates, notes, and amounts.
- **Supabase Authentication**: Secure email & password login/sign-up screen with automatic session routing.
- **Row Level Security (RLS)**: Users can only see, create, edit, and delete their own expenses.
- **Full CRUD Support**: Add new expenses via floating `+` button (bottom sheet on mobile, modal on desktop), inline editing, and deletion with confirmation dialog.
- **Modern Minimal UI**: Off-white background, charcoal typography, deep green accent (`#166534`), soft shadows, and smooth transitions.

---

## 🛠️ Supabase Setup Instructions

1. Open your [Supabase Project Dashboard](https://supabase.com/dashboard).
2. Go to **SQL Editor** in the left sidebar.
3. Click **New query** and paste the contents of `supabase/schema.sql`.
4. Click **Run** to execute the script. This creates:
   - `expenses` table with RLS policies
   - `categories` table with preset categories seeded
   - Proper permissions for authenticated users
5. Go to **Authentication → Providers → Email**:
   - Ensure Email provider is enabled.
   - If you want immediate sign-in without waiting for email verification, toggle **Confirm email** off (or keep it on if you prefer email confirmations).

---

## ⚙️ Environment Variables (Vercel & Local)

Add the following environment variables to your Vercel project (**Settings → Environment Variables**) and in a local `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

You can find both values in your Supabase dashboard under **Project Settings → API**.

---

## 🚢 How to Deploy to Vercel

Since your repository is linked with Vercel:

1. Commit and push the changes to GitHub:
   ```bash
   git add .
   git commit -m "Fix Tailwind styling, add Supabase Auth, category grouping, and Add Expense modal"
   git push origin main
   ```
2. Vercel will automatically trigger a new deployment for `main`.
3. Ensure the environment variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are saved in Vercel.
4. If needed, click **Redeploy** on the latest deployment in the Vercel dashboard.
