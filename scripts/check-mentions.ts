import { createClient } from "@supabase/supabase-js";

async function main() {
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data } = await s.from("locations").select("name, display_name, mentions").not("mentions", "is", null);
  data?.forEach((r: Record<string, unknown>) => console.log(`${r.display_name ?? r.name}: ${JSON.stringify(r.mentions)}`));
}
main();
