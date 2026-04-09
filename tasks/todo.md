# tasks/todo.md — Task Tracker

## Current State

**Last updated:** 2026-04-08
**Last session summary:** (1) IG Post Generator rewritten — `html-to-image` toPng() on hidden 1080×1080 div, card as React JSX not innerHTML, review quote deduplication, filename `{slug}-{neighborhood}-ig.png`. (2) Full photo system: DB migrations (009_photo, 010_google_photos), Google Places enrichment script, admin photo picker page, own photo upload with HEIC→JPEG conversion via `heic-convert` + `sharp`, CSP updated for lh3/supabase. (3) Pop-ups page fix: removed `.eq("visible", true)` — page now shows all `location_type = 'Pop-up'` spots regardless of map visibility. Architecture settled: `visible` = on map + counted in header; `/pop-ups` page ignores `visible` and queries by `location_type` only. No new DB column needed.

**Status: LIVE at https://cinnamonrolls.nyc** 🎉

**Done:**
- Next.js 16 project scaffolded (App Router, TypeScript, Tailwind CSS 4, Turbopack)
- Supabase `locations` table created with RLS + public read policy
- 56 active locations seeded across all 5 boroughs
- Mapbox GL JS integrated with dynamic import + `"use client"` wrapper
- Custom SVG cinnamon roll pins (44×44px tap targets)
- Auto-fit bounds on load (all pins visible)
- Warm palette CSS variables (--cr-cream, --cr-brown, --cr-brown-dark)
- Search & filter panel: name search, borough, neighborhood, type, open-on-day, min rating filters
- Sidebar: 400px, Recently Added section, full location list, save/heart, nearby mode, surprise me
- Clicking pin or sidebar item flies to location (zoom 14) + opens popup
- **Popup card:** neighborhood/borough header, large name, type + rating + open days meta row, notes, "Featured by" tags, website + Instagram links
- **Google Places enrichment:** `google_place_id`, `google_rating`, `google_hours` on all 56 locations. Rating links to Google Maps. Always shows 1 decimal.
- `location_type` values in Sentence case (Bakery, Café, Kiosk, Market, Pop-up, Restaurant)
- Fixed footer bar (`#f5e6d3`) with Instagram handle + "About" link
- Header logo/name links to homepage on all pages
- `/submit` page: Add a new spot + Suggest an edit forms → `submissions` table
- `/about` page: brand story + contact form → `contact_submissions` table. Privacy note below email field.
- **Custom domain live:** cinnamonrolls.nyc (Squarespace DNS → Vercel, SSL auto-provisioned)
- Page title + tagline set
- Inter font throughout
- Map style: `light-v11`
- HTTPS + SSL via Vercel
- **Email notifications:** Resend → `papa.olivia@gmail.com` on new submissions and contact messages. Supabase webhooks configured.
- **SEO pages:**
  - `/locations/[slug]` — individual bakery pages (hours, rating, notes, links, "Is this your spot?" CTA)
  - `/boroughs/[slug]` — borough-level pages with alphabetical spot list + neighborhood chips + cross-borough nav
  - `/neighborhoods/[slug]` — neighbourhood pages with sibling neighbourhood chips + borough nav + breadcrumb
  - `sitemap.xml` — dynamic, all page types included
  - `robots.txt`, Open Graph, Twitter Card, canonical URL, favicon all in place
- **Analytics (Phase 1 — complete as of 2026-04-02):**
  - GTM (GTM-KJ2CN482) + GA4 (G-4V3HK9T6VT) via inline snippet + dataLayer
  - Supabase `analytics_events` + `error_logs` tables (migration 006)
  - `lib/analytics.ts`: `trackEvent()`, `logError()`, `initAnalytics()`, `debounce()`
  - `ErrorBoundary.tsx`, `OutboundLink.tsx`, `AnalyticsInit.tsx`, `LocationPageTracker.tsx`, `BackToMapLink.tsx`
  - 18 events wired: session_start, map_loaded, pin_clicked, popup_opened/closed, popup_link_clicked, map_zoomed, map_panned, map_bounds_changed, map_style_error, geolocation_requested/success/denied, outbound_click, location_page_viewed, location_to_map_nav, client_error, web_vital
  - UTM capture + sessionStorage persistence
- **Admin dashboard (`/admin-opdl-stfrancis`):**
  - Tabs: Submissions, Contacts, Locations, Analytics
  - Analytics tab: sessions 7d/30d, top pins, top location pages, device split, outbound clicks
