/**
 * seed-batch2.ts
 *
 * 1. Sets all new fields on existing 24 rows (location_type, website, instagram,
 *    days_open, mentions, original_location).
 * 2. Inserts 18 new confirmed locations with all fields.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/seed-batch2.ts
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── 1. Updates for existing rows ─────────────────────────────────────────────
const existingUpdates: {
  name: string;
  display_name: string | null;
  location_type: string;
  website: string | null;
  instagram: string | null;
  days_open: string | null;
  mentions: string[];
  original_location: string;
}[] = [
  {
    name: "Red Gate Bakery",
    display_name: null,
    location_type: "bakery",
    website: "https://redgatebakery.com",
    instagram: "redgatebakery",
    days_open: "Tue–Sat",
    mentions: ["The Infatuation"],
    original_location: "yes",
  },
  {
    name: "Sunday Morning",
    display_name: null,
    location_type: "cafe",
    website: null,
    instagram: "sundaymorningcinnamonrolls",
    days_open: "Daily",
    mentions: ["The Infatuation", "The Carboholic", "Time Out NY"],
    original_location: "yes",
  },
  {
    name: "Spirals",
    display_name: null,
    location_type: "bakery",
    website: "https://www.spiralscinnamonrolls.com",
    instagram: "welcometospirals",
    days_open: "Wed–Sun",
    mentions: ["The Infatuation"],
    original_location: "yes",
  },
  {
    name: "Petit Chou",
    display_name: null,
    location_type: "bakery",
    website: "https://www.petitchounyc.com",
    instagram: "petitchou.nyc",
    days_open: "Daily",
    mentions: ["The Carboholic"],
    original_location: "yes",
  },
  {
    name: "Loser's Eating House",
    display_name: null,
    location_type: "pop_up",
    website: "https://www.loserseatinghouse.com",
    instagram: "losersnyc",
    days_open: "Pop-up — check Instagram for dates",
    mentions: ["The Infatuation", "The Carboholic"],
    original_location: "yes",
  },
  {
    name: "KYU",
    display_name: null,
    location_type: "restaurant",
    website: "https://www.kyurestaurants.com",
    instagram: "kyurestaurants",
    days_open: "Tue–Sun",
    mentions: ["The Carboholic"],
    original_location: "no",
  },
  {
    name: "Benji's Buns",
    display_name: null,
    location_type: "bakery",
    website: "https://benjisbuns.com",
    instagram: "benjisbunsnyc",
    days_open: "Daily",
    mentions: ["The Infatuation"],
    original_location: "yes",
  },
  {
    name: "Barachou",
    display_name: "Barachou — West Village",
    location_type: "bakery",
    website: "https://www.barachou.com",
    instagram: "barachounyc",
    days_open: "Daily",
    mentions: ["The Carboholic"],
    original_location: "no",
  },
  {
    name: "Barachou",
    display_name: "Barachou — Upper West Side",
    location_type: "bakery",
    website: "https://www.barachou.com",
    instagram: "barachounyc",
    days_open: "Daily",
    mentions: ["The Carboholic"],
    original_location: "yes",
  },
  {
    name: "Tall Poppy",
    display_name: null,
    location_type: "bakery",
    website: "https://www.tallpoppynyc.com",
    instagram: "tallpoppynyc",
    days_open: "Daily",
    mentions: ["The Infatuation"],
    original_location: "yes",
  },
  {
    name: "Mah-Ze-Dahr",
    display_name: "Mah-Ze-Dahr — Downtown",
    location_type: "bakery",
    website: "https://mahzedahrbakery.com",
    instagram: "mahzedahrbakery",
    days_open: "Daily",
    mentions: ["The Carboholic"],
    original_location: "no",
  },
  {
    name: "Mah-Ze-Dahr",
    display_name: "Mah-Ze-Dahr — West Village",
    location_type: "bakery",
    website: "https://mahzedahrbakery.com",
    instagram: "mahzedahrbakery",
    days_open: null,
    mentions: ["The Carboholic"],
    original_location: "yes",
  },
  {
    name: "Breadivore",
    display_name: null,
    location_type: "bakery",
    website: "https://www.breadivore.com",
    instagram: "breadivorebakery",
    days_open: "Wed–Sun",
    mentions: ["The Infatuation"],
    original_location: "yes",
  },
  {
    name: "Little Red Kitchen Bake Shop",
    display_name: null,
    location_type: "bakery",
    website: "https://www.littleredkitchen.store",
    instagram: "littleredkitchen",
    days_open: "Tue–Sun",
    mentions: ["The Infatuation"],
    original_location: "yes",
  },
  {
    name: "Winner",
    display_name: "Winner — Park Slope",
    location_type: "bakery",
    website: "https://www.winner.nyc",
    instagram: "winnernyc",
    days_open: "Daily",
    mentions: ["The Infatuation"],
    original_location: "yes",
  },
  {
    name: "Winner",
    display_name: "Winner in the Park",
    location_type: "kiosk",
    website: "https://www.winner.nyc",
    instagram: "winnerinthepark",
    days_open: "Seasonal",
    mentions: [],
    original_location: "no",
  },
  {
    name: "Welcome Home",
    display_name: null,
    location_type: "bakery",
    website: "https://www.welcomehomebrooklyn.com",
    instagram: "welcomehome.bk",
    days_open: "Wed–Mon",
    mentions: ["NYT", "The Carboholic", "The Infatuation"],
    original_location: "yes",
  },
  {
    name: "Radio Bakery",
    display_name: "Radio Bakery — Greenpoint",
    location_type: "bakery",
    website: "https://www.radiobakery.nyc",
    instagram: "radiobakerynyc",
    days_open: "Daily",
    mentions: ["The Carboholic"],
    original_location: "yes",
  },
  {
    name: "Radio Bakery",
    display_name: "Radio Bakery — Prospect Heights",
    location_type: "bakery",
    website: "https://www.radiobakery.nyc",
    instagram: "radiobakerynyc",
    days_open: "Daily",
    mentions: ["The Carboholic"],
    original_location: "no",
  },
  {
    name: "Ceremonia Bakeshop",
    display_name: null,
    location_type: "bakery",
    website: "https://www.ceremoniabakeshop.com",
    instagram: "ceremoniabakeshop",
    days_open: "Wed–Sun",
    mentions: ["The Carboholic"],
    original_location: "yes",
  },
  {
    name: "Bakeri",
    display_name: "Bakeri — Greenpoint",
    location_type: "cafe",
    website: "https://www.bakeribrooklyn.com",
    instagram: "bakeribrooklyn",
    days_open: "Daily",
    mentions: ["The Carboholic"],
    original_location: "yes",
  },
  {
    name: "Bakeri",
    display_name: "Bakeri — Williamsburg",
    location_type: "cafe",
    website: "https://www.bakeribrooklyn.com",
    instagram: "bakeribrooklyn",
    days_open: "Daily",
    mentions: ["The Carboholic"],
    original_location: "no",
  },
  {
    name: "Ciao Gloria",
    display_name: null,
    location_type: "cafe",
    website: "https://www.ciaogloria.com",
    instagram: "ciaogloria",
    days_open: "Daily",
    mentions: ["The Carboholic"],
    original_location: "yes",
  },
  {
    name: "Baked",
    display_name: null,
    location_type: "bakery",
    website: "https://bakednyc.com",
    instagram: "bakednyc",
    days_open: "Daily",
    mentions: ["The Carboholic"],
    original_location: "yes",
  },
];

// ─── 2. New locations ──────────────────────────────────────────────────────────
const newLocations = [
  // ── Manhattan ──────────────────────────────────────────────────────────────
  {
    name: "Hani's Bakery & Café",
    display_name: null,
    latitude: 40.72905,
    longitude: -73.99180,
    neighborhood: "East Village",
    borough: "Manhattan",
    notes: "Malted cinnamon bun with malted milk cream cheese frosting; bestseller",
    location_type: "bakery",
    website: "https://www.hanisnyc.com",
    instagram: "hanisbakerynyc",
    days_open: "Daily",
    mentions: ["The Infatuation", "TikTok"],
    original_location: "yes",
    status: "active",
  },
  {
    name: "L'Appartement 4F",
    display_name: "L'Appartement 4F — West Village",
    latitude: 40.73430,
    longitude: -74.00215,
    neighborhood: "West Village",
    borough: "Manhattan",
    notes: "Opened Feb 2025; laminated croissant-dough cinnamon roll",
    location_type: "bakery",
    website: "https://www.lappartement4f.com",
    instagram: "lappartement4f",
    days_open: "Daily",
    mentions: ["The Carboholic"],
    original_location: "no",
    status: "active",
  },
  {
    name: "Rigor Hill Market",
    display_name: null,
    latitude: 40.71985,
    longitude: -74.00570,
    neighborhood: "Tribeca",
    borough: "Manhattan",
    notes: "Fresh in-store rolls + frozen take-home pans ($25/8 rolls); rated 9.7/10 by The Carboholic",
    location_type: "market",
    website: "https://rigorhillmarket.com",
    instagram: "rigorhillmarket",
    days_open: "Daily",
    mentions: ["The Carboholic", "TikTok"],
    original_location: "yes",
    status: "active",
  },
  {
    name: "The Noortwyck",
    display_name: null,
    latitude: 40.73205,
    longitude: -74.00340,
    neighborhood: "West Village",
    borough: "Manhattan",
    notes: "Weekend brunch only (Sat–Sun 11am–2:30pm); ex-Eleven Madison Park team",
    location_type: "restaurant",
    website: "https://www.thenoortwyck.com",
    instagram: "thenoortwyck",
    days_open: "Sat–Sun brunch only",
    mentions: ["The Infatuation", "The Carboholic"],
    original_location: "yes",
    status: "active",
  },
  {
    name: "Bourke Street Bakery",
    display_name: null,
    latitude: 40.74475,
    longitude: -73.98720,
    neighborhood: "NoMad",
    borough: "Manhattan",
    notes: "Australian-founded; Mon–Fri 7am–4pm, Sat–Sun 8am–5pm",
    location_type: "bakery",
    website: "https://www.bourkestreetbakery.com",
    instagram: "bourkestreetbakerynyc",
    days_open: "Daily",
    mentions: ["The Carboholic"],
    original_location: "no",
    status: "active",
  },
  {
    name: "American Bar",
    display_name: null,
    latitude: 40.73560,
    longitude: -74.00115,
    neighborhood: "West Village",
    borough: "Manhattan",
    notes: "Weekend brunch only (Sat–Sun 11am–2:45pm); cinnamon bun $10",
    location_type: "restaurant",
    website: "https://www.americanbarnyc.com",
    instagram: "americanbarnyc",
    days_open: "Sat–Sun brunch only",
    mentions: ["The Carboholic"],
    original_location: "yes",
    status: "active",
  },
  {
    name: "Michaeli Bakery",
    display_name: null,
    latitude: 40.71535,
    longitude: -73.99370,
    neighborhood: "Lower East Side",
    borough: "Manhattan",
    notes: "Israeli-American bakery; closed Saturdays",
    location_type: "bakery",
    website: "https://www.michaelibakery.com",
    instagram: "michaelibakerynyc",
    days_open: "Mon–Fri, Sun",
    mentions: [],
    original_location: "yes",
    status: "active",
  },
  {
    name: "Cloudy Donut Co.",
    display_name: "Cloudy Donut Co. — Nolita",
    latitude: 40.72245,
    longitude: -73.99490,
    neighborhood: "Nolita",
    borough: "Manhattan",
    notes: "100% vegan, Black-owned; Fri–Sun only; rotating flavors",
    location_type: "bakery",
    website: "https://www.cloudydonut.com",
    instagram: "cloudydonuts",
    days_open: "Fri–Sun",
    mentions: [],
    original_location: "no",
    status: "active",
  },
  {
    name: "Chloe",
    display_name: null,
    latitude: 40.72890,
    longitude: -74.00245,
    neighborhood: "Greenwich Village",
    borough: "Manhattan",
    notes: "Vegan; reopened Jul 2024 as CHLOE at original By Chloe space",
    location_type: "cafe",
    website: "https://www.chloeonbleecker.com",
    instagram: "chloesonbleecker",
    days_open: "Daily",
    mentions: [],
    original_location: "yes",
    status: "active",
  },
  {
    name: "Noa, a Café",
    display_name: null,
    latitude: 40.74730,
    longitude: -73.98545,
    neighborhood: "Koreatown",
    borough: "Manhattan",
    notes: "Swedish cinnamon bun; daily 7am–4:30pm; Middle Eastern & Scandinavian influences",
    location_type: "cafe",
    website: "https://noaacafe.com",
    instagram: "noaacafe",
    days_open: "Daily",
    mentions: ["TikTok"],
    original_location: "yes",
    status: "active",
  },
  {
    name: "Breads Bakery",
    display_name: "Breads Bakery — Union Square",
    latitude: 40.73560,
    longitude: -73.99060,
    neighborhood: "Union Square",
    borough: "Manhattan",
    notes: "Flagship; super-flaky cinnamon sugar roll, $5.25",
    location_type: "bakery",
    website: "https://www.breadsbakery.com",
    instagram: "breadsbakery",
    days_open: "Daily",
    mentions: [],
    original_location: "yes",
    status: "active",
  },
  {
    name: "Breads Bakery",
    display_name: "Breads Bakery — Bryant Park",
    latitude: 40.75420,
    longitude: -73.98390,
    neighborhood: "Midtown",
    borough: "Manhattan",
    notes: "Kiosk format; $3.21; supply may vary day to day",
    location_type: "kiosk",
    website: "https://www.breadsbakery.com",
    instagram: "breadsbakery",
    days_open: "Daily",
    mentions: [],
    original_location: "no",
    status: "active",
  },

  // ── Brooklyn ────────────────────────────────────────────────────────────────
  {
    name: "L'Appartement 4F",
    display_name: "L'Appartement 4F — Brooklyn Heights",
    latitude: 40.69415,
    longitude: -73.99540,
    neighborhood: "Brooklyn Heights",
    borough: "Brooklyn",
    notes: "Laminated croissant-dough roll; rated 9.5/10 by The Carboholic",
    location_type: "bakery",
    website: "https://www.lappartement4f.com",
    instagram: "lappartement4f",
    days_open: "Daily",
    mentions: ["The Carboholic"],
    original_location: "yes",
    status: "active",
  },
  {
    name: "L'imprimerie",
    display_name: null,
    latitude: 40.70060,
    longitude: -73.92785,
    neighborhood: "Bushwick",
    borough: "Brooklyn",
    notes: "French bakery; daily 7am–6pm",
    location_type: "bakery",
    website: "https://limprimerie.nyc",
    instagram: "limprimerie",
    days_open: "Daily",
    mentions: ["The Infatuation"],
    original_location: "yes",
    status: "active",
  },
  {
    name: "Pies 'n' Thighs",
    display_name: null,
    latitude: 40.71205,
    longitude: -73.96285,
    neighborhood: "Williamsburg",
    borough: "Brooklyn",
    notes: "Southern comfort; cinnamon roll made from donut dough with cream cheese frosting",
    location_type: "restaurant",
    website: "https://piesnthighs.com",
    instagram: "piesnthighs",
    days_open: "Daily",
    mentions: ["The Carboholic"],
    original_location: "yes",
    status: "active",
  },
  {
    name: "Yardsale Cafe",
    display_name: null,
    latitude: 40.66215,
    longitude: -73.98450,
    neighborhood: "South Slope",
    borough: "Brooklyn",
    notes: "Babka-adjacent layers; café also sells vintage items",
    location_type: "cafe",
    website: "https://www.yardsalebk.com",
    instagram: "yardsale_cafe",
    days_open: "Daily",
    mentions: ["The Infatuation"],
    original_location: "yes",
    status: "active",
  },
  {
    name: "Peter Pan Donut & Pastry Shop",
    display_name: null,
    latitude: 40.72905,
    longitude: -73.95470,
    neighborhood: "Greenpoint",
    borough: "Brooklyn",
    notes: "NYC institution since 1953; open 365 days from 4:30am",
    location_type: "bakery",
    website: "https://www.peterpandonuts.com",
    instagram: "peterpandonut",
    days_open: "Daily",
    mentions: ["The Infatuation"],
    original_location: "yes",
    status: "active",
  },
  {
    name: "Cloudy Donut Co.",
    display_name: "Cloudy Donut Co. — Brooklyn Heights",
    latitude: 40.69520,
    longitude: -73.99700,
    neighborhood: "Brooklyn Heights",
    borough: "Brooklyn",
    notes: "100% vegan, Black-owned; Fri–Sun only; rotating flavors",
    location_type: "bakery",
    website: "https://www.cloudydonut.com",
    instagram: "cloudydonuts",
    days_open: "Fri–Sun",
    mentions: [],
    original_location: "yes",
    status: "active",
  },
];

async function run() {
  // ── Step 1: Update existing rows ──────────────────────────────────────────
  console.log(`Updating ${existingUpdates.length} existing rows...\n`);
  let updateErrors = 0;

  for (const row of existingUpdates) {
    const { location_type, website, instagram, days_open, mentions, original_location } = row;
    const update = { location_type, website, instagram, days_open, mentions, original_location };

    const query = supabase.from("locations").update(update).eq("name", row.name);
    const result = row.display_name
      ? await query.eq("display_name", row.display_name)
      : await query.is("display_name", null);

    if (result.error) {
      console.error(`  ✗ ${row.display_name ?? row.name}: ${result.error.message}`);
      updateErrors++;
    } else {
      console.log(`  ✓ ${row.display_name ?? row.name}`);
    }
  }

  // ── Step 2: Insert new locations ──────────────────────────────────────────
  console.log(`\nInserting ${newLocations.length} new locations...\n`);

  const { data, error } = await supabase
    .from("locations")
    .insert(newLocations)
    .select("id, name, display_name, location_type");

  if (error) {
    console.error("Insert failed:", error.message);
    process.exit(1);
  }

  console.log(`✓ Inserted ${data?.length} new rows:`);
  data?.forEach((r) => console.log(`  - ${r.display_name ?? r.name} (${r.location_type})`));

  if (updateErrors > 0) {
    console.warn(`\n⚠ ${updateErrors} update(s) failed — check output above.`);
  } else {
    console.log("\n✓ All done.");
  }
}

run();
