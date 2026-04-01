// scripts/enrich-review-count.ts
// Usage: npx tsx --env-file=.env.local scripts/enrich-review-count.ts
//
// Fetches user_ratings_total from Google Places Details API for all active
// locations that already have a google_place_id, and saves to google_review_count.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function getReviewCount(placeId: string): Promise<number | null> {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=user_ratings_total&key=${GOOGLE_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json() as { status: string; result: { user_ratings_total?: number } };

  if (data.status !== "OK") {
    console.log(`  ✗ Details failed (status: ${data.status})`);
    return null;
  }
  return data.result.user_ratings_total ?? null;
}

async function main() {
  const { data: locations, error } = await supabase
    .from("locations")
    .select("id, name, display_name, google_place_id")
    .eq("status", "active")
    .not("google_place_id", "is", null)
    .order("name");

  if (error || !locations) {
    console.error("Failed to fetch locations:", error);
    process.exit(1);
  }

  console.log(`Fetching review counts for ${locations.length} locations with a Google Place ID...\n`);

  for (const loc of locations) {
    const displayName = loc.display_name || loc.name;
    console.log(`→ ${displayName}`);

    const count = await getReviewCount(loc.google_place_id);
    if (count === null) continue;

    const { error: updateError } = await supabase
      .from("locations")
      .update({ google_review_count: count })
      .eq("id", loc.id);

    if (updateError) {
      console.log(`  ✗ Save failed: ${updateError.message}`);
    } else {
      console.log(`  ✓ ${count.toLocaleString()} reviews`);
    }

    await new Promise((r) => setTimeout(r, 300));
  }

  console.log("\nDone.");
}

main();
