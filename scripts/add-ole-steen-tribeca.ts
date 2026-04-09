// scripts/add-ole-steen-tribeca.ts
// Usage: npx tsx --env-file=.env.local scripts/add-ole-steen-tribeca.ts

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  // Check existing Ole & Steen locations
  const { data: existing } = await supabase
    .from("locations")
    .select("id, name, display_name, neighborhood, borough, formatted_address, visible")
    .eq("name", "Ole & Steen");
  console.log("Existing Ole & Steen locations:", JSON.stringify(existing, null, 2));

  // Add Tribeca
  const { error } = await supabase.from("locations").insert({
    name: "Ole & Steen",
    display_name: "Ole & Steen — Tribeca",
    latitude: 40.7135,
    longitude: -74.0094,
    neighborhood: "Tribeca",
    borough: "Manhattan",
    location_type: "Bakery",
    formatted_address: "100 Church St, New York, NY 10007",
    website: "https://oleandsteen.com",
    instagram: "oleandsteenusa",
    status: "open",
    visible: true,
  });

  if (error) {
    console.error("Failed to insert:", error.message);
  } else {
    console.log("✓ Inserted Ole & Steen — Tribeca");
  }
}

main();
