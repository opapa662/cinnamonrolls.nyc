import { supabaseAdmin } from "@/lib/supabase-admin";
import IGGeneratorClient from "./IGGeneratorClient";

export const revalidate = 0;

export default async function IGGeneratorPage() {
  const { data } = await supabaseAdmin
    .from("locations")
    .select("id, name, neighborhood, borough, location_type, google_rating, google_review_count, notes, review, days_open, mentions, instagram")
    .eq("visible", true)
    .order("name");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const spots = (data ?? []).map((r: any) => {
    let mentions: string[] = [];
    try { mentions = typeof r.mentions === "string" ? JSON.parse(r.mentions) : r.mentions || []; } catch { mentions = []; }
    return {
      id: r.id as string,
      name: r.name as string,
      neighborhood: (r.neighborhood || "") as string,
      borough: (r.borough || "") as string,
      type: (r.location_type || "") as string,
      rating: (r.google_rating || null) as number | null,
      review_count: (r.google_review_count || null) as number | null,
      notes: (r.notes || "") as string,
      review: (r.review || "") as string,
      hours: (r.days_open || "") as string,
      featured_by: mentions.length > 0 ? mentions : null,
      instagram: (r.instagram || "") as string,
      photo_url: null,
    };
  });

  return <IGGeneratorClient spots={spots} />;
}
