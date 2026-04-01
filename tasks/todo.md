# tasks/todo.md — Task Tracker

## Current State

**Last updated:** 2026-03-31
**Last session summary:** Major post-MVP sprint. Google Places enrichment, redesigned popup cards, sidebar/footer polish, domain live, about page + contact form. Mobile design work starting next.

**Done:**
- Next.js 16 project scaffolded (App Router, TypeScript, Tailwind CSS 4, Turbopack)
- Supabase `locations` table created with RLS + public read policy
- 41 active locations seeded across all 5 boroughs
- Mapbox GL JS integrated with dynamic import + `"use client"` wrapper
- Custom SVG cinnamon roll pins (44×44px tap targets)
- Auto-fit bounds on load (all pins visible)
- Warm palette CSS variables (--cr-cream, --cr-brown, --cr-brown-dark)
- Search & filter panel: name search, borough, neighborhood, type, open-on-day filters
- Sidebar: 400px, Recently Added section, full location list, save/heart, nearby mode, surprise me
- Clicking pin or sidebar item flies to location (zoom 14) + opens popup
- **Popup card redesign** (2026-03-31): neighborhood/borough header, large name, type + rating + open days meta row, notes, "Featured by" tags, website + Instagram links
- **Google Places enrichment** (2026-03-31): `google_place_id`, `google_rating`, `google_hours` added to all 41 locations via coordinate-based nearby search (correct branch matching). Rating links to Google Maps, always shows 1 decimal.
- `location_type` values updated to Sentence case (Bakery, Café, Kiosk, Market, Pop-up, Restaurant)
- Fixed footer bar (`#f5e6d3`) with Instagram handle + "About" link — present on all pages
- Header logo/name links to homepage on all pages
- `/submit` page: Add a new spot + Suggest an edit forms (edit form streamlined — no redundant fields)
- `/about` page: brand story + contact form (name optional, email + message required) → `contact_submissions` table
- **Custom domain live**: cinnamonrolls.nyc (Squarespace DNS → Vercel, SSL auto-provisioned)
- Page title + tagline: "cinnamonrolls.nyc - the ultimate map of the city's best swirls"
- Inter font consistent across all pages including popup cards
- Map style: `light-v11`
- `<title>` tag set
- HTTPS + SSL auto-provisioned via Vercel
- `/about` contact form wired to `contact_submissions` table

**In progress:** Mobile design

**Blockers:** None

---

## Pre-Launch Checklist

