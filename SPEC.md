# SPEC.md — Project Specification

<!-- Single source of truth. Top = product. Bottom = technical. Fill out before coding. -->

---

## Brand

- **Site name:** cinnamonrolls.nyc
- **Tagline:** the ultimate map of the city's best swirls
- **Page title:** cinnamonrolls.nyc - the ultimate map of the city's best swirls

---

## Problem

There's no single, visual resource for finding cinnamon rolls across New York City. Lists exist (The Infatuation, The Carboholic, etc.) but they're text-based articles — you can't see where spots are relative to you or to each other. If you're in a neighborhood and craving a cinnamon roll, you're Googling, scrolling articles, and cross-referencing addresses. It should be one glance at a map.

## Solution

An interactive map of NYC showing every great cinnamon roll spot in the city. You open the site, see all the pins, click one, and get a branded popup card with the bakery name. The map auto-fits to show all locations. It's fast, beautiful, mobile-first, and dead simple.

## Target User

NYC residents and visitors who love cinnamon rolls and want to find the best ones nearby. Food-curious people who browse lists like The Infatuation. Mobile-first — most users will be on their phones, possibly walking around a neighborhood looking for a spot.

## Core Use Cases (MVP)

1. As a cinnamon roll lover, I want to see all NYC cinnamon roll spots on a map so I can discover new places to try.
2. As a user on my phone, I want to tap a pin and see the bakery name in a styled card so I know what's there.
3. As a first-time visitor, I want the map to load showing all spots immediately so I can start exploring without any setup.

## Non-Goals (current)

- No community reviews or user-submitted ratings
- No user accounts or login
- No individual spot pages (`/spots/bakery-name`) — P1 next
- No neighborhood or borough pages — P1 next
- No editorial content or blog
- No social sharing
- No visited/tracking functionality
- No pricing data displayed

## Success Metrics

- Site loads and displays all pins correctly on desktop and mobile
- All ~15-20 seed locations are accurate (correct name, correct coordinates)

## Key Assumptions

- Mapbox free tier (50K map loads/month) is sufficient for initial traffic
- Supabase free tier is sufficient for ~20 rows of location data
- The Infatuation and Carboholic lists provide enough quality spots for a compelling MVP
- Users will find value in a map-only experience without reviews or detailed info

---

## Technical Approach

### Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js (React) | Vercel-native, SSR for future SEO, API routes for future backend needs |
| Map | Mapbox GL JS | Highly customizable styling, custom pin icons, smooth vector rendering, free tier sufficient |
| Database | Supabase (Postgres) | Free tier, real dashboard for manual data management, easy API |
| Hosting | Vercel | One-click deploy from GitHub, instant domain swap later, CDN built in |
| Auth | None (MVP) | No user accounts needed yet |

### Architecture

Single-page Next.js app. On load, the app fetches all locations from Supabase via its REST API (or client library). Locations are rendered as custom SVG cinnamon roll markers on a Mapbox map. Clicking a marker shows a branded popup card with the bakery name. No server-side logic beyond serving the page — the app is essentially a static site with a database read.

```
[Vercel / Next.js] → [Supabase Postgres] → location data
        ↓
[Mapbox GL JS] → renders map + custom pins + popup cards
```

### Data Model

**`locations` table:**

| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| name | text | Bakery/restaurant name (e.g., "Bakeri") |
| display_name | text | Location-specific display name for the popup card (e.g., "Bakeri — Greenpoint"). Falls back to `name` if null. |
| latitude | float | GPS latitude |
| longitude | float | GPS longitude |
| neighborhood | text | Neighborhood name (e.g., "Park Slope", "East Village") |
| borough | text | NYC borough (e.g., "Brooklyn", "Manhattan") |
| source | text | Where we learned about this spot (e.g., "The Infatuation", "The Carboholic") — shown as "Featured by" tags on popup |
| notes | text | Displayed on popup card (e.g., "Saturdays only", "Inside Prospect Park Picnic House") |
| location_type | text | Sentence case: Bakery, Café, Kiosk, Market, Pop-up, Restaurant |
| website | text | Full URL — shown as link on popup card |
| instagram | text | Handle (with or without @) — shown as link on popup card |
| days_open | text | Legacy free-text field (used for sidebar filter fallback) |
| google_place_id | text | Google Places ID — used to link rating to Google Maps |
| google_rating | float | Google rating (e.g. 4.6) — shown on popup with 1 decimal place |
| google_hours | jsonb | `{ weekday_text: string[] }` — parsed to "Open daily" / "Mon – Fri" etc. on popup |
| status | text | "active" or "closed" — defaults to "active" |
| created_at | timestamp | Auto-generated |
| updated_at | timestamp | Auto-generated |

