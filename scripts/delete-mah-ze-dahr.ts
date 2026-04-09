// scripts/delete-mah-ze-dahr.ts
// Usage: npx tsx --env-file=.env.local scripts/delete-mah-ze-dahr.ts

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data: matches } = await supabase
    .from("locations")
    .select("id, name, display_name, neighborhood, borough, visible")
    .ilike("name", "%mah-ze-dahr%");

  console.log("Found:", JSON.stringify(matches, null, 2));

  if (!matches || matches.length === 0) {
    console.log("No matches found.");
    return;
  }

  const westVillage = matches.filter(
    (l) => l.neighborhood?.toLowerCase().includes("west village")
  );

  if (westVillage.length === 0) {
    console.log("No West Village Mah-Ze-Dahr found specifically. All matches shown above.");
    return;
  }

  for (const loc of westVillage) {
    const { error } = await supabase.from("locations").delete().eq("id", loc.id);
    if (error) {
      console.error(`Error deleting ${loc.name} (${loc.id}):`, error);
    } else {
      console.log(`Deleted: ${loc.name} — ${loc.neighborhood} (id: ${loc.id})`);
    }
  }
}

main().catch(console.error);
