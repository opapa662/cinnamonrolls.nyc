# cinnamonrolls.nyc

The ultimate map of NYC's best cinnamon rolls. An interactive map of every great spot across all five boroughs — find one near you, save your favourites, or let us surprise you.

**Live:** https://cinnamonrolls.nyc

---

## Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 16 (App Router, TypeScript, Tailwind CSS 4) |
| Map | Mapbox GL JS |
| Database | Supabase (Postgres) |
| Hosting | Vercel |
| Email | Resend |
| Analytics | GA4 + GTM + Supabase event log |

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Copy `.env.local.example` or set these in Vercel:

```
NEXT_PUBLIC_MAPBOX_TOKEN=           # Mapbox access token
NEXT_PUBLIC_SUPABASE_URL=           # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=      # Supabase anon key (public)
SUPABASE_SERVICE_ROLE_KEY=          # Supabase service role key (server-side only)
ADMIN_TOKEN=                        # Admin dashboard password
GOOGLE_PLACES_API_KEY=              # Google Places API (enrichment script only)
RESEND_API_KEY=                     # Resend email API (submission notifications)
NOTIFY_WEBHOOK_SECRET=              # Supabase webhook secret for /api/notify
NEXT_PUBLIC_GTM_ID=                 # Google Tag Manager container ID
NEXT_PUBLIC_GA4_MEASUREMENT_ID=     # GA4 measurement ID
```

---

## Key Commands

```bash
npm run dev          # dev server on :3000
npm run build        # production build + type check
vercel --prod --yes  # deploy to production
```

### Add a new location

1. Insert a row in Supabase Table Editor (`locations` table, `status = 'active'`)
2. Run the enrichment script to pull Google Places data:
   ```bash
   npx tsx --env-file=.env.local scripts/enrich-google-places.ts
   ```

### Run a migration

Paste the SQL file contents into Supabase → Database → SQL Editor → New query → Run.
Migration files live in `supabase/migrations/`.

---

## Project structure

```
app/                        # Next.js App Router pages
  page.tsx                  # Homepage (map)
  layout.tsx                # Root layout: GTM snippet, fonts, footer, ErrorBoundary
  not-found.tsx             # Custom 404 page
  about/                    # About + contact form
  submit/                   # Add a spot / suggest an edit
  locations/[slug]/         # Individual bakery pages (SEO)
  boroughs/[slug]/          # Borough pages (SEO)
  neighborhoods/[slug]/     # Neighborhood pages (SEO)
  ig-generator/             # Internal tool for generating Instagram content
  admin-opdl-stfrancis/     # Password-protected admin dashboard
  api/notify/               # Webhook endpoint: Supabase → Resend email notifications
  api/auth-ig/              # Instagram auth helper
  api/admin-opdl-stfrancis/ # Admin API routes (submissions, locations, logout)
  sitemap.ts                # Dynamic sitemap (all pages)
  robots.ts                 # robots.txt
  opengraph-image.tsx       # Dynamic OG image

components/
  Map.tsx                   # Mapbox map + pins + popups (core map component)
  MapPageClient.tsx         # Map page state: filters, nearby, saved, search
  Sidebar.tsx               # Desktop sidebar (location list, filters)
  MobileBottomSheet.tsx     # Mobile bottom sheet (same content as sidebar)
  MobileActionBar.tsx       # Mobile action bar (search, nearby, saved, surprise)
  MobileFooter.tsx          # Mobile footer bar (Instagram + About links)
  Footer.tsx                # Desktop footer bar
  SearchPanel.tsx           # Filter panel (name, borough, neighborhood, type, day, rating)
  Header.tsx                # Site header with location count
  ErrorBoundary.tsx         # React error boundary (logs to Supabase error_logs)
  OutboundLink.tsx          # <a> wrapper that fires outbound_click analytics event
  AnalyticsInit.tsx         # Calls initAnalytics() on mount (session_start, web vitals)
  LocationPageTracker.tsx   # Fires location_page_viewed on mount
  BackToMapLink.tsx         # "← Back to map" link that fires location_to_map_nav

lib/
  analytics.ts              # trackEvent(), logError(), initAnalytics(), debounce()
  supabase.ts               # Supabase client (anon key)
  supabase-admin.ts         # Supabase admin client (service role)
  location-slug.ts          # Slug generation for /locations/[slug] URLs

supabase/migrations/        # Append-only SQL schema migrations (001–006)
scripts/                    # One-off enrichment + data fix scripts (not run at runtime)
  seed.ts / seed-batch2-5.ts         # Initial + incremental location seeding
  enrich-google-places.ts            # Pull google_place_id, google_rating, google_hours
  enrich-review-count.ts             # Pull google_review_count
  fix-em-dashes.ts / fix-mentions.ts / fix-places.ts  # Data cleanup scripts
  check-data.ts / check-mentions.ts  # Data QA scripts
  review-plan.py                     # Plan review helper (used in PROCESS.md heavy mode)
tasks/todo.md               # Task tracker, session log, lessons learned
SPEC.md                     # Product + technical specification
PROCESS.md                  # How we work together
```

---

## Docs

- [`SPEC.md`](./SPEC.md) — product spec, data model, architecture
- [`PROCESS.md`](./PROCESS.md) — working process and rules
- [`tasks/todo.md`](./tasks/todo.md) — task tracker, lessons, session log
