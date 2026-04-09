// scripts/seed-batch5.ts
// Usage: npx tsx --env-file=.env.local scripts/seed-batch5.ts

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const newLocations = [
  {
    name: "Dreams of Sugar",
    display_name: null,
    latitude: 40.6807,
    longitude: -73.9506,
    neighborhood: "Bed-Stuy",
    borough: "Brooklyn",
    location_type: "Bakery",
    notes: "Black women-owned bakery run by a mom and 3 teen daughters; known for fresh scratch-made cinnamon buns.",
    website: "https://www.dreamsofsugar.com",
    instagram: "dreamsofsugarnyc",
    days_open: "Daily",
    mentions: ["News 12"],
    status: "active",
  },
];

async function main() {
  console.log("Inserting new locations...");
  for (const loc of newLocations) {
    const { error } = await supabase.from("locations").insert(loc);
    if (error) {
      console.error(`  ✗ Failed to insert ${loc.name}:`, error.message);
    } else {
      console.log(`  ✓ Inserted: ${loc.name}`);
    }
  }
  console.log("Done.");
}

main().catch((err) => { console.error(err); process.exit(1); });
