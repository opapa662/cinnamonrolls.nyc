import { supabaseAdmin } from "@/lib/supabase-admin";
import CategorizeClient from "./CategorizeClient";

export const revalidate = 0;

export default async function CategorizePage() {
  const { data } = await supabaseAdmin
    .from("locations")
    .select("id, name, display_name, neighborhood, borough, roll_style, frosting_type, gluten_free, dairy_free, vegan")
    .order("name");

  return <CategorizeClient locations={data ?? []} />;
}
