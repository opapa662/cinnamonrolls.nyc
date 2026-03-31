import { supabaseAdmin } from "@/lib/supabase-admin";
import AdminDashboard from "./AdminDashboard";

export const revalidate = 0;

export default async function AdminPage() {
  const [{ data: submissions }, { data: locations, count }] = await Promise.all([
    supabaseAdmin
      .from("submissions")
      .select("*, location:location_id(id, name, display_name, neighborhood, borough)")
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("locations")
      .select("id, name, display_name, neighborhood, borough, location_type, status, website, instagram, notes, created_at", { count: "exact" })
      .order("name"),
  ]);

  return (
    <AdminDashboard
      submissions={submissions ?? []}
      locations={locations ?? []}
      locationCount={count ?? 0}
    />
  );
}