- Security headers: CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy in `next.config.ts`
- **JSON-LD structured data** on all `/locations/[slug]` pages: `FoodEstablishment` schema with name, address, geo coordinates, aggregate rating, website. Multi-location brands use `@graph` array (one object per branch).
- **OG image** redesigned: 1200×280 horizontal banner (icon + site name + tagline, side stripes). Auto-wired via Next.js `opengraph-image.tsx` convention — no hardcoded URL.
- **Share preview** fixed: `og:title` = tagline only, `og:image` = `icon.png` (square thumbnail for iMessage/WhatsApp). Twitter keeps full banner via `twitter:image`.
- **Popup cutoff on desktop** fixed: footer height (36px) added to `ensurePopupVisible` safe zone in `Map.tsx`.
- **"Close ×"** on saved mode (Sidebar + MobileBottomSheet) — was "Clear ×" which implied clearing the saved list.
- **Submit form dropdown** shows `name - neighborhood, borough` (was using `display_name`).
- All docs updated: README rewritten, SPEC.md overhauled, todo.md brought current (56 locations, all components/scripts documented).
- ISR: `revalidate = 3600` on map page + SEO pages; `revalidate = 0` on admin
- Honeypot spam protection on contact form
- "Clear ×" (not "Close ×") on nearby/saved/filtered mode buttons
- Nearby mode header always visible in mobile bottom sheet (not scrollable)

**In progress:** Post-launch features

**Blockers:** None

---

## Pre-Launch Checklist — COMPLETE ✅ (launched 2026-04-02)

