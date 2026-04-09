// scripts/enrich-addresses.ts
// Usage: npx tsx scripts/enrich-addresses.ts
//
// Fetches formatted_address from Google Places Details API for all locations
// that have a google_place_id but no formatted_address yet.
// Saves incrementally to Supabase.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface PlaceDetails {
  formatted_address?: string;
}

async function getFormattedAddress(placeId: string): Promise<string | null> {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_address&key=${GOOGLE_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json() as { status: string; result: PlaceDetails };

  if (data.status !== "OK") {
    console.log(`  ✗ Details failed (status: ${data.status})`);
    return null;
  }
  return data.result.formatted_address ?? null;
}

async function main() {
  const { data: locations, error } = await supabase
    .from("locations")
    .select("id, name, display_name, google_place_id")
    .eq("visible", true)
    .not("google_place_id", "is", null)
    .is("formatted_address", null)
    .order("name");

  if (error || !locations) {
    console.error("Failed to fetch locations:", error);
    process.exit(1);
  }

  console.log(`Enriching addresses for ${locations.length} locations...\n`);

  for (const loc of locations) {
    const displayName = loc.display_name || loc.name;
    console.log(`→ ${displayName}`);

    const address = await getFormattedAddress(loc.google_place_id);
    if (!address) continue;

    console.log(`  ✓ ${address}`);

    const { error: updateError } = await supabase
      .from("locations")
      .update({ formatted_address: address })
      .eq("id", loc.id);

    if (updateError) {
      console.log(`  ✗ Save failed: ${updateError.message}`);
    } else {
      console.log(`  ✓ Saved`);
    }

    // Be polite to the API
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log("\nDone.");
}

main();
