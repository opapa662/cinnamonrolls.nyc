import { supabaseAdmin } from "@/lib/supabase-admin";
import PhotoPickerClient from "./PhotoPickerClient";

export const revalidate = 0;

export default async function PhotosPage() {
  const { data: rows } = await supabaseAdmin
    .from("locations")
    .select("id, name, display_name, neighborhood, borough, google_place_id, google_photos, photo_url, photo_source")
    .order("name");

  const locations = (rows ?? []).map((loc) => {
    let google_photos: string[] | null = null;
    if (loc.google_photos) {
      try {
        const parsed = JSON.parse(loc.google_photos);
        google_photos = Array.isArray(parsed) ? parsed : null;
      } catch {
        google_photos = null;
      }
    }
    return { ...loc, google_photos };
  });

  return <PhotoPickerClient locations={locations} />;
}