### QA & Data
- [ ] QA all locations — spot-check addresses on Google Maps, confirm still open
- [ ] Confirm multi-location businesses have correct + distinct neighborhood tags (Ole & Steen x4, Petee's x2, Bakeri x2, etc.)
- [ ] Fix any inaccurate neighborhood labels (e.g. "Winner in the Park" → "Prospect Park · Brooklyn")
- [ ] Test all buttons and interactive elements (Nearby, Search, Saved, Add or Edit, Surprise Me)
- [ ] Test "Surprise Me" — confirm it feels intentional and delightful
- [ ] Test "Add or Edit" flow end to end — confirm submissions route somewhere reviewable
- [ ] Test contact form on /about — send a test submission and confirm it arrives
- [ ] Test map interaction — clicking a list item highlights on map and vice versa
- [ ] Test "Nearby" — confirm geolocation permission prompt and graceful fallback if denied
- [ ] Test empty/error states (no results, location denied, slow connection)

### Mobile & Desktop
- [ ] **Mobile design + layout** (in progress)
- [ ] Test mobile layout and functionality (iOS Safari + Chrome)
- [ ] Test desktop layout (Chrome, Safari, Firefox)
- [ ] Test Safari specifically — map rendering and geolocation behave differently
- [ ] Test on slow connection — confirm map and locations don't hang

### Security
- [ ] Restrict API keys by domain (Google Maps, Mapbox) so they can't be reused elsewhere
- [ ] Add spam protection to contact form (honeypot field or rate limiting)
- [ ] Review CORS and Content Security Policy headers

### SEO & Social
- [ ] Add `<meta description>`
- [ ] Add Open Graph tags (og:title, og:description, og:image) for social sharing previews
- [ ] Add Twitter Card meta tags
- [ ] Confirm canonical URL — www vs non-www should redirect to one
- [ ] Add robots.txt
- [ ] Add sitemap.xml
- [ ] Test social share preview — send link via iMessage, Instagram DMs, check the card
- [ ] Confirm favicon shows in browser tabs
- [ ] Confirm @cinnamonrolls.nyc Instagram links back to site

### Infrastructure
- [ ] Set up analytics (Plausible or Fathom — privacy-friendly)
- [ ] Add a custom 404 page that links back to the map
- [ ] Confirm www.cinnamonrolls.nyc and cinnamonrolls.nyc both resolve correctly

### Launch Prep
- [ ] Prepare Instagram launch post
- [ ] Draft list of NYC food bloggers / accounts to DM at launch

---

## Post-Launch

### Features
- [ ] Individual spot pages (SEO — `/spots/[slug]`)
- [ ] Neighborhood pages (SEO — `/neighborhoods/[slug]`)
- [ ] Share functionality (share a specific spot or full map, like pooltables.nyc)
- [ ] "Available today" tags for spots with limited cinnamon roll days (Red Gate, KYU, Mah-Ze-Dahr, etc.)
- [ ] Add location address to popup / spot page
- [ ] Bakery photos (or confirm uniform icon feels intentional)
- [ ] Add a simple privacy note about email collection from contact form
- [ ] Add cookie notice if analytics uses cookies
- [ ] Ole & Steen Tribeca (no confirmed address yet — hold)
- [ ] Apt. 2 Bread (pop-up only, no fixed address — hold)

### Accessibility
- [ ] Keyboard navigation — confirm tab order through location list
- [ ] Check color contrast ratios
- [ ] Add alt text to all images
- [ ] Screen reader testing

### Technical
- [ ] Add JSON-LD structured data (LocalBusiness / FoodEstablishment) per location
- [ ] Add error monitoring (Sentry or similar)
- [ ] Set up caching / CDN for map tiles and location data

---

## Lessons

### Technical
- **Next.js 16: `ssr: false` not allowed in Server Components.** Wrap the `dynamic(() => import(...), { ssr: false })` call in a separate `"use client"` component (MapWrapper pattern).
- **React StrictMode double-mounts `useEffect`.** Use `initializedRef = useRef(false)` set to `true` before the async init — prevents double Mapbox initialization.
- **Mapbox GL JS needs a sized container at init time.** If the container has 0 dimensions, no tiles are requested and the map stays blank. Fix: `position: fixed` with explicit `top/left/right/bottom` on the container, call `map.resize()` in `load` event before `fitBounds()`.
- **Vercel needs `vercel.json` with `{"framework": "nextjs"}` if the project was created before code existed.** Without it, Vercel treats it as a static site and returns 404 NOT_FOUND.
- **`NEXT_PUBLIC_` env vars must be added in the Vercel dashboard** and require a redeploy — baked into the client bundle at build time.
- **Mapbox popup cards are raw HTML strings** — CSS variables (`var(--font-inter)`) don't work inside them. Reference the font by name: `font-family:'Inter',sans-serif`.
- **Google Places nearby search (`rankby=distance`) is more accurate than text search for multi-location spots.** Text search uses a loose location bias; nearby search strictly ranks by distance from coordinates, ensuring the correct branch is matched.
- **Google Places API key website restrictions break server-side scripts.** Use IP restrictions instead, or leave unrestricted for enrichment-only keys never exposed to the browser.
- **Supabase check constraints block case/value changes.** Drop the constraint first (`alter table locations drop constraint ...`), update the values, then re-add if needed.
- **Top-level await doesn't work with tsx in CJS mode.** Wrap in `async function main() {}` and call it — same pattern as the enrichment script.
- **Squarespace DNS + Vercel:** Add `A` record `@` → `76.76.21.21` and `CNAME` `www` → Vercel's assigned CNAME. Propagates in 10–30 min.
- **Admin login uses `ADMIN_TOKEN` env var** — must be set in Vercel dashboard (Settings → Environment Variables) or login will always fail in production.

### Design decisions
- **Popup card layout** (finalised 2026-03-31): neighbourhood · borough (small caps, top) → large bold name → type | ⭐ rating | open days (one meta row, pipe-separated) → notes → "Featured by" tags → divider → website + Instagram links. Warm cinnamon palette throughout.
- **"Featured by" tags:** All sources use the same warm amber style (`#fff8ed` bg, `#8B4513` text) — consistent, not colour-coded by publication.
- **Rating always shows 1 decimal place** (e.g. 4.0 not 4). Clicking the rating opens Google Maps in a new tab via `place_id`.
- **Sidebar width: 400px** on desktop — wide enough for place names to read comfortably without truncating.
- **Zoom level on pin/sidebar click: 14** — close enough to orient, not so close it feels claustrophobic.
- **Footer:** Fixed 36px bar at bottom, `#f5e6d3` (same as sidebar action bar), right-aligned links. Present on all pages via root layout.
- **Map style: `light-v11`** — tried `outdoors-v12`, settled on light for cleaner readability with the warm pin icons.
- **Font: Inter throughout** — including popup cards. No display font for now; Inter at various weights carries the brand well.
- **location_type in Sentence case** (Bakery, Café, etc.) — was lowercase snake_case in DB, updated after dropping check constraint.
- **Submit page edit form** — name, website, address fields hidden in "Suggest an edit" mode since the user already selected the location from a dropdown.
- **`mentions` vs `source`** — `mentions` (string[]) drives "Featured by" tags on the popup card. `source` (text) is internal-only and never displayed. Never wire `source` to UI.