### QA & Data
- [x] QA all 56 locations on Google Maps — confirmed still open ✅
- [x] Confirmed multi-location neighborhood tags are correct (Ole & Steen x4, Petee's x2, Bakeri x2, Radio Bakery x2, Barachou x2, Winner x2, etc.) ✅
- [x] Fixed "Winner in the Park" → "Winner - Prospect Park" ✅
- [x] Tested all buttons and interactive elements (Nearby, Search, Saved, Add or Edit, Surprise Me) ✅
- [x] Tested "Add or Edit" flow end to end ✅
- [x] Tested contact form on /about ✅
- [x] Tested map interaction ✅
- [x] Tested "Nearby" — geolocation prompt + fallback ✅
- [x] Tested empty/error states ✅

### Mobile & Desktop
- [x] Tested mobile layout and functionality (iOS Safari + Chrome) ✅
- [x] Tested desktop layout (Chrome, Safari, Firefox) ✅

### Security
- [ ] Restrict Mapbox token to cinnamonrolls.nyc in Mapbox dashboard (post-launch, not a blocker)
- [x] CSP + security headers in place (next.config.ts) ✅

### SEO & Social
- [x] `<meta description>` ✅
- [x] Open Graph tags ✅
- [x] Twitter Card meta tags ✅
- [x] Canonical URL ✅
- [x] robots.txt ✅
- [x] sitemap.xml (dynamic, all page types) ✅
- [x] Favicon ✅
- [x] JSON-LD structured data on all location pages ✅
- [x] OG share preview configured (icon thumbnail for iMessage, banner for Twitter) ✅
- [x] Tested social share preview — iMessage + Instagram DMs ✅
- [x] Confirmed www.cinnamonrolls.nyc and cinnamonrolls.nyc both resolve ✅
- [x] @cinnamonrolls.nyc Instagram bio links to site ✅

### Infrastructure
- [x] Analytics: GA4 + GTM + Supabase event log ✅
- [x] Admin analytics dashboard ✅
- [x] Custom 404 page ✅
- [x] Email notifications on form submissions (Resend) ✅
- [x] ISR caching (revalidate = 3600 on public pages) ✅

### Launch Prep
- [x] Instagram launch post prepared ✅
- [x] List of NYC food bloggers / accounts to DM drafted ✅

---

## Post-Launch

### Features
- [x] Fix Instagram generator (dropdown + card preview not working) ✅
- [x] JSON-LD structured data (FoodEstablishment) per location page ✅
- [ ] Share functionality (share a specific spot or full map)
- [x] /today page — all spots open today, sorted by rating, 3-col desktop grid, hours/address/Google Maps link ✅
- [x] Address added to map popup (zip + USA stripped, linked to Google Maps) ✅
- [x] Bakery photos — Google enrichment + admin picker + own upload (HEIC supported) ✅ (wire to public pages still pending)
- [ ] Ole & Steen Tribeca (no confirmed address yet — hold)
- [x] Apt. 2 Bread — added to /pop-ups ✅
- [x] Pop-ups — /pop-ups page live with 4 spots ✅
- [x] Press mentions on bakery pages — "AS SEEN IN" pill style, ready for rich strings like "#4 on The Infatuation" ✅
- [ ] Wire `photo_url` into public pages: pop-up cards, bakery location pages, IG generator
- [ ] Improve neighborhood and borough pages for SEO

### Accessibility
- [ ] Keyboard navigation — confirm tab order through location list
- [ ] Check color contrast ratios
- [ ] Add alt text to all images
- [ ] Screen reader testing

---

## Analytics Tracking Reference

All events fire via `window.gtag('event', ...)` directly (no GTM). GA4: G-4V3HK9T6VT.
Every event includes `session_id` (sessionStorage UUID) automatically. Supabase `analytics_events` table receives a parallel copy of every event.

### Events

| Event | Source | Key properties |
|---|---|---|
| `session_start` | `AnalyticsInit.tsx` on mount | `referrer`, `device_type`, `viewport_width/height` |
| `map_loaded` | `Map.tsx` on Mapbox `load` | `load_time_ms` |
| `pin_clicked` | `Map.tsx` | `bakery_id`, `bakery_name`, `pin_lat`, `pin_lng` |
| `popup_opened` | `Map.tsx` | `bakery_id`, `bakery_name` |
| `popup_closed` | `Map.tsx` | `bakery_id`, `bakery_name`, `time_open_ms` |
| `popup_link_clicked` | `Map.tsx` | `bakery_id`, `bakery_name`, `link_type` (website/directions/instagram), `destination_url` |
| `map_zoomed` | `Map.tsx` — debounced 500ms | `zoom_level`, `center_lat/lng` |
| `map_panned` | `Map.tsx` — debounced 1000ms | `center_lat/lng`, `zoom_level` |
| `map_bounds_changed` | `Map.tsx` — debounced 1000ms | `north/south/east/west` bounds |
| `map_style_error` | `Map.tsx` | `error_message` |
| `geolocation_requested` | `MapPageClient.tsx` | — |
| `geolocation_success` | `MapPageClient.tsx` | `accuracy_meters` |
| `geolocation_denied` | `MapPageClient.tsx` | `error_code` |
| `outbound_click` | `OutboundLink.tsx` — all external links | `bakery_id`, `link_type`, `destination_url`, `link_location` (popup/location_page/footer/other) |
| `location_page_viewed` | `LocationPageTracker.tsx` on mount | `bakery_id`, `bakery_name` |
| `location_to_map_nav` | `BackToMapLink.tsx` | — |
| `client_error` | `ErrorBoundary.tsx` + `window.onerror` + `unhandledrejection` | `error_type`, `error_message` |
| `web_vital` | `lib/analytics.ts` — CLS, INP, LCP, FCP, TTFB | `metric_name`, `metric_value`, `metric_rating` |

### UTM links
- Instagram bio: `https://cinnamonrolls.nyc` (no UTM — GA4 auto-attributes Instagram referrer)
- Reddit posts: `https://cinnamonrolls.nyc?utm_source=reddit&utm_medium=social&utm_campaign=post`

### Where to look in GA4
- **Realtime**: confirm events are firing live
- **Events report**: all custom events listed above
- **Engagement > Pages**: `location_page_viewed` events by page
- **Acquisition**: traffic sources incl. UTM campaigns

---

## Lessons

### Technical
- **Supabase query with a missing column fails silently — returns `null` data, no thrown error.** Always check both `data` and `error` from Supabase responses. A column that doesn't exist yet (e.g. `photo_url` before migration) will cause the entire query to return null.
- **`revalidate = 300` suppresses `console.log` in server components** — the cached response is served and the function never re-runs. Set `revalidate = 0` (or clear `.next/cache`) to force fresh execution during debugging.
- **For PNG export from DOM, prefer `html-to-image` (npm) over html2canvas (CDN).** CDN script loading is a race condition — the library may not be ready when export is clicked. `html-to-image` is also more reliable with modern CSS. Capture from a hidden off-screen full-size div, not the CSS-scaled preview, to guarantee native resolution.
- **Next.js 16: `ssr: false` not allowed in Server Components.** Wrap the `dynamic(() => import(...), { ssr: false })` call in a separate `"use client"` component (MapWrapper pattern).
- **React StrictMode double-mounts `useEffect`.** Use `initializedRef = useRef(false)` set to `true` before the async init — prevents double Mapbox initialization.
- **Mapbox GL JS needs a sized container at init time.** If the container has 0 dimensions, no tiles are requested and the map stays blank. Fix: `position: fixed` with explicit `top/left/right/bottom` on the container, call `map.resize()` in `load` event before `fitBounds()`.
- **Vercel needs `vercel.json` with `{"framework": "nextjs"}` if the project was created before code existed.** Without it, Vercel treats it as a static site and returns 404 NOT_FOUND.
- **`NEXT_PUBLIC_` env vars must be added in the Vercel dashboard** and require a redeploy — baked into the client bundle at build time.
- **Mapbox popup cards are raw HTML strings** — CSS variables (`var(--font-inter)`) don't work inside them. Reference the font by name: `font-family:'Inter',sans-serif`.
- **Google Places nearby search (`rankby=distance`) is more accurate than text search for multi-location spots.** Text search uses a loose location bias; nearby search strictly ranks by distance from coordinates, ensuring the correct branch is matched.
- **Google Places API key website restrictions break server-side scripts.** Use IP restrictions instead, or leave unrestricted for enrichment-only keys never exposed to the browser.
- **Supabase check constraints block case/value changes.** Drop the constraint first (`alter table locations drop constraint ...`), update the values, then re-add if needed.
- **Top-level await doesn't work with tsx in CJS mode.** Wrap in `async function main() {}` and call it.
- **Squarespace DNS + Vercel:** Add `A` record `@` → `76.76.21.21` and `CNAME` `www` → Vercel's assigned CNAME. Propagates in 10–30 min.
- **Admin login uses `ADMIN_TOKEN` env var** — must be set in Vercel dashboard (Settings → Environment Variables) or login will always fail in production.
- **Resend: domain verification not required if sending from `onboarding@resend.dev`.** Emails arrive (possibly in spam initially). To send from a custom address, verify the domain in Resend dashboard.
- **Supabase `.then().catch()` TS error:** `Property 'catch' does not exist on type 'PromiseLike<void>'` — use `.then(() => {}, () => {})` instead.
- **`map.getBounds()` returns `LngLatBounds | null`.** Always null-check: `const b = map.getBounds(); if (!b) return;` before accessing bounds properties — TypeScript won't narrow through a debounce wrapper.
- **Server components can't call `trackEvent()` directly.** Wrap any analytics call in a `"use client"` component (e.g., `BackToMapLink.tsx`, `LocationPageTracker.tsx`).
- **Caching/CDN is handled automatically by Vercel + ISR.** No extra config needed. Map tiles are served by Mapbox's CDN. Static assets (`_next/static/`) get long-lived cache headers by default.
- **Reddit strips referrer headers.** Always use UTM params on Reddit links. Instagram referrer is auto-attributed by GA4, so no UTM needed for the Instagram bio link.

- **HEIC upload on Vercel (Linux): `sharp` doesn't support HEIC input.** Use `heic-convert` (pure JS/WASM) for HEIC files, `sharp` for everything else. Pass `raw.buffer` (ArrayBuffer) not `raw` (Buffer) to `heicConvert` — TypeScript will complain otherwise.
- **Pop-ups visibility architecture:** `visible = false` means "no map pin, not counted in header." The `/pop-ups` page intentionally ignores `visible` and queries by `location_type = 'Pop-up'` — so pop-ups without a fixed address (stub coords, `visible = false`) still appear on the pop-ups page. No new DB column needed.
- **Never use em dashes in spot names/display_names.** They break page titles and are not typographically appropriate for short labels.

### Design decisions
- **Popup card layout** (finalised 2026-03-31): neighbourhood · borough (small caps, top) → large bold name → type | ⭐ rating | open days (one meta row, pipe-separated) → notes → "Featured by" tags → divider → website + Instagram links.
- **"Featured by" tags:** All sources use the same warm amber style (`#fff8ed` bg, `#8B4513` text) — consistent, not colour-coded.
- **Rating always shows 1 decimal place** (e.g. 4.0 not 4). Clicking the rating opens Google Maps in a new tab via `place_id`.
- **Sidebar width: 400px** on desktop.
- **Zoom level on pin/sidebar click: 14.**
- **Footer:** Fixed 36px bar at bottom, `#f5e6d3`, right-aligned links. Present on all pages via root layout.
- **Map style: `light-v11`** — tried `outdoors-v12`, settled on light for cleaner readability.
- **Font: Inter throughout.**
- **`mentions` vs `source`** — `mentions` drives "Featured by" tags on the popup card and location pages. `source` is internal-only. Never wire `source` to UI.
- **Borough/neighborhood intro copy removed** — was not adding SEO value and was annoying to maintain. H1 margin-bottom increased to 24px to compensate.
- **Mobile bottom sheet mode header** (Nearby/Saved/filtered) — pulled OUT of the scrollable content area to a `flexShrink: 0` pinned row. Without this, the header scrolls out of view.
