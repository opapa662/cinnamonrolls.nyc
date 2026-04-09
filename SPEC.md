# SPEC.md — Project Specification

<!-- Single source of truth. Top = product. Bottom = technical. -->

---

## Brand

- **Site name:** cinnamonrolls.nyc
- **Tagline:** the ultimate map of the city's best swirls
- **Page title:** cinnamonrolls.nyc - the ultimate map of the city's best swirls
- **Domain:** https://cinnamonrolls.nyc (live, Vercel + Squarespace DNS)
- **Instagram:** @cinnamonrolls.nyc

---

## Problem

There's no single, visual resource for finding cinnamon rolls across New York City. Lists exist (The Infatuation, The Carboholic, etc.) but they're text-based articles — you can't see where spots are relative to you or to each other. If you're in a neighborhood and craving a cinnamon roll, you're Googling, scrolling articles, and cross-referencing addresses. It should be one glance at a map.

## Solution

An interactive map of NYC showing every great cinnamon roll spot in the city. You open the site, see all the pins, click one, and get a branded popup card with the bakery details. The map auto-fits to show all locations. It's fast, beautiful, mobile-first, and dead simple.

## Target User

NYC residents and visitors who love cinnamon rolls and want to find the best ones nearby. Food-curious people who browse lists like The Infatuation. Mobile-first — most users will be on their phones, possibly walking around a neighborhood looking for a spot.

---

## What's Built

