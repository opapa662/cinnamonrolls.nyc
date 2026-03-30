# tasks/todo.md — Task Tracker

## Current State

**Last updated:** 2026-03-29
**Last session summary:** Spec written and approved. Project ready to begin.
**In progress:** Nothing yet
**Blockers:** None
**Next steps:** Set up the project (repo, Next.js, Supabase table, Mapbox account), then build the map.

---

## Session Plan — 2026-03-30 (Heavy Mode)

### What I'm building
Full MVP: Next.js app with Mapbox GL JS map, Supabase data layer, custom SVG pins, branded popup cards, minimal header. Deploy to Vercel.

### Files I'll touch / create
- `app/page.tsx` — root page (full-screen map)
- `app/layout.tsx` — root layout (fonts, globals, metadata)
- `app/globals.css` — warm palette CSS variables
- `components/Map.tsx` — client component: Mapbox init, pin rendering, popup logic
- `components/Header.tsx` — minimal site name header
- `lib/supabase.ts` — Supabase client singleton
- `supabase/migrations/001_create_locations.sql` — schema (append-only)
- `scripts/seed.ts` — seed script (present data first, insert after approval)
- `next.config.ts` — transpile mapbox-gl
- `package.json` — add mapbox-gl, @supabase/supabase-js

### Steps (in order)
1. `create-next-app` in the existing repo dir (TypeScript, Tailwind, App Router, no src/)
2. Install `mapbox-gl`, `@supabase/supabase-js`
3. Write SQL migration for `locations` table → provide for Supabase dashboard
4. Research + compile seed data (15-20 locations, accurate lat/lng) → **STOP, present to Olivia for approval**
5. Generate SVG cinnamon roll icon → **STOP, present to Olivia for approval**
6. Build Map component (Mapbox init, fetch Supabase, render pins, auto-fit bounds)
7. Build popup card (warm palette, display_name fallback, closed state)
8. Build header + global styles
9. Mobile QA (44px tap targets, East Village cluster)
10. Push to GitHub → verify Vercel deploy

### Expected outcome
Live `.vercel.app` URL showing all ~15-20 approved pins on a full-screen NYC map, with branded popup cards on click.

### What could go wrong
- `create-next-app .` in a non-empty dir → use `--yes` flag, it handles this
- Mapbox GL JS SSR issues in Next.js App Router → use `"use client"` + `dynamic()` with `ssr: false`
- East Village pin cluster overlap at low zoom → verify 44px targets don't worsen it; Mapbox handles click prioritization
- Supabase table creation requires service role key (not anon key) → write SQL migration, user runs it in dashboard

---

## Tasks

### Olivia — Before First Build Session

- [x] Create GitHub repo (github.com/opapa662/cinnamonroll.nyc)
- [x] Create Supabase project (free tier) + grab project URL and anon key
- [x] Create Mapbox account (free tier) + grab access token
- [ ] Add environment variables to `.env.local` (Mapbox token, Supabase URL, Supabase anon key) — do this after Claude Code initializes the project

### Olivia — After Claude Code Pushes Initial Code

- [ ] Connect repo to Vercel (needs code in repo first)

### Olivia — During Build (Review Gates)

- [ ] Review + approve seed data (locations, coordinates, names)
- [ ] Review + approve SVG cinnamon roll pin icon
- [ ] Final review of all pins + popups before launch

### Claude Code — Project Setup

- [ ] Initialize Next.js project
- [ ] Set up Supabase `locations` table per schema in SPEC.md
- [ ] Configure environment variables (`.env.local`)
- [ ] Deploy initial skeleton to Vercel

### Claude Code — Seed Data

- [ ] Compile full list of ~15-20 locations with accurate lat/lng coordinates
- [ ] Verify all neighborhoods and boroughs
- [ ] Write seed script (`scripts/seed.ts`) to populate Supabase
- [ ] Present seed data to Olivia for review before inserting
- [ ] Run approved seed data into Supabase

### Claude Code — Map

- [ ] Integrate Mapbox GL JS into Next.js
- [ ] Fetch locations from Supabase on page load
- [ ] Render all locations as markers on the map
- [ ] Auto-fit map bounds to show all pins on load
- [ ] Design + implement custom SVG cinnamon roll pin icon
- [ ] Present pin icon to Olivia for approval

### Claude Code — Popup Card

- [ ] Design branded popup card (warm palette, bakery name)
- [ ] Implement click handler on pins to show popup
- [ ] Ensure popup works well on mobile (doesn't obscure full screen)

### Claude Code — Design & Polish

- [ ] Set up warm/clean color palette (cream background, cinnamon accents)
- [ ] Add minimal header with site name
- [ ] Mobile-responsive layout (full-screen map, tap-friendly targets)
- [ ] Performance check — page loads under 3 seconds on mobile

### Claude Code — Launch

- [ ] Final review of all pins + popups
- [ ] Deploy to Vercel production
- [ ] Verify `.vercel.app` URL works on desktop + mobile
- [ ] Ship it

---

## Lessons

<!-- Add entries here whenever a mistake is made or a correction is given. -->
