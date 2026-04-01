// scripts/seed-batch4.ts
// Usage: npx tsx --env-file=.env.local scripts/seed-batch4.ts

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function deduplicateOleSteenBryantPark() {
  console.log("Deduplicating Ole & Steen - Bryant Park...");

  const { data, error } = await supabase
    .from("locations")
    .select("id, created_at")
    .eq("name", "Ole & Steen")
    .eq("neighborhood", "Bryant Park")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("  ✗ Fetch failed:", error.message);
    return;
  }

  if (!data || data.length <= 1) {
    console.log(`  Found ${data?.length ?? 0} entry — no duplicate to remove.`);
    return;
  }

  console.log(`  Found ${data.length} entries. Keeping oldest (${data[0].id}), removing ${data.length - 1}...`);

  const idsToDelete = data.slice(1).map((r) => r.id);
  const { error: deleteError } = await supabase
    .from("locations")
    .delete()
    .in("id", idsToDelete);

  if (deleteError) {
    console.error("  ✗ Delete failed:", deleteError.message);
  } else {
    console.log(`  ✓ Removed ${idsToDelete.length} duplicate(s).`);
  }
}

const newLocations = [
  {
    name: "Bub's Bakery",
    display_name: null,
    latitude: 40.7248,
    longitude: -73.9966,
    neighborhood: "NoHo",
    borough: "Manhattan",
    location_type: "Bakery",
    notes: null,
    website: null,
    instagram: null,
  },
];

async function main() {
  await deduplicateOleSteenBryantPark();

  console.log(`\nInserting ${newLocations.length} new location(s)...\n`);

  for (const loc of newLocations) {
    const { data, error } = await supabase
      .from("locations")
      .insert({ ...loc, status: "active" })
      .select("id, name")
      .single();

    if (error) {
      console.log(`✗ ${loc.display_name ?? loc.name}: ${error.message}`);
    } else {
      console.log(`✓ ${loc.name} (${data.id})`);
    }
  }

  console.log("\nDone.");
}

main();
