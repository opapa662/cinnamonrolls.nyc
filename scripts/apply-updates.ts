// scripts/apply-updates.ts
// Usage: npx tsx --env-file=.env.local scripts/apply-updates.ts

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Update {
  id: string;
  name: string;
  notes: string;
  review: string;
}

const updates: Update[] = JSON.parse(
  readFileSync(join(process.cwd(), "cinnamon_roll_updates.json"), "utf-8")
);

async function main() {
  console.log(`Applying updates for ${updates.length} locations...\n`);

  let updated = 0;
  const notFound: string[] = [];

  for (const entry of updates) {
    const { data, error } = await supabase
      .from("locations")
      .update({ notes: entry.notes, review: entry.review })
      .eq("id", entry.id)
      .select("id")
      .single();

    if (error?.code === "PGRST116") {
      // No row matched
      notFound.push(`${entry.id} (${entry.name})`);
      console.log(`  ✗ Not found: ${entry.name}`);
    } else if (error) {
      console.log(`  ✗ Error on ${entry.name}: ${error.message}`);
    } else if (data) {
      updated++;
      console.log(`  ✓ ${entry.name}`);
    }
  }

  console.log(`\n── Summary ────────────────────────`);
  console.log(`  Updated:   ${updated}`);
  console.log(`  Not found: ${notFound.length}`);
  if (notFound.length > 0) {
    console.log(`\n  Missing IDs:`);
    notFound.forEach((id) => console.log(`    - ${id}`));
  }
  console.log(`\nDone.`);
}

main();
