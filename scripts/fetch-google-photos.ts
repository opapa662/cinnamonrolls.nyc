import { readFileSync } from "fs";
const env = Object.fromEntries(
  readFileSync(".env.local", "utf8").split("\n")
    .filter(l => l.includes("=") && !l.startsWith("#"))
    .map(l => { const [k, ...v] = l.split("="); return [k.trim(), v.join("=").trim().replace(/^"|"$/g, "")]; })
);
const GOOGLE_API_KEY = env.GOOGLE_PLACES_API_KEY;
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const force = process.argv.includes("--force");

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function resolvePhotoUrl(photoReference: string): Promise<string> {
  const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1080&photo_reference=${photoReference}&key=${GOOGLE_API_KEY}`;
  const response = await fetch(url, { redirect: "follow" });
  return response.url;
}

async function main() {
  let query = supabase
    .from("locations")
    .select("id, name, neighborhood, google_place_id, google_photos")
    .not("google_place_id", "is", null);

  if (!force) {
    query = query.is("google_photos", null);
  }

  const { data: locations, error } = await query;

  if (error) {
    console.error("Failed to fetch locations:", error.message);
    process.exit(1);
  }

  if (!locations || locations.length === 0) {
    console.log("No locations to process.");
    return;
  }

  let updated = 0;
  let skipped = 0;
  let errors = 0;
  const total = locations.length;

  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    const label = `${loc.name}${loc.neighborhood ? ` — ${loc.neighborhood}` : ""}`;
    const index = `[${i + 1}/${total}]`;

    try {
      // Fetch place details to get photo references
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${loc.google_place_id}&fields=photos&key=${GOOGLE_API_KEY}`;
      const detailsRes = await fetch(detailsUrl);
      const detailsJson = await detailsRes.json();

      const photoRefs: string[] = (detailsJson.result?.photos ?? [])
        .slice(0, 10)
        .map((p: { photo_reference: string }) => p.photo_reference);

      if (photoRefs.length === 0) {
        console.log(`${index} ${label} → 0 photos (skipped)`);
        skipped++;
        await sleep(200);
        continue;
      }

      // Resolve each photo reference to a stable lh3.googleusercontent.com URL
      const resolvedUrls: string[] = [];
      for (const ref of photoRefs) {
        const url = await resolvePhotoUrl(ref);
        resolvedUrls.push(url);
        await sleep(200);
      }

      // Save incrementally
      const { error: updateError } = await supabase
        .from("locations")
        .update({ google_photos: JSON.stringify(resolvedUrls) })
        .eq("id", loc.id);

      if (updateError) {
        console.error(`${index} ${label} → save failed: ${updateError.message}`);
        errors++;
      } else {
        console.log(`${index} ${label} → ${resolvedUrls.length} photos`);
        updated++;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`${index} ${label} → error: ${message}`);
      errors++;
      await sleep(200);
    }
  }

  console.log(`\nDone. ${updated} locations updated, ${skipped} skipped, ${errors} errors.`);
}

main();
