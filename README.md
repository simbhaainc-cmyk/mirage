# MIRAGE — AI Video & Image Studio

Turn words into cinema. A complete, monetization-ready AI generation product:
image + video rendering studio, credit economy, subscription plans, auth,
community gallery and a dashboard with a full credit ledger.

## What's inside

| Area | What it does |
| --- | --- |
| **Landing page** (`/`) | Cinematic hero, capability marquee, feature deep-dives, live community showcase, pricing, FAQ |
| **Studio** (`/studio`) | Prompt box, Image/Video modes, 8 style presets, 8 camera moves, 5 frame ratios, seed locking, live render progress, history strip, PNG download, **real WebM/MP4 video export** (canvas + MediaRecorder) |
| **Gallery** (`/gallery`) | Public render wall, images/videos filter, “Remix this” deep-links straight into the studio |
| **Pricing** (`/pricing`) | 4 tiers with monthly/yearly toggle, credit math per plan, instant (demo) checkout |
| **Auth** (`/signup`, `/login`) | Email + password accounts, scrypt-hashed passwords, 30-day DB sessions, httpOnly cookies |
| **Dashboard** (`/dashboard`) | Stats, credit balance, plan management, render grid (download / publish / delete), full credit ledger |

## The money machine (how credits work)

- Signup grants **25 free credits**
- Image render = **5 credits** · Video render = **20 credits**
- Plans grant monthly credits: Creator 500 · Pro 2,000 · Studio 8,000
- Every credit movement is written to `credit_ledger` (auditable forever)
- When a user hits 0, the studio opens the upgrade modal → `/pricing`

## Go live with real payments

Checkout currently runs in **instant demo mode** so the whole product works out
of the box. To charge real money (Stripe):

1. `npm install stripe`, then set `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`
   in your environment variables.
2. In `src/app/api/checkout/route.ts`, create a Stripe Checkout Session and
   redirect to it instead of activating immediately.
3. In your webhook (on `checkout.session.completed`) call
   `setPlan(userId, planId, credits)` from `src/lib/credits.ts` — the ledger and
   balances handle the rest.

## Publishing (no-code guide)

### Website
Deploy on **Vercel** (free): create an account → “Import project” → connect this
repo → Add the `DATABASE_URL` env var → Deploy. Attach your custom domain in
Project Settings → Domains.

### Google Play + App Store
The app already ships a PWA manifest (`/manifest.webmanifest`) and icon:

1. **Play Store:** use [PWABuilder.com](https://www.pwabuilder.com) → paste your
   live URL → download the Android package → upload to the Play Console
   ($25 one-time developer account).
2. **App Store:** same flow with PWABuilder's iOS package — or wrap the site
   with [Capacitor](https://capacitorjs.com) (`npx cap init` → point to your URL)
   and submit via Xcode (Apple Developer account, $99/yr).

## Tech

Next.js (App Router) · PostgreSQL + Drizzle ORM · Tailwind CSS v4 ·
framer-motion · lucide-react. Image rendering is routed through
`/api/media` (host-allowlisted proxy) so external origins stay private and
canvas exports never hit CORS walls.

## Useful commands

```bash
npm run dev          # local development
npm run build        # production build
npx drizzle-kit push # apply database schema changes
node scripts/seed.mjs# seed the public gallery (idempotent)
```
