// Replaces all em dashes in display_name with hyphens
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data, error } = await supabase
    .from("locations")
    .select("id, display_name")
    .like("display_name", "%—%");

  if (error || !data) { console.error(error); return; }
  console.log(`Found ${data.length} rows with em dashes\n`);

  for (const row of data) {
    const fixed = row.display_name!.replace(/\s*—\s*/g, " - ");
    const { error: updateError } = await supabase
      .from("locations")
      .update({ display_name: fixed })
      .eq("id", row.id);
    if (updateError) console.log(`✗ ${row.display_name}: ${updateError.message}`);
    else console.log(`✓ "${row.display_name}" → "${fixed}"`);
  }
}

main();
