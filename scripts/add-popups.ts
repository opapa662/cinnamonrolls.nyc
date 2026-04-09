// scripts/add-popups.ts
// Usage: npx tsx --env-file=.env.local scripts/add-popups.ts

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const popups = [
  {
    name: "NYC Cinnamon Rolls",
    display_name: null,
    latitude: 40.7128,
    longitude: -74.006,
    neighborhood: null,
    borough: null,
    location_type: "Pop-up",
    notes: "Pop-up vendor bringing fresh cinnamon rolls to NYC. Location announced via Instagram.",
    instagram: "nycinnamonrolls",
    status: "open",
    visible: true,
  },
  {
    name: "Apt. 2 Bread",
    display_name: null,
    latitude: 40.7128,
    longitude: -74.006,
    neighborhood: null,
    borough: null,
    location_type: "Pop-up",
    notes: "Home bakery pop-up. Cinnamon rolls available via pre-order — follow on Instagram for drop announcements.",
    instagram: "apt2bread",
    status: "open",
    visible: true,
  },
];

async function main() {
  for (const popup of popups) {
    const { error } = await supabase.from("locations").insert(popup);
    if (error) console.error(`✗ ${popup.name}:`, error.message);
    else console.log(`✓ Inserted: ${popup.name}`);
  }
}

main();