_Multi-location bakeries:_ Each physical location is a separate row. Use `display_name` to distinguish them (e.g., "Winner — Windsor Terrace" and "Winner — Prospect Heights"). Single-location bakeries can leave `display_name` null and the popup will use `name`.

---

## Data Management

### Seeding new locations

1. Add a row directly in the Supabase Table Editor, or via `scripts/seed.ts`
2. Required fields: `name`, `latitude`, `longitude`, `status = 'active'`
3. Verify coordinates on Google Maps before inserting — paste `lat,lng` into the search bar
4. For multi-location spots, create one row per physical location with a unique `display_name`
5. After inserting, run the enrichment script to pull Google Places data (see below)

### Google Places enrichment

**Script:** `scripts/enrich-google-places.ts`
**Run:** `npx tsx --env-file=.env.local scripts/enrich-google-places.ts`

**How it works:**
- Uses **Google Places Nearby Search** (`rankby=distance`) — NOT text search
- Searches near each location's exact `latitude`/`longitude` with the location name as keyword
- Because it ranks by distance, it always returns the **closest matching branch** to the stored coordinates — critical for multi-location spots (e.g., Barachou West Village vs Upper West Side)
- Then fetches Place Details (`rating`, `opening_hours`) for the matched place
- Saves `google_place_id`, `google_rating`, `google_hours` incrementally (one row at a time — no data loss on failure)

**After running, QA in Supabase SQL Editor:**
```sql
select name, google_rating, google_hours->'weekday_text' as hours
from locations where status = 'active' order by name;
```

**Manual fixes:** If a location matches the wrong place (check the logged name in the script output), update directly in SQL Editor:
```sql
update locations set
  google_place_id = '<correct_place_id>',
  google_rating = <rating>,
  google_hours = '<hours_json>'::jsonb
where name = '<location name>';
```
To find the correct `place_id`, use the Google Places Text Search endpoint with a specific query (e.g., `"Breads Bakery Union Square NYC"`).

### Migrations

All schema changes live in `supabase/migrations/` as append-only SQL files. Run them manually in the Supabase SQL Editor (Database → SQL Editor → New query).

| Migration | What it does |
|---|---|
| `001_create_locations.sql` | Creates `locations` table with RLS + public read policy |
| `002_google_places.sql` | Adds `google_place_id`, `google_rating`, `google_hours` columns |

### AI / LLM Strategy

No AI in MVP. Purely deterministic.

| AI Touchpoint | What It Does | Fallback |
|---|---|---|
| None (MVP) | N/A | N/A |

### External Integrations

- **Mapbox GL JS** — map rendering and interaction (requires `NEXT_PUBLIC_MAPBOX_TOKEN`)
- **Supabase** — database and data API (requires `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` + `SUPABASE_SERVICE_ROLE_KEY`)
- **Google Places API** — enrichment script only (server-side, requires `GOOGLE_PLACES_API_KEY`). Not called at runtime — data is stored in Supabase. Re-run `scripts/enrich-google-places.ts` to refresh.

---

## MVP Scope

**In Scope (v1):**

- Full-screen Mapbox map of NYC
- Auto-fit/auto-zoom to show all location pins on load
- Custom SVG cinnamon roll icon as map pin marker
- Click pin → branded popup card showing bakery name (warm palette, styled)
- ~15-20 seed locations from The Infatuation and The Carboholic lists
- Seed script that populates Supabase with location data (reviewable before launch)
- Mobile-responsive (mobile-first design)
- Clean header with site name/logo
- Warm but clean design: cream/off-white background, cinnamon-brown accent color, clean sans-serif typography
- Deployed to Vercel

**Out of Scope (later):**

_Prioritized roughly by expected impact._

