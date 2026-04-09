import { supabaseAdmin } from "@/lib/supabase-admin";
import AdminDashboard from "./AdminDashboard";

export const revalidate = 0;

function topN(items: string[], n = 10): { name: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const item of items) counts[item] = (counts[item] ?? 0) + 1;
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, count]) => ({ name, count }));
}

export default async function AdminPage() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: submissions }, { data: locations }, { data: contacts }, { data: events }, { data: reviews }] = await Promise.all([
    supabaseAdmin
      .from("submissions")
      .select("*, location:location_id(id, name, display_name, neighborhood, borough)")
      .eq("dismissed", false)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("locations")
      .select("id, name, display_name, neighborhood, borough, location_type, status, visible, website, instagram, notes, created_at")
      .order("name"),
    supabaseAdmin
      .from("contact_submissions")
      .select("id, name, email, message, created_at")
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("analytics_events")
      .select("session_id, event_name, properties, created_at")
      .gte("created_at", thirtyDaysAgo)
      .limit(5000),
    supabaseAdmin
      .from("reviews")
      .select("id, reviewer_name, reviewer_email, rating, body, visited_at, roll_style_tried, status, created_at, location:location_id(id, name, display_name)")
      .order("created_at", { ascending: false }),
  ]);

  const evts = events ?? [];
  const sessions30d = new Set(evts.filter(e => e.event_name === "session_start").map(e => e.session_id)).size;
  const sessions7d = new Set(evts.filter(e => e.event_name === "session_start" && e.created_at >= sevenDaysAgo).map(e => e.session_id)).size;

  const topPins = topN(evts.filter(e => e.event_name === "pin_clicked").map(e => (e.properties as Record<string, string>)?.bakery_name ?? "unknown"));
  const topLocations = topN(evts.filter(e => e.event_name === "location_page_viewed").map(e => (e.properties as Record<string, string>)?.bakery_name ?? "unknown"));
  const deviceSplit = topN(evts.filter(e => e.event_name === "session_start").map(e => (e.properties as Record<string, string>)?.device_type ?? "unknown"));
  const outboundByType = topN(evts.filter(e => e.event_name === "outbound_click").map(e => (e.properties as Record<string, string>)?.link_type ?? "unknown"));

  const activeCount = (locations ?? []).filter((l) => l.visible).length;

  return (
    <AdminDashboard
      submissions={submissions ?? []}
      locations={locations ?? []}
      locationCount={activeCount}
      contacts={contacts ?? []}
      analytics={{ sessions7d, sessions30d, topPins, topLocations, deviceSplit, outboundByType }}
      reviews={(reviews ?? []) as unknown as Parameters<typeof AdminDashboard>[0]["reviews"]}
    />
  );
}
