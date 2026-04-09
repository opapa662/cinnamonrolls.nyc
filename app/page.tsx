import Header from "@/components/Header";
import MapPageClient from "@/components/MapPageClient";
import { supabase } from "@/lib/supabase";
import type { Location as MapLocation } from "@/components/Map";

export const revalidate = 3600; // Revalidate every hour — locations change infrequently

export default async function Home() {
  const { data: locations, count } = await supabase
    .from("locations")
    .select("id, name, display_name, latitude, longitude, neighborhood, borough, notes, website, instagram, location_type, days_open, created_at, mentions, google_place_id, google_rating, google_hours, formatted_address, roll_style, gluten_free, dairy_free, vegan", { count: "exact" })
    .eq("visible", true)
    .order("name");

  return (
    <>
      <h1 style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 }}>
        cinnamonrolls.nyc — the ultimate map of the city&apos;s best swirls
      </h1>
      <Header count={count ?? 0} />
      <main
        className="fixed inset-x-0"
        style={{ top: "60px", bottom: "36px" }}
      >
        <MapPageClient locations={(locations ?? []) as MapLocation[]} />
      </main>
    </>
  );
}