### Core map experience
- Full-screen Mapbox map of NYC (`light-v11` style)
- Custom SVG cinnamon roll pins (44×44px tap targets)
- Auto-fit bounds on load (all pins visible)
- Click pin → popup card: neighborhood/borough header, name, type + rating + days meta, address (Google Maps link), notes, "Featured by" tags, website + Instagram links + "View details →" link
- Popup links: website, Instagram, Google Maps (via `place_id`)
- Warm palette: `--cr-cream` (#FFF8F0), `--cr-brown` (#8B4513), `--cr-brown-dark`

### Sidebar + mobile
- Desktop: 400px sidebar with location list, search, save, nearby, Surprise Me
- Mobile: bottom sheet (peek/collapse/expand) + action bar
- Search & filter panel: name, borough, neighborhood, type, open-on-day, min rating
- Save / heart locations (persisted to `localStorage`)
- Nearby mode: geolocation → shows closest spots with distances, expanding radii (1/2/5 miles)
- "Surprise Me" — random location

### SEO pages
- `/locations/[slug]` — individual bakery pages with hours, rating, notes, links
- `/boroughs/[slug]` — borough-level pages (Manhattan, Brooklyn, Queens, Bronx, Staten Island)
- `/neighborhoods/[slug]` — neighborhood-level pages with cross-linking
- `sitemap.xml` — dynamic, includes all location/borough/neighborhood pages
- `robots.txt` — auto-generated
- Open Graph, Twitter Card, canonical URL in layout metadata

### Submission forms
- `/submit` — "Add a new spot" + "Suggest an edit" forms → `submissions` table
- `/about` — brand story + contact form → `contact_submissions` table
- Email notifications on new submissions via Resend → `papa.olivia@gmail.com`
- Honeypot spam protection on contact form

### Admin dashboard
- `/admin-opdl-stfrancis` — password-protected (cookie auth via `ADMIN_TOKEN`)
- Tabs: Submissions, Contacts, Locations, Analytics
- Approve/reject submissions, activate/deactivate locations
- Analytics tab: sessions (7d/30d), top pins clicked, top location pages, device split, outbound clicks

### Analytics
- GA4 (G-4V3HK9T6VT) via direct `gtag()` (no GTM)
- Supabase `analytics_events` table — fire-and-forget event log
- Session ID (sessionStorage UUID), UTM capture, web vitals (CLS/INP/LCP/FCP/TTFB)
- 22 tracked events: session_start, map_loaded, pin_clicked, popup_opened, popup_closed, popup_link_clicked, map_zoomed, map_panned, map_bounds_changed, map_style_error, geolocation_requested, geolocation_success, geolocation_denied, outbound_click, location_page_viewed, location_to_map_nav, card_clicked, surprise_me_clicked, saved_mode_toggled, search_opened, filter_applied, client_error, web_vital
- Error boundary → `error_logs` table
- `OutboundLink` component fires `outbound_click` on all external links

### Infrastructure
- ISR: homepage + SEO pages revalidate every hour (`revalidate = 3600`)
- Admin dashboard: `revalidate = 0` (always fresh)
- Security headers in `next.config.ts`: CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy

---

## Non-Goals (still out of scope)

- User accounts / login
- Community reviews or user-submitted ratings
- Individual spot photos
- Pricing data displayed
- Expansion to other cities
- Editorial blog content

---

## Technical Architecture

### Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js 16 (App Router, TypeScript strict, Tailwind CSS 4) | Vercel-native, ISR for SEO, API routes for backend |
| Map | Mapbox GL JS | Custom SVG pins, smooth vector tiles, popup API |
| Database | Supabase (Postgres) | Dashboard for data management, REST API, webhooks |
| Hosting | Vercel | Edge CDN, automatic ISR, one-command deploys |
| Email | Resend | Zero-config transactional email, no domain verification needed via `onboarding@resend.dev` |
| Analytics | GA4 + GTM + Supabase | Event-level detail in Supabase, GA4 for standard reporting |

### Architecture overview

```
[Vercel / Next.js App Router]
  ├── Server components → fetch from Supabase at build/revalidate time
  ├── Client components → Mapbox GL JS, interactive UI
  └── API routes → admin actions, form submissions, email notifications

[Supabase Postgres]
  ├── locations        — bakery data (56 active spots)
  ├── submissions      — user-submitted additions + edits
  ├── contact_submissions — contact form messages
  ├── analytics_events — event log (session_start, pin_clicked, etc.)
  └── error_logs       — client-side error log

[Mapbox GL JS]  — map rendering, custom pins, popups (client-side only, ssr:false)
[GTM + GA4]     — standard analytics reporting
[Resend]        — email notifications to papa.olivia@gmail.com
```

---

## Data Model

### `locations` table

| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| name | text | Bakery/restaurant name (e.g., "Bakeri") |
| display_name | text | Location-specific name for popup (e.g., "Bakeri — Greenpoint"). Falls back to `name` if null. |
| latitude | float | GPS latitude |
| longitude | float | GPS longitude |
| neighborhood | text | Neighbourhood name (e.g., "Park Slope") |
| borough | text | NYC borough (e.g., "Brooklyn") |
| source | text | **Internal only** — where we discovered the spot. Never displayed. |
| mentions | text[] | Publications/media that featured this spot. Drives "Featured by" tags on popup. Established outlets only — no social handles. |
| notes | text | Displayed on popup card (e.g., "Saturdays only") |
| review | text | Internal review notes. Not displayed. |
| location_type | text | Sentence case: Bakery, Café, Kiosk, Market, Pop-up, Restaurant |
| website | text | Full URL — shown as link on popup + location page |
| instagram | text | Handle (with or without @) — shown as link on popup + location page |
| days_open | text | Free-text (used for sidebar filter fallback, e.g., "Mon–Sat") |
| google_place_id | text | Google Places ID — used to link rating to Google Maps |
| google_rating | float | Google rating (e.g. 4.6) — shown with 1 decimal place |
| google_review_count | integer | Google review count |
| google_hours | jsonb | `{ weekday_text: string[] }` — shown on location pages |
| status | text | `"active"` or `"closed"` — defaults to `"active"` |
| created_at | timestamp | Auto-generated |
| updated_at | timestamp | Auto-generated |

**Multi-location bakeries:** Each physical location is a separate row. Use `display_name` to distinguish (e.g., "Winner - Windsor Terrace", "Winner - Prospect Heights"). Always use a hyphen (`-`) as separator — never an em dash.

**`source` vs `mentions`:** `source` is internal-only, never wired to UI. `mentions` drives "Featured by" tags on the popup card and location pages.

---

## Data Management

### Seeding new locations

1. Insert a row in Supabase Table Editor
2. Required: `name`, `latitude`, `longitude`, `status = 'active'`
3. Verify coordinates on Google Maps before inserting (paste `lat,lng` into search bar)
4. For multi-location spots, create one row per physical location with a unique `display_name`
5. Run the enrichment script to pull Google Places data

### Google Places enrichment

**Script:** `scripts/enrich-google-places.ts`
**Run:** `npx tsx --env-file=.env.local scripts/enrich-google-places.ts`

Uses **Google Places Nearby Search** (`rankby=distance`) — NOT text search. Ranks by distance from the stored coordinates, ensuring the correct branch is matched for multi-location spots. Saves `google_place_id`, `google_rating`, `google_review_count`, `google_hours` **incrementally** (one row at a time — no data loss on failure).

**After running, QA in Supabase SQL Editor:**
```sql
select name, google_rating, google_hours->'weekday_text' as hours
from locations where status = 'active' order by name;
```

**Manual fix if wrong place matched:**
```sql
update locations set
  google_place_id = '<correct_place_id>',
  google_rating = <rating>,
  google_hours = '<hours_json>'::jsonb
where name = '<location name>';
```

### Migrations

All schema changes live in `supabase/migrations/` as append-only SQL files. Run manually in Supabase SQL Editor (Database → SQL Editor → New query).

| Migration | What it does |
|---|---|
| `001_create_locations.sql` | Creates `locations` table with RLS + public read policy |
| `002_google_places.sql` | Adds `google_place_id`, `google_rating`, `google_hours` |
| `003_google_review_count.sql` | Adds `google_review_count` |
| `004_review.sql` | Adds internal `review` text column |
| `005_submissions.sql` | Creates `submissions` + `contact_submissions` tables |
| `006_submissions_status.sql` | Adds `status` + `reviewed_at` to `submissions` |
| `006_analytics.sql` | Creates `analytics_events` + `error_logs` tables with insert-only RLS |

---

## External Integrations

| Service | Purpose | Key |
|---|---|---|
| Mapbox GL JS | Map rendering, pins, popups (client-side) | `NEXT_PUBLIC_MAPBOX_TOKEN` |
| Supabase | Database, REST API, webhooks | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| Google Places API | Enrichment script only (not called at runtime) | `GOOGLE_PLACES_API_KEY` |
| Resend | Email notifications on form submissions | `RESEND_API_KEY` |
| GA4 | Standard analytics reporting | `NEXT_PUBLIC_GA4_MEASUREMENT_ID` |

**Supabase webhooks:**
- `submissions` table → `POST https://cinnamonrolls.nyc/api/notify?secret=<NOTIFY_WEBHOOK_SECRET>`
- `contact_submissions` table → same endpoint

---

## Environment Setup

```bash
# Prerequisites
Node.js >= 18, Git, Vercel account, Supabase account, Mapbox account

# Install
npm install

# Run
npm run dev

# Deploy
vercel --prod --yes
```

**All required env vars:**
```
NEXT_PUBLIC_MAPBOX_TOKEN=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_TOKEN=
GOOGLE_PLACES_API_KEY=
RESEND_API_KEY=
NOTIFY_WEBHOOK_SECRET=
NEXT_PUBLIC_GA4_MEASUREMENT_ID=
```

---

## Protected Files

```
.env.local                  — secrets (never commit)
supabase/migrations/        — schema, append-only
scripts/seed.ts             — seed data, modify only with approval
app/admin-opdl-stfrancis/   — admin dashboard, security-sensitive
```

---

## Design Reference

- **Inspiration:** pooltables.nyc (map-first, single-item, sidebar pattern), everythingiseverything.nyc (single-food NYC map, press-worthy)
- **Palette:** `--cr-cream` (#FFF8F0), `--cr-brown` (#8B4513), `--cr-brown-dark` (#3D1C02), `--cr-brown-mid` (muted brown for secondary text)
- **Pin icon:** Custom SVG cinnamon roll, 44×44px tap target
- **Font:** Inter throughout (including popup cards — reference by name `'Inter', sans-serif` in raw HTML strings, CSS variables don't work inside Mapbox popup HTML)
- **Map style:** `mapbox://styles/mapbox/light-v11`
- **Sidebar width:** 400px desktop
- **Zoom on click:** 14

---

## Edge Cases

**Closed bakeries:** Use `status = 'inactive'` — don't delete. The map filters to `status = 'active'` only.

**Pop-up / irregular spots:** Normal pin. Use `notes` field to communicate availability (e.g., "Available Saturdays only").

**Multi-location brands on SEO pages:** `/locations/[slug]` groups all rows with the same name slug. Each branch renders as a separate card with its own neighbourhood, rating, and hours.

**Overlapping pins:** Several East Village spots cluster together at low zoom. Mapbox handles click priority natively.

**Supabase unavailable:** Map loads with no pins — graceful degradation, no broken UI.

---

## Growth Strategy

**SEO (in progress):**
- Individual bakery pages (`/locations/[slug]`) ✅
- Borough pages (`/boroughs/[slug]`) ✅
- Neighborhood pages (`/neighborhoods/[slug]`) ✅
- JSON-LD structured data (FoodEstablishment) ✅

**Press & buzz:**
- "Everything is Everything" playbook: passion project + visual hook = press
- Target: TimeOut, Eater, Gothamist, PIX11
- NYC food subreddits, TikTok, Instagram

**Bakery relationships:**
- External links to bakeries create goodwill and potential backlinks
- "Suggest a spot" form turns community into contributors
- Future: bakeries claim their listing

---

## Competitive Landscape

| Project | What It Is | What We Learned |
|---|---|---|
| pooltables.nyc | Interactive map of 450+ pool tables | Map-first UX, single-item focus |
| everythingiseverything.nyc | 200+ bagels ranked across 5 boroughs | Single-food NYC maps earn major press |

**Our edge:** No one owns the cinnamon roll map. We aggregate what's fragmented across 10+ articles into one visual resource.
