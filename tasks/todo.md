# tasks/todo.md — Task Tracker

## Current State

**Last updated:** 2026-03-31
**Last session summary:** Major post-MVP sprint. Google Places enrichment, redesigned popup cards, sidebar/footer polish, domain live, about page + contact form.

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
- Fixed footer bar (`#f5e6d3`) with Instagram handle + "About us" link — present on all pages
- Header logo/name links to homepage on all pages
- `/submit` page: Add a new spot + Suggest an edit forms (edit form streamlined — no redundant fields)
- `/about` page: brand story + contact form (name optional, email + message required) → `contact_submissions` table
- **Custom domain live**: cinnamonrolls.nyc (Squarespace DNS → Vercel, SSL auto-provisioned)
- Page title + tagline: "cinnamonrolls.nyc - the ultimate map of the city's best swirls"
- Inter font consistent across all pages including popup cards
- Map style: `light-v11`

**In progress:** Nothing

**Blockers:** None

**Next steps (post-MVP P1):**
- ~~Borough/neighborhood filtering~~ ✓ done
- ~~Enrich popup cards~~ ✓ done (rating, hours, source tags, links)
- SEO pages: individual spot pages, neighborhood pages

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
