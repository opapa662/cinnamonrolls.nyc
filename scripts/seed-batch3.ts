// scripts/seed-batch3.ts
// Usage: npx tsx --env-file=.env.local scripts/seed-batch3.ts

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const locations = [
  {
    name: "Cinnaholic",
    display_name: null,
    latitude: 40.7590,
    longitude: -73.9875,
    neighborhood: "Midtown",
    borough: "Manhattan",
    location_type: "Bakery",
    notes: "Build-your-own cinnamon roll chain; fully vegan",
    website: "https://www.cinnaholic.com",
    instagram: "cinnaholicnyc",
  },
  {
    name: "Leland Eating & Drinking House",
    display_name: null,
    latitude: 40.6757,
    longitude: -73.9576,
    neighborhood: "Prospect Heights",
    borough: "Brooklyn",
    location_type: "Restaurant",
    notes: null,
    website: "https://www.lelandbrooklyn.com",
    instagram: "lelandbrooklyn",
  },
  {
    name: "Ole & Steen",
    display_name: "Ole & Steen - Union Square",
    latitude: 40.7360,
    longitude: -73.9907,
    neighborhood: "Union Square",
    borough: "Manhattan",
    location_type: "Bakery",
    notes: "Danish bakery chain known for their cinnamon socials",
    website: "https://oleandsteen.us",
    instagram: "oleandsteen_us",
  },
  {
    name: "Ole & Steen",
    display_name: "Ole & Steen - Bryant Park",
    latitude: 40.7536,
    longitude: -73.9844,
    neighborhood: "Bryant Park",
    borough: "Manhattan",
    location_type: "Bakery",
    notes: "Danish bakery chain known for their cinnamon socials",
    website: "https://oleandsteen.us",
    instagram: "oleandsteen_us",
  },
  {
    name: "Ole & Steen",
    display_name: "Ole & Steen - Midtown East",
    latitude: 40.7570,
    longitude: -73.9740,
    neighborhood: "Midtown East",
    borough: "Manhattan",
    location_type: "Bakery",
    notes: "Danish bakery chain known for their cinnamon socials",
    website: "https://oleandsteen.us",
    instagram: "oleandsteen_us",
  },
  {
    name: "Ole & Steen",
    display_name: "Ole & Steen - Upper East Side",
    latitude: 40.7778,
    longitude: -73.9561,
    neighborhood: "Upper East Side",
    borough: "Manhattan",
    location_type: "Bakery",
    notes: "Danish bakery chain known for their cinnamon socials",
    website: "https://oleandsteen.us",
    instagram: "oleandsteen_us",
  },
  {
    name: "One Girl Cookies",
    display_name: null,
    latitude: 40.6864,
    longitude: -73.9947,
    neighborhood: "Cobble Hill",
    borough: "Brooklyn",
    location_type: "Bakery",
    notes: null,
    website: "https://www.onegirlcookies.com",
    instagram: "onegirlcookies",
  },
  {
    name: "Super Nice Coffee and Bakery",
    display_name: "Super Nice - East Harlem",
    latitude: 40.7993,
    longitude: -73.9368,
    neighborhood: "East Harlem",
    borough: "Manhattan",
    location_type: "Café",
    notes: null,
    website: null,
    instagram: "supernicecoffeeandbakery",
  },
  {
    name: "Super Nice Coffee and Bakery",
    display_name: "Super Nice - Manhattan Valley",
    latitude: 40.8000,
    longitude: -73.9637,
    neighborhood: "Manhattan Valley",
    borough: "Manhattan",
    location_type: "Café",
    notes: null,
    website: null,
    instagram: "supernicecoffeeandbakery",
  },
  {
    name: "Sunday Morning",
    display_name: "Sunday Morning - NoMad",
    latitude: 40.7453,
    longitude: -73.9899,
    neighborhood: "NoMad",
    borough: "Manhattan",
    location_type: "Café",
    notes: null,
    website: null,
    instagram: "sundaymorningnyc",
  },
  {
    name: "Petee's Pie Company",
    display_name: "Petee's Pie Company - Lower East Side",
    latitude: 40.7185,
    longitude: -73.9900,
    neighborhood: "Lower East Side",
    borough: "Manhattan",
    location_type: "Bakery",
    notes: null,
    website: "https://www.peteespie.com",
    instagram: "peteespie",
  },
  {
    name: "Petee's Pie Company",
    display_name: "Petee's Pie Company - Clinton Hill",
    latitude: 40.6941,
    longitude: -73.9589,
    neighborhood: "Clinton Hill",
    borough: "Brooklyn",
    location_type: "Bakery",
    notes: null,
    website: "https://www.peteespie.com",
    instagram: "peteespie",
  },
  {
    name: "Serano Bakery",
    display_name: null,
    latitude: 40.7725,
    longitude: -73.9310,
    neighborhood: "Astoria",
    borough: "Queens",
    location_type: "Bakery",
    notes: null,
    website: null,
    instagram: "seranobakery",
  },
];

async function main() {
  console.log(`Inserting ${locations.length} locations...\n`);

  for (const loc of locations) {
    const { data, error } = await supabase
      .from("locations")
      .insert({ ...loc, status: "active" })
      .select("id, name, display_name")
      .single();

    if (error) {
      console.log(`✗ ${loc.display_name ?? loc.name}: ${error.message}`);
    } else {
      console.log(`✓ ${loc.display_name ?? loc.name} (${data.id})`);
    }
  }

  console.log("\nDone.");
}

main();
