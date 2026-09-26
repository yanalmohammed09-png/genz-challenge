# GEN Z CHALLENGE

A real, working web app for the Gen Z laptop brand: a branded arcade game,
one-time customer links, server-side score validation, discount code
generation, and a protected admin dashboard — backed by a persistent
Postgres database (Supabase).

This is a genuine Next.js project. Nothing in it is mocked: the database
writes are real, the token system is real, the admin auth is real. You do
need to deploy it (15–20 minutes, steps below) — I can't provision a live
database or a public URL from inside this chat.

## 1. Create the database (Supabase — free tier is enough to start)

1. Go to supabase.com → New Project.
2. Once it's created, open **SQL Editor** → paste the contents of
   `supabase/schema.sql` → Run. This creates every table (`game_sessions`,
   `discount_codes`, `settings`, `admins`) plus default discount levels and
   game difficulty config.
3. Go to **Settings → API** and copy the **Project URL** and the
   **service_role key** (not the anon key — the app never uses the anon
   key, so Row Level Security stays locked to the server only).

## 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — from step 1.
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — your admin login.
- `ADMIN_JWT_SECRET` — any long random string (e.g. `openssl rand -hex 32`).
- `NEXT_PUBLIC_BASE_URL` — your future public domain.

## 3. Run locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000/admin/login`, sign in, click **Game Links →
Create New Game Link**, then **Open** to play the game end-to-end against
your real database.

## 4. Deploy for real

The simplest path: push this folder to a GitHub repo, then import it into
**Vercel** (vercel.com) and paste the same environment variables into the
Vercel project settings. Vercel gives you a public HTTPS URL immediately;
attach your own domain afterward if you'd like `play.genz.jo`-style links.

## How the one-time link / anti-cheat system works

- Each link (`/play/<token>`) maps to one row in `game_sessions`. Status
  moves `unused → active → completed`, and once `completed` the link can
  never be replayed — the play page and the session/submit API both check
  this server-side, not just in the UI.
- `POST /api/game/session` stamps `started_at` **once** (first activation
  only) and records IP + device/browser as fraud-prevention signals.
- `POST /api/game/submit` recomputes elapsed time from the server's own
  clock (not the value the browser sends), rejects an impossible duration,
  and clamps the submitted score to a server-computed plausibility ceiling
  based on your game-config difficulty settings — so a tampered
  `score = 999999` can't pay out more than the game could honestly produce
  in that amount of time. The discount and discount code are only created
  after this check passes, and the session is marked `completed` in the
  same request, which blocks duplicate submissions and multi-tab replay.

**Honest limitation:** this is a strong, practical anti-cheat for a
promotional campaign, not a fully server-authoritative game engine (where
literally every obstacle and jump is simulated on the server). Building
that would be a much larger project. If Gen Z ever needs it airtight
against a technically sophisticated attacker, that's the next upgrade —
happy to help with it.

## What's simplified in this first pass

- **PDF export** isn't wired up yet (CSV export is, from Game Records).
  Adding PDF (e.g. via a small serverless function with a PDF library) is
  a quick follow-up.
- **Sound** uses simple generated tones (Web Audio beeps) rather than
  custom sound files, so there's nothing to license or host — swap in your
  own `.mp3`s in `components/GameCanvas.jsx` if you'd like branded audio.
- The **admins** table exists in the schema for multi-admin support, but
  login currently checks the single `ADMIN_EMAIL`/`ADMIN_PASSWORD` env pair
  for simplicity. Wiring login to the `admins` table (with hashed
  passwords) is a small addition if you need multiple admin users.

## Project structure

```
app/
  page.js                  landing page
  play/[token]/             customer game flow (token validation + game)
  admin/                    dashboard, links, records, discounts, settings
  api/game/session          activates a one-time session
  api/game/submit           server-side score validation + discount code
  api/admin/*               admin CRUD + stats
components/GameCanvas.jsx   the original arcade game (Canvas, no Phaser dep)
lib/                        supabase client, token/discount utils, admin auth
supabase/schema.sql         full DB schema
middleware.js                protects /admin and /api/admin
```