- **P1 — Enrich the card:** Google Places API integration (hours, Google rating, photos), external links (website, Instagram, Google Maps), cinnamon roll varieties, price, availability notes (e.g., "Saturdays only")
- **P1 — Filtering:** Borough filter, neighborhood filter, tags/categories
- **P1 — SEO pages:** Individual spot pages (`/spots/bakery-name`), neighborhood pages (`/neighborhoods/brooklyn`), "best of" list pages
- **P2 — Community features:** User reviews/ratings, "suggest a spot" submission form, user accounts
- **P2 — Discovery features:** "Near me" geolocation, social sharing (Instagram stories, Twitter), visited/tracking (check off spots you've been to)
- **P3 — Content & data:** Scraped data from Reddit, links to press/news features, editorial blog content
- **P3 — Expansion:** Other cities, other food items

---

## Seed Data

Locations to seed from The Infatuation and The Carboholic lists. Claude Code should compile these with accurate coordinates and present them for review before inserting into Supabase.

**From The Infatuation:**
1. Breadivore — Park Slope, Brooklyn
2. Little Red Kitchen Bake Shop — Park Slope, Brooklyn
3. Red Gate Bakery — East Village, Manhattan
4. Loser's Eating House — NoHo, Manhattan
5. Sunday Morning — East Village, Manhattan
6. Tall Poppy — (confirm location)
7. Spirals — East Village, Manhattan
8. Benji's Buns — West Village, Manhattan
9. Winner — Brooklyn (confirm neighborhood)

**From The Carboholic (additional spots):**
10. Welcome Home — Bed-Stuy, Brooklyn
11. Radio Bakery — (confirm location)
12. Ceremonia Bakeshop — Williamsburg, Brooklyn
13. Mah-Ze-Dahr — (confirm location)
14. Bakeri — Greenpoint/Williamsburg, Brooklyn
15. Ciao Gloria — Prospect Heights, Brooklyn
16. KYU — NoHo, Manhattan
17. Baked — Red Hook, Brooklyn
18. Barachou — Upper West Side / West Village, Manhattan
19. Petit Chou — East Village, Manhattan

_Note: Claude Code should verify all locations, confirm neighborhoods, and geocode accurate lat/lng before presenting for review._

---

## Edge Cases

**Closed bakeries:** Spots that close or stop selling cinnamon rolls stay on the map with a dimmed/greyed-out version of the cinnamon roll pin icon. The popup card should show the bakery name plus a "Permanently Closed" label. Use the `status` field in the database ("active" vs "closed") to control this. Don't delete — preserving closed spots helps users and maintains the map's history.

**Pop-up / irregular spots:** Some locations (e.g., Loser's Eating House) don't have fixed hours and operate via Instagram drops. They get a normal pin like everyone else. In MVP there's no way to communicate availability — this is fine. The `notes` field can store this info internally for when we enrich the card later.

**Overlapping pins:** Several East Village spots (Red Gate, Sunday Morning, Spirals, Petit Chou) are within a few blocks of each other. At low zoom levels, pins may overlap. Mapbox handles click prioritization natively, but ensure the SVG pin size (44px+ for mobile tap targets) doesn't make this worse. Test this cluster specifically.

**Mobile tap targets:** Related to overlapping — pins must be at minimum 44x44px for comfortable mobile tapping. Test on a real phone, not just browser dev tools.

**Empty state / data failure:** If Supabase is unreachable or returns no data, show the map with no pins. No error modal, no broken UI. Graceful degradation — just an empty map of NYC.

---

## Open Questions

- [x] Project name / domain — deferred, will figure out later
- [ ] Exact color palette — spec says "warm but clean, cream/cinnamon" but exact hex values TBD during build
- [ ] SVG cinnamon roll icon design — Claude Code to generate, Olivia to approve

## Risks

| Risk | Mitigation |
|---|---|
| Mapbox free tier exceeded if site goes viral | Monitor usage; upgrade is ~$50/mo if needed |
| Location data becomes stale (bakeries close, hours change) | Supabase dashboard makes manual updates easy; future "suggest a spot" form helps |
| Popup card feels too sparse with just a name | Styled branded card with warm design keeps it feeling intentional; P1 enrichment adds detail fast |
| Seed data coordinates are inaccurate | Verify all geocoding before launch; present for review |

---

## Definition of Done (v1)

The MVP is shippable when:

1. The site loads on desktop and mobile with a full-screen Mapbox map
2. All ~15-20 seed locations appear as custom cinnamon roll SVG pins
3. The map auto-fits to show all pins on load
4. Clicking any pin shows a branded popup card with the bakery name
5. The popup card uses the warm/clean design palette
6. The site is deployed to Vercel and accessible via a `.vercel.app` URL
7. The seed data has been reviewed and approved by Olivia
8. The site loads in under 3 seconds on mobile

---

## Environment Setup

```
# Prerequisites
Node.js >= 18
Git
GitHub account
Vercel account (existing)
Supabase account (existing)
Mapbox account (free tier — get access token at mapbox.com)

# Repo setup
Create a new GitHub repo → clone locally → connect to Vercel

# Install
npx create-next-app@latest nyc-cinnamon-rolls
cd nyc-cinnamon-rolls
npm install mapbox-gl @supabase/supabase-js

# Run
npm run dev

# Test
npm run build  # verify production build works
# Manual: verify all pins render, popups work, mobile responsive

# Environment variables
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_access_token
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Protected Files

```
# .env.local              — secrets (Mapbox token, Supabase keys)
# supabase/migrations/    — schema (append only)
# scripts/seed.ts         — seed data (modify only with approval)
```

---

## Design Reference

- **Inspiration:** pooltables.nyc (map-first, single-item-type, NYC-focused, sidebar/popup pattern), everythingiseverything.nyc (single-food-item NYC map, custom icons, scoring, press-worthy)
- **Palette:** Warm but clean — cream/off-white background (#FFF8F0 range), cinnamon-brown accent (#8B4513 range), clean sans-serif type (Inter or similar)
- **Pin icon:** Custom SVG cinnamon roll (generated, not a stock icon)
- **Popup card:** Branded card with warm background, bakery name in clean type, subtle shadow
- **Mobile:** Full-screen map, tap-friendly pin targets (minimum 44px), popup card doesn't obscure the full screen
- **Header:** Minimal — site name/logo only, no navigation links for MVP

---

## Competitive Landscape

_No one has built a dedicated cinnamon roll map for NYC. We'd be first-to-market._

**Reference projects (different products, great maps to learn from):**

| Project | What It Is | What We Can Learn |
|---|---|---|
| pooltables.nyc | Interactive map of 450+ pool tables in NYC | Map-first UX, single-item focus, community-sourced data, clean minimal design |
| everythingiseverything.nyc | 200+ bagels ranked across all 5 boroughs with custom icons and scoring | Proves single-food NYC maps earn major press (Today Show, NYT, TimeOut). Custom icons, stats, personality-driven. |

**Existing cinnamon roll content (lists/editorial, no map — these are the landscape we're aggregating):**

| Source | Format | Notes |
|---|---|---|
| The Infatuation | Curated list (~12 spots) | Strong editorial voice, our seed data source. No map view. |
| The Carboholic (Substack) | Ranked list with detailed reviews | Personal, opinionated, great photos. Additional seed data source. |
| Hannah Is Eating (Substack) | Blog post — personal cinnamon roll quest | Deep, passionate reviews. No map. |
| Chowhound | Standard "9 best" SEO list | Lower engagement, generic format. |
| Yelp | User review aggregation | Not curated, no map-first experience. |

**Social presence (fragmented, no centralized resource):**

| Platform | What's There |
|---|---|
| TikTok (@infatuation_nyc) | Cinnamon roll content gets 5K+ likes. Video format, not a discovery tool. |
| TikTok (various food creators) | Sunday Morning, Spirals, Benji's Buns get heavy organic coverage. |
| Instagram | Individual bakery accounts + food bloggers. Fragmented. |

**Our edge:** No one owns the map. All this content lives across 10+ articles and social feeds. We aggregate it into one visual, map-first experience — and become the definitive resource.

---

## Growth Strategy (Post-MVP)

_Don't build these yet. Ideas to explore once MVP ships and we validate the concept._

**SEO & content play:**
- Individual bakery pages (`/spots/bakery-name`) with structured data — target long-tail searches like "Breadivore cinnamon roll Park Slope"
- Neighborhood pages (`/neighborhoods/east-village`) — target "best cinnamon rolls East Village" queries
- "Best of" list pages — "best cinnamon rolls Brooklyn," "best cinnamon rolls Manhattan"
- All pages link to bakeries' own websites, Instagram, and Google Maps — this creates goodwill and potential for bakeries to link back

**Press & buzz:**
- The "Everything is Everything" playbook: a passion project with a great visual hook gets press. A beautiful cinnamon roll map of NYC is inherently shareable.
- Pitch to TimeOut, Eater, Gothamist, PIX11 (they covered the bagel map)
- Share on NYC food subreddits, TikTok, Instagram

**Bakery relationships:**
- Linking to bakeries' websites and social pages creates mutual value — they may share/repost
- "Suggest a spot" form turns the community into contributors
- Future: bakeries could claim their listing (like Yelp/Google Business)
