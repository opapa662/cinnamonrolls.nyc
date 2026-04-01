import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { error } = await supabase
    .from("locations")
    .update({ display_name: "Sunday Morning - East Village" })
    .eq("name", "Sunday Morning")
    .is("display_name", null);

  if (error) console.log(`✗ ${error.message}`);
  else console.log("✓ Sunday Morning - East Village display_name set");
}

main();
