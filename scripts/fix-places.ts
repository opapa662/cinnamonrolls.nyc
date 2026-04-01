import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const fixes = [
    {
      match: { display_name: "Sunday Morning — NoMad" },
      data: {
        google_place_id: "ChIJB__qIA1ZwokRmgtaYZtTjaI",
        google_rating: 4.8,
        google_hours: {
          weekday_text: [
            "Monday: 9:00 AM – 4:00 PM",
            "Tuesday: 9:00 AM – 4:00 PM",
            "Wednesday: 9:00 AM – 4:00 PM",
            "Thursday: 9:00 AM – 4:00 PM",
            "Friday: 9:00 AM – 4:00 PM",
            "Saturday: 10:00 AM – 4:00 PM",
            "Sunday: 10:00 AM – 4:00 PM",
          ],
        },
      },
    },
    {
      match: { name: "Breads Bakery - Union Square" },
      data: {
        google_place_id: "ChIJcWebfphZwokRRrPNZD7byJw",
        google_rating: 4.6,
        google_hours: {
          weekday_text: [
            "Monday: 7:00 AM – 8:00 PM",
            "Tuesday: 7:00 AM – 8:00 PM",
            "Wednesday: 7:00 AM – 8:00 PM",
            "Thursday: 7:00 AM – 8:00 PM",
            "Friday: 7:00 AM – 8:00 PM",
            "Saturday: 7:00 AM – 8:00 PM",
            "Sunday: 7:00 AM – 8:00 PM",
          ],
        },
      },
    },
  ];

  for (const fix of fixes) {
    const key = Object.keys(fix.match)[0] as "display_name" | "name";
    const val = Object.values(fix.match)[0];
    const { error } = await supabase.from("locations").update(fix.data).eq(key, val);
    if (error) console.log(`✗ ${val}: ${error.message}`);
    else console.log(`✓ Fixed: ${val}`);
  }
}

main();
