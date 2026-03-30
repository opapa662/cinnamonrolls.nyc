/**
 * Seed script — populates the `locations` table in Supabase.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY (bypasses RLS for insert).
 * Find it in: Supabase dashboard → Settings → API → service_role key.
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/seed.ts
 *
 * Or add both vars to .env.local and run:
 *   npx tsx --env-file=.env.local scripts/seed.ts
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const locations = [
  // ── Manhattan ──────────────────────────────────────────────────────────
  {
    name: "Red Gate Bakery",
    display_name: null,
    latitude: 40.723693,
    longitude: -73.988817,
    neighborhood: "East Village",
    borough: "Manhattan",
    source: "The Infatuation",
    notes: null,
    status: "active",
  },
  {
    name: "Sunday Morning",
    display_name: null,
    latitude: 40.722476,
    longitude: -73.982966,
    neighborhood: "East Village",
    borough: "Manhattan",
    source: "The Infatuation",
    notes: "10 rotating cinnamon roll flavors daily",
    status: "active",
  },
  {
    name: "Spirals",
    display_name: null,
    latitude: 40.727953,
    longitude: -73.985335,
    neighborhood: "East Village",
    borough: "Manhattan",
    source: "The Infatuation",
    notes: "Closed Mon–Tue",
    status: "active",
  },
  {
    name: "Petit Chou",
    display_name: null,
    latitude: 40.731115,
    longitude: -73.983094,
    neighborhood: "East Village",
    borough: "Manhattan",
    source: "The Carboholic",
    notes: "Specializes in eclairs; also does cinnamon rolls/viennoiserie",
    status: "active",
  },
  {
    name: "Loser's Eating House",
    display_name: null,
    latitude: 40.726147,
    longitude: -74.004976,
    neighborhood: "SoHo",
    borough: "Manhattan",
    source: "The Infatuation",
    notes: "Ghost kitchen / pre-order only; cinnamon roll drops via Instagram @losersnyc — no walk-in",
    status: "active",
  },
  {
    name: "KYU",
    display_name: null,
    latitude: 40.725560,
    longitude: -73.995133,
    neighborhood: "NoHo",
    borough: "Manhattan",
    source: "The Carboholic",
    notes: "Restaurant (not a dedicated bakery); wood-fired Asian-inspired",
    status: "active",
  },
  {
    name: "Benji's Buns",
    display_name: null,
    latitude: 40.733094,
    longitude: -74.005708,
    neighborhood: "West Village",
    borough: "Manhattan",
    source: "The Infatuation",
    notes: null,
    status: "active",
  },
  {
    name: "Barachou",
    display_name: "Barachou — West Village",
    latitude: 40.737152,
    longitude: -74.004917,
    neighborhood: "West Village",
    borough: "Manhattan",
    source: "The Carboholic",
    notes: "Opened 2022",
    status: "active",
  },
  {
    name: "Barachou",
    display_name: "Barachou — Upper West Side",
    latitude: 40.784738,
    longitude: -73.976933,
    neighborhood: "Upper West Side",
    borough: "Manhattan",
    source: "The Carboholic",
    notes: "Original location (2019)",
    status: "active",
  },
  {
    name: "Tall Poppy",
    display_name: null,
    latitude: 40.741817,
    longitude: -73.996490,
    neighborhood: "Chelsea",
    borough: "Manhattan",
    source: "The Infatuation",
    notes: "Opened Sep 2024; located in Chelsea",
    status: "active",
  },
  {
    name: "Mah-Ze-Dahr",
    display_name: "Mah-Ze-Dahr — Downtown",
    latitude: 40.712272,
    longitude: -74.015436,
    neighborhood: "Battery Park City",
    borough: "Manhattan",
    source: "The Carboholic",
    notes: "Currently the only active NYC location (Brookfield Place)",
    status: "active",
  },
  {
    name: "Mah-Ze-Dahr",
    display_name: "Mah-Ze-Dahr — West Village",
    latitude: 40.735300,
    longitude: -74.000200,
    neighborhood: "West Village",
    borough: "Manhattan",
    source: "The Carboholic",
    notes: "Permanently closed mid-2025; evicted due to rent dispute",
    status: "closed",
  },

  // ── Brooklyn ───────────────────────────────────────────────────────────
  {
    name: "Breadivore",
    display_name: null,
    latitude: 40.667332,
    longitude: -73.988024,
    neighborhood: "Park Slope",
    borough: "Brooklyn",
    source: "The Infatuation",
    notes: "Wed–Sun only",
    status: "active",
  },
  {
    name: "Little Red Kitchen Bake Shop",
    display_name: null,
    latitude: 40.664627,
    longitude: -73.993272,
    neighborhood: "South Slope",
    borough: "Brooklyn",
    source: "The Infatuation",
    notes: "Tue–Sun",
    status: "active",
  },
  {
    name: "Winner",
    display_name: "Winner — Park Slope",
    latitude: 40.665720,
    longitude: -73.982369,
    neighborhood: "Park Slope",
    borough: "Brooklyn",
    source: "The Infatuation",
    notes: "Flagship bakery location",
    status: "active",
  },
  {
    name: "Winner",
    display_name: "Winner in the Park",
    latitude: 40.665559,
    longitude: -73.971574,
    neighborhood: "Prospect Park",
    borough: "Brooklyn",
    source: "The Infatuation",
    notes: "Inside Prospect Park Picnic House lower level; seasonal/park hours",
    status: "active",
  },
  {
    name: "Welcome Home",
    display_name: null,
    latitude: 40.688181,
    longitude: -73.954692,
    neighborhood: "Bed-Stuy",
    borough: "Brooklyn",
    source: "The Carboholic",
    notes: "Closed Tues; sells out fast; NYT Bakery of the Year",
    status: "active",
  },
  {
    name: "Radio Bakery",
    display_name: "Radio Bakery — Greenpoint",
    latitude: 40.732393,
    longitude: -73.954943,
    neighborhood: "Greenpoint",
    borough: "Brooklyn",
    source: "The Carboholic",
    notes: "Original location; 7:30am–3:30pm or sold out",
    status: "active",
  },
  {
    name: "Radio Bakery",
    display_name: "Radio Bakery — Prospect Heights",
    latitude: 40.675024,
    longitude: -73.967020,
    neighborhood: "Prospect Heights",
    borough: "Brooklyn",
    source: "The Carboholic",
    notes: "Opened Mar 2025",
    status: "active",
  },
  {
    name: "Ceremonia Bakeshop",
    display_name: null,
    latitude: 40.712401,
    longitude: -73.960526,
    neighborhood: "Williamsburg",
    borough: "Brooklyn",
    source: "The Carboholic",
    notes: "Closed Mon–Tue",
    status: "active",
  },
  {
    name: "Bakeri",
    display_name: "Bakeri — Greenpoint",
    latitude: 40.734370,
    longitude: -73.957541,
    neighborhood: "Greenpoint",
    borough: "Brooklyn",
    source: "The Carboholic",
    notes: null,
    status: "active",
  },
  {
    name: "Bakeri",
    display_name: "Bakeri — Williamsburg",
    latitude: 40.720022,
    longitude: -73.960103,
    neighborhood: "Williamsburg",
    borough: "Brooklyn",
    source: "The Carboholic",
    notes: null,
    status: "active",
  },
  {
    name: "Ciao Gloria",
    display_name: null,
    latitude: 40.680732,
    longitude: -73.968081,
    neighborhood: "Prospect Heights",
    borough: "Brooklyn",
    source: "The Carboholic",
    notes: "Daytime café; cinnamon rolls sell out fast",
    status: "active",
  },
  {
    name: "Baked",
    display_name: null,
    latitude: 40.676798,
    longitude: -74.013192,
    neighborhood: "Red Hook",
    borough: "Brooklyn",
    source: "The Carboholic",
    notes: null,
    status: "active",
  },
];

async function seed() {
  console.log(`Seeding ${locations.length} locations...`);

  const { data, error } = await supabase
    .from("locations")
    .insert(locations)
    .select("id, name, display_name");

  if (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }

  console.log(`✓ Inserted ${data?.length} rows:`);
  data?.forEach((r) =>
    console.log(`  - ${r.display_name || r.name}`)
  );
}

seed();
