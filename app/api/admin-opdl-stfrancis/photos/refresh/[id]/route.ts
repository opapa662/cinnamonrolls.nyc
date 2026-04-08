import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (req.cookies.get("cr_admin")?.value !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "Google Places API key not configured" }, { status: 500 });
  }

  // Get the location's google_place_id
  const { data: location, error: locationError } = await supabaseAdmin
    .from("locations")
    .select("google_place_id")
    .eq("id", id)
    .single();

  if (locationError || !location) {
    return NextResponse.json({ error: locationError?.message ?? "Location not found" }, { status: 404 });
  }

  const placeId = location.google_place_id;
  if (!placeId) {
    return NextResponse.json({ error: "Location has no google_place_id" }, { status: 400 });
  }

  // Fetch photo references from Places Details API
  const detailsRes = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${key}`
  );
  const detailsData = await detailsRes.json();

  if (detailsData.status !== "OK") {
    return NextResponse.json({ error: `Places API error: ${detailsData.status}` }, { status: 502 });
  }

  const photoRefs: string[] = (detailsData.result?.photos ?? [])
    .slice(0, 10)
    .map((p: { photo_reference: string }) => p.photo_reference);

  if (photoRefs.length === 0) {
    await supabaseAdmin.from("locations").update({ google_photos: JSON.stringify([]) }).eq("id", id);
    return NextResponse.json({ ok: true, photos: [] });
  }

  // Resolve stable URLs in parallel by following redirects
  const photoUrls = await Promise.all(
    photoRefs.map(async (ref) => {
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1080&photo_reference=${ref}&key=${key}`,
          { redirect: "follow" }
        );
        return res.url;
      } catch {
        return null;
      }
    })
  );

  const validUrls = photoUrls.filter((u): u is string => u !== null);

  const { error: updateError } = await supabaseAdmin
    .from("locations")
    .update({ google_photos: JSON.stringify(validUrls) })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, photos: validUrls });
}
