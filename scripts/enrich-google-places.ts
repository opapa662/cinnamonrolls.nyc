// scripts/enrich-google-places.ts
// Usage: npx tsx scripts/enrich-google-places.ts
//
// Fetches Google Places data (place_id, rating, hours) for all active locations
// and saves incrementally to Supabase.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface PlaceSearchResult {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number;
}

interface PlaceDetails {
  place_id: string;
  rating?: number;
  opening_hours?: {
    weekday_text: string[];
    periods: unknown[];
  };
}

async function findPlace(name: string, lat: number, lng: number): Promise<PlaceSearchResult | null> {
  // Use nearby search ranked by distance — finds the closest branch to the exact coordinates
  const keyword = encodeURIComponent(name);
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?keyword=${keyword}&location=${lat},${lng}&rankby=distance&key=${GOOGLE_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json() as { status: string; results: PlaceSearchResult[] };

  if (data.status !== "OK" || !data.results.length) {
    console.log(`  ✗ Not found (status: ${data.status})`);
    return null;
  }
  return data.results[0];
}

async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  const fields = "place_id,rating,opening_hours";
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json() as { status: string; result: PlaceDetails };

  if (data.status !== "OK") {
    console.log(`  ✗ Details failed (status: ${data.status})`);
    return null;
  }
  return data.result;
}

async function main() {
  const { data: locations, error } = await supabase
    .from("locations")
    .select("id, name, display_name, latitude, longitude, google_place_id")
    .eq("status", "open")
    .is("google_place_id", null)
    .order("name");

  if (error || !locations) {
    console.error("Failed to fetch locations:", error);
    process.exit(1);
  }

  console.log(`Enriching ${locations.length} locations...\n`);

  for (const loc of locations) {
    const displayName = loc.display_name || loc.name;
    console.log(`→ ${displayName}`);

    // Find place
    const place = await findPlace(loc.name, loc.latitude, loc.longitude);
    if (!place) continue;

    console.log(`  ✓ Found: ${place.name} (${place.formatted_address})`);

    // Get details
    const details = await getPlaceDetails(place.place_id);
    if (!details) continue;

    // Save to Supabase
    const { error: updateError } = await supabase
      .from("locations")
      .update({
        google_place_id: place.place_id,
        google_rating: details.rating ?? null,
        google_hours: details.opening_hours ?? null,
      })
      .eq("id", loc.id);

    if (updateError) {
      console.log(`  ✗ Save failed: ${updateError.message}`);
    } else {
      console.log(`  ✓ Saved — rating: ${details.rating ?? "n/a"}, hours: ${details.opening_hours ? "yes" : "no"}`);
    }

    // Be polite to the API
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log("\nDone.");
}

main();
