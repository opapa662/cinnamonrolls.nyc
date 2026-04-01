import Header from "@/components/Header";
import MapPageClient from "@/components/MapPageClient";
import { supabase } from "@/lib/supabase";
import type { Location as MapLocation } from "@/components/Map";

export const revalidate = 0;

export default async function Home() {
  const { data: locations, count } = await supabase
    .from("locations")
    .select("id, name, display_name, latitude, longitude, neighborhood, borough, notes, website, instagram, location_type, days_open, created_at, mentions, google_place_id, google_rating, google_hours", { count: "exact" })
    .eq("status", "active")
    .order("name");

  return (
    <>
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
