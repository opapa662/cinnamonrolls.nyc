import { createClient } from "@supabase/supabase-js";

async function main() {
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data } = await s.from("locations").select("name, source, google_rating, google_hours").eq("status", "active").limit(8);
  data!.forEach((r: Record<string, unknown>) => {
    const hours = (r.google_hours as Record<string, string[]> | null)?.weekday_text;
    console.log(`\n${r.name}`);
    console.log(`  source: ${r.source}`);
    console.log(`  rating: ${r.google_rating}`);
    console.log(`  hours: ${JSON.stringify(hours)}`);
  });
}
main();
