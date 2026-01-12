## NewsBlogs

Modern news + blog website built with **Next.js (App Router)** and **Supabase**.

### Features (in-progress)

- **Auth + profiles**: email/password sign up + sign in, user profile page.
- **Posts**: create/edit/delete your articles (rich-text + one image).
- **Social**: like, bookmark, comment, follow users.
- **Tags**: posts have tags; follow tags to get them in your feed.
- **Access**: anonymous users can read a few articles free; sign up to save/read more.

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Configure Supabase env

Copy `env.example` to `.env.local` and fill values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3) Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Supabase SQL schema

Next step is to apply the SQL schema + RLS policies in your Supabase project (I’m adding this in the repo next).

### Tech

- Next.js + React + TypeScript
- Tailwind v4 + shadcn/ui
- Supabase Auth + Postgres + Storage

## Notes

- This repo uses server actions and Supabase RLS so authorization is enforced in the database.
