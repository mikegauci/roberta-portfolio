# Roberta Attard — Portfolio

A self-hosted portfolio website built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, and **Supabase**. Deployed on Vercel.

## Features

- **Public site** — About, Work (project grid), CV pages
- **Admin panel** at `/admin` — edit all content without touching code
- **Password-protected** admin access via cookie
- **Supabase** database for all content (about, projects, CV)

## Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd roberta-portfolio
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Open the SQL editor and run the contents of `supabase/schema.sql`
3. Copy your **Project URL** and **anon key** from Settings → API

### 3. Configure environment variables

Copy `.env.local` and fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ADMIN_PASSWORD=choose-a-secure-password
```

### 4. Run locally

```bash
npm run dev
```

- Portfolio: http://localhost:3000
- Admin: http://localhost:3000/admin

### 5. Deploy to Vercel

1. Push this repo to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Add the 3 environment variables in Vercel project settings
4. Deploy

## Admin Panel

Go to `/admin/login` and enter your `ADMIN_PASSWORD`.

| Section  | What you can edit                      |
| -------- | -------------------------------------- |
| About    | Name, title, bio, photo URL, LinkedIn  |
| Projects | Add/delete/reorder portfolio projects  |
| CV       | Experience, education and skills items |

## Adding project images

For now the site uses image URLs. You can:

- Upload images to Supabase Storage and paste the public URL
- Use any image hosting (Cloudinary, Imgur, etc.)

In the admin → Projects, paste the image URL when adding a project.

## Project structure

```
src/
├── app/
│   ├── page.tsx          # About / home
│   ├── work/page.tsx     # Portfolio grid
│   ├── cv/page.tsx       # CV
│   └── admin/            # Admin panel
│       ├── page.tsx
│       ├── about/
│       ├── projects/
│       └── cv/
├── components/
│   ├── Navbar.tsx
│   └── AdminSidebar.tsx
└── lib/
    ├── supabase.ts
    └── database.types.ts
supabase/
└── schema.sql            # Run this in Supabase SQL editor
```
