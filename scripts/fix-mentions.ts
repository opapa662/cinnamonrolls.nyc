import { createClient } from "@supabase/supabase-js";

async function main() {
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data } = await s.from("locations").select("id, name, display_name, mentions").not("mentions", "is", null);

  for (const row of data ?? []) {
    const mentions = row.mentions as string[];
    if (!mentions.includes("TikTok")) continue;

    const cleaned = mentions.filter((m: string) => m !== "TikTok");
    const { error } = await s.from("locations").update({ mentions: cleaned }).eq("id", row.id);
    const label = row.display_name ?? row.name;
    if (error) console.log(`✗ ${label}: ${error.message}`);
    else console.log(`✓ ${label}: ${JSON.stringify(mentions)} → ${JSON.stringify(cleaned)}`);
  }

  console.log("\nDone.");
}
main();
