/**
 * Seed script for city_locations table.
 * Run AFTER the table is created via supabase/migrations/011_city_locations.sql
 *
 * Usage: node scripts/seed-city-locations.js
 */

require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const spots = [
  // ─── SYDNEY ───────────────────────────────────────────────────────────────
  {
    city: "Sydney", country: "Australia", name: "Sundays", neighborhood: "Bondi",
    formatted_address: "211 Bondi Road, Bondi NSW 2026",
    location_type: "micro-bakery", roll_style: "classic",
    notes: "No signage, no walk-ins — find it by following Instagram. Cold-fermented overnight, double-risen before baking. Sells out by 10:30am on weekends. The most-talked-about scroll in Sydney since 2024.",
    price_approx: "AUD $9", mentions: ["Broadsheet", "Good Food"],
  },
  {
    city: "Sydney", country: "Australia", name: "Penelope Bakery & Coffee Roaster", neighborhood: "Coogee",
    formatted_address: "180 Coogee Bay Road, Coogee NSW 2034",
    location_type: "bakery", roll_style: "classic", google_rating: 4.8,
    notes: "17 trays of 12 scrolls baked daily — all routinely gone by 10:30am. Five-hour rise, generous butter. The bakery also roasts its own coffee in-house.",
    price_approx: "AUD $9.50", website: "penelopebakery.com.au", mentions: ["Broadsheet"],
  },
  {
    city: "Sydney", country: "Australia", name: "Foli Bakery", neighborhood: "Campsie",
    formatted_address: "32A Harp Street, Campsie NSW 2194",
    location_type: "bakery", roll_style: "laminated",
    notes: "Baker trained at France's Institut National de la Boulangerie Patisserie and Tartine Seoul. Japanese-French-Korean brioche dough finished with cardamom cream cheese. Used organic stone-ground flour. Drawing queues within weeks of opening.",
    price_approx: "AUD $13.50", mentions: ["Broadsheet"],
  },
  {
    city: "Sydney", country: "Australia", name: "Fika Swedish Kitchen", neighborhood: "Manly",
    formatted_address: "5B Market Lane, Manly NSW 2095",
    location_type: "café", roll_style: "cardamom",
    notes: "Sydney's dedicated Swedish café, open since 2013. Kanelbullar tied in a knot (not a scroll), baked throughout the day and served warm. Cardamom-infused dough, pearl sugar on top — the real thing.",
    price_approx: "AUD $6–8", website: "fika.au", mentions: ["Broadsheet"],
  },
  {
    city: "Sydney", country: "Australia", name: "Rollers Bakehouse", neighborhood: "Manly",
    formatted_address: "19 Rialto Lane, Manly NSW 2095",
    location_type: "bakery", roll_style: "laminated", google_rating: 4.5,
    notes: "Laminated dough applied to a cinnamon scroll — somewhere between a croissant and a classic bun. No cream cheese icing, just cinnamon sugar dusting so the butter and dough lead. Time Out called it the new Northern Beaches champion.",
    price_approx: "AUD $8.50", website: "rollersbakehouse.com", mentions: ["Time Out Sydney"],
  },
  {
    city: "Sydney", country: "Australia", name: "Baker Bleu", neighborhood: "Double Bay",
    formatted_address: "2 Guilfoyle Ave, Double Bay NSW 2028",
    location_type: "bakery", roll_style: "classic",
    notes: "Melbourne cult bakery's first Sydney outpost. Yeasted brioche dough, sour cream icing that's tangy rather than cloyingly sweet. Broadsheet called it 'the most perfect bake.'",
    price_approx: "AUD $9–12", website: "bakerbleu.com.au", mentions: ["Broadsheet", "Time Out Sydney"],
  },
  {
    city: "Sydney", country: "Australia", name: "Miss Sina", neighborhood: "Marrickville",
    formatted_address: "132 Illawarra Road, Marrickville NSW 2204",
    location_type: "bakery", roll_style: "vegan", google_rating: 4.7,
    notes: "Founded by German baker Sina Klug. Everything plant-based, including a standout franzbrötchen — the love child of a cinnamon scroll and a croissant, flaky and soft with cinnamon butter. Gordon Ramsay approved the vegan scroll on camera.",
    price_approx: "AUD $8.50", website: "misssina.com.au", mentions: ["Broadsheet"],
  },

  // ─── LONDON ───────────────────────────────────────────────────────────────
  {
    city: "London", country: "United Kingdom", name: "Roll Boys", neighborhood: "Shoreditch",
    formatted_address: "141 Commercial Street, London E1 6BJ",
    location_type: "pop-up", roll_style: "classic",
    notes: "Weekend-only pop-up (Sat & Sun 10am–2pm) with 138K Instagram followers. Served within 30 minutes of baking. The Infatuation named it London's best cinnamon roll. Cookie Butter version with Biscoff icing is the fan favourite.",
    price_approx: "£5–5.50", instagram: "rollboysldn", mentions: ["The Infatuation"],
  },
  {
    city: "London", country: "United Kingdom", name: "Fortitude Bakehouse", neighborhood: "Bloomsbury",
    formatted_address: "35 Colonnade, London WC1N 1JD",
    location_type: "bakery", roll_style: "classic", google_rating: 4.8, google_review_count: 1500,
    notes: "The outer layers are as cinnamon-rich as the center — most rolls lose flavour at the edges. Sticky exterior, chewy crumb, perfect frosting-to-dough ratio. The Infatuation gave it 8.3/10. Sells out by 1pm.",
    price_approx: "£4–5", website: "fortitudebakehouse.com", mentions: ["The Infatuation", "Londonist"],
  },
  {
    city: "London", country: "United Kingdom", name: "Buns From Home", neighborhood: "Notting Hill",
    formatted_address: "128 Talbot Road, London W11 1JR",
    location_type: "bakery", roll_style: "laminated",
    notes: "Lockdown-founded bakery (crowdfunded into a proper shop). Croissant-laminated dough with muscovado sugar filling — flaky and pull-apart in a way a standard roll isn't. Hot Dinners and Londonaire both call it London's best. Vegan versions available.",
    price_approx: "£4–5", website: "bunsfromhome.com", mentions: ["Hot Dinners"],
  },
  {
    city: "London", country: "United Kingdom", name: "Fabrique Bakery", neighborhood: "Hoxton",
    formatted_address: "385 Geffrye Street, London E2 8HZ",
    location_type: "bakery", roll_style: "cardamom",
    notes: "Stockholm-founded bakery. Buns are knotted rather than spiralled — a distinctive Nordic technique. Generous cinnamon butter filling, touch of cardamom, pearl sugar finish. Multiple central London locations. ~£3 per knotted bun is the best price-to-quality on this list.",
    price_approx: "£3–3.50", website: "fabrique.co.uk", mentions: ["Stylist", "Londonist"],
  },
  {
    city: "London", country: "United Kingdom", name: "Bageriet Swedish Bakery", neighborhood: "Covent Garden",
    formatted_address: "24 Rose Street, London WC2E 9EA",
    location_type: "bakery", roll_style: "cardamom", google_rating: 4.7,
    notes: "Tucked down an alley most tourists walk past. Buns arrive warm in the morning and taste like Stockholm — fluffy, moist crumb with crisp exterior, not overly sweet. London's most authentic Swedish bakery experience.",
    price_approx: "£3–4", mentions: ["Londonist", "About Time Magazine"],
  },
  {
    city: "London", country: "United Kingdom", name: "Violet Cakes", neighborhood: "Hackney",
    formatted_address: "47 Wilton Way, London E8 3ED",
    location_type: "bakery", roll_style: "cardamom", google_rating: 4.5,
    notes: "Founded by Claire Ptak, who made Meghan Markle and Prince Harry's wedding cake. The cinnamon bun skews savoury-leaning — cardamom adds floral complexity, organic flour, restrained sweetness. For visitors who find most rolls too sweet, this is the right answer.",
    price_approx: "£4–5", website: "violetcakes.com", mentions: ["The Infatuation", "Time Out"],
  },
  {
    city: "London", country: "United Kingdom", name: "Bread Ahead Bakery", neighborhood: "Southwark",
    formatted_address: "Cathedral Street, Borough Market, London SE1 9DE",
    location_type: "bakery", roll_style: "classic",
    notes: "Borough Market's most-photographed bakery stall. Two versions: the standard cinnamon roll and the Sinner — loaded with sweet lightly spiced cream. Eat while wandering one of London's best food destinations.",
    price_approx: "£3.50–4.50", website: "breadahead.com", mentions: ["Time Out"],
  },

  // ─── BOSTON ───────────────────────────────────────────────────────────────
  {
    city: "Boston", country: "United States", name: "Flour Bakery + Cafe", neighborhood: "South End",
    formatted_address: "1595 Washington St, Boston, MA 02118",
    location_type: "bakery", roll_style: "classic", google_rating: 4.6,
    notes: "Brown butter cinnamon roll from James Beard Award–winning baker Joanne Chang (2016). She beat Bobby Flay on Food Network's Throwdown with the sticky bun. Eat This Not That named Flour the #1 Massachusetts cinnamon roll. Five locations across Boston.",
    price_approx: "$5.50", website: "flourbakery.com", mentions: ["James Beard Award", "Food Network"],
  },
  {
    city: "Boston", country: "United States", name: "Sofra Bakery & Cafe", neighborhood: "Cambridge",
    formatted_address: "1 Belmont St, Cambridge, MA 02138",
    location_type: "bakery", roll_style: "cardamom",
    notes: "Morning bun scented with cardamom and glazed with orange blossom — a floral bouquet in pastry form. From James Beard Award–winning chef Ana Sortun. Nothing else in Boston tastes like this. Also does a date-sweetened cinnamon roll with cream cheese.",
    price_approx: "$5.75", website: "sofrabakery.com", mentions: ["James Beard Award"],
  },
  {
    city: "Boston", country: "United States", name: "Tatte Bakery & Cafe", neighborhood: "Back Bay",
    formatted_address: "399 Boylston St, Boston, MA 02116",
    location_type: "bakery", roll_style: "classic",
    notes: "Cinnamon & Pecan Rose — brioche dough shaped into an elaborate rose form, layered with cinnamon and pecan filling. The most aesthetically recognized bakery in Boston. Israeli-influenced pastry program across 20+ locations.",
    price_approx: "$6–7", website: "tattebakery.com", instagram: "tattebakery", mentions: ["Boston Globe"],
  },
  {
    city: "Boston", country: "United States", name: "Clear Flour Bread", neighborhood: "Brookline",
    formatted_address: "178 Thorndike St, Brookline, MA 02446",
    location_type: "bakery", roll_style: "laminated", google_rating: 4.5, google_review_count: 843,
    notes: "Boston Magazine Best Sticky Bun winner in both 1994 and 1997 — the only repeat winner. Laminated dough gives a flaky, almost croissant-like texture. Established 1982, one of the oldest serious artisan bakeries in the Boston area.",
    price_approx: "$4–5", website: "clearflourbread.com", mentions: ["Boston Magazine"],
  },
  {
    city: "Boston", country: "United States", name: "Elephantine Bakery", neighborhood: "Fort Point",
    formatted_address: "332 Congress St, Boston, MA 02210",
    location_type: "bakery", roll_style: "cardamom",
    notes: "Both a traditional cinnamon roll and a Scandinavian-style cardamom bun, side by side — the only spot in Boston proper offering both. Named #1 new bakery in Boston by Beli in 2025. Harvard Crimson gave it 4 stars.",
    price_approx: "$5–6", website: "elephantinebakery.com", mentions: ["Harvard Crimson", "Beli"],
  },
  {
    city: "Boston", country: "United States", name: "Asaro Bakery & Cafe", neighborhood: "Cambridge",
    formatted_address: "1629 Cambridge St, Cambridge, MA 02138",
    location_type: "bakery", roll_style: "classic", google_rating: 4.7, google_review_count: 246,
    notes: "Maple frosting rather than cream cheese — a distinctive choice that gives a warmer, less tangy finish. Multiple reviewers call it the best cinnamon roll in greater Boston. Family-run by Israeli-American bakers, opened June 2024.",
    price_approx: "$5–6", mentions: ["JewishBoston"],
  },

  // ─── PHILADELPHIA ─────────────────────────────────────────────────────────
  {
    city: "Philadelphia", country: "United States", name: "K'Far Cafe", neighborhood: "Rittenhouse Square",
    formatted_address: "110 S 19th St, Philadelphia, PA 19103",
    location_type: "café", roll_style: "classic", google_rating: 4.5, google_review_count: 742,
    notes: "From Michael Solomonov (Zahav) and James Beard–winning pastry chef Camille Cogswell. Israeli-inflected pistachio sticky bun — tangzhong dough, pistachio-lemon-butter filling, caramelized brown sugar. Reviewers use hyperbolic language. Sells out before noon.",
    price_approx: "$5", website: "kfarcafe.com", mentions: ["Philadelphia Inquirer", "Philadelphia Magazine"],
  },
  {
    city: "Philadelphia", country: "United States", name: "Beiler's Bakery", neighborhood: "Center City",
    formatted_address: "51 N 12th St, Philadelphia, PA 19107",
    location_type: "bakery", roll_style: "classic", google_rating: 4.8, google_review_count: 1343,
    notes: "Family-owned Pennsylvania Dutch bakery inside Reading Terminal Market since 1984. #1 ranked bakery in Philadelphia on TripAdvisor. Watch them make the buns fresh on-site. Named one of America's 20 Best Dessert Spots by CBS.",
    price_approx: "$3–4", mentions: ["Food Network", "CBS Philadelphia"],
  },
  {
    city: "Philadelphia", country: "United States", name: "High Street Philadelphia", neighborhood: "Old City",
    formatted_address: "101 S 9th St, Philadelphia, PA 19107",
    location_type: "bakery", roll_style: "classic",
    notes: "Sourdough challah cinnamon bun from James Beard–nominated chef Eli Kulp. Ships nationwide on Goldbelly ($45.95 for 4-pack). The locally-milled wheat sourdough dough makes this unlike anything from a standard bakery. The Infatuation: 8.5/10.",
    price_approx: "$5–7", website: "highstreetonmarket.com", mentions: ["Bon Appétit", "Goldbelly"],
  },
  {
    city: "Philadelphia", country: "United States", name: "New June Bakery", neighborhood: "Brewerytown",
    formatted_address: "2623 W Girard Ave, Philadelphia, PA 19130",
    location_type: "bakery", roll_style: "classic",
    notes: "Opened December 2024. Earl Grey syrup buns and caramel-tacky classics from 2024 Rising Star Chef (StarChefs). The Infatuation: 'the smears of frosting and caramel-tacky fingers are worth it.' Best of Philly 2023 winner. Also covered by NYT T Magazine and Food & Wine.",
    price_approx: "$5–8", website: "new-june.com", mentions: ["The Infatuation", "Philadelphia Magazine"],
  },
  {
    city: "Philadelphia", country: "United States", name: "Cake Life Bake Shop", neighborhood: "Fishtown",
    formatted_address: "1306 Frankford Ave, Philadelphia, PA 19125",
    location_type: "bakery", roll_style: "classic", google_rating: 4.3, google_review_count: 324,
    notes: "Enormous Sunday-morning rolls out of the oven after 11am — locals line up specifically for them. Woman- and trans-owned. Made cakes for Beyoncé. Reviewers: 'ridiculously good — so soft, sweet, and massive.'",
    price_approx: "$5–7", website: "cakelifebakeshop.com", mentions: ["Best of Philly"],
  },

  // ─── CHICAGO ──────────────────────────────────────────────────────────────
  {
    city: "Chicago", country: "United States", name: "Ann Sather", neighborhood: "Lakeview",
    formatted_address: "909 W Belmont Ave, Chicago, IL 60657",
    location_type: "restaurant", roll_style: "classic", google_rating: 4.3, google_review_count: 1200,
    notes: "Chicago's defining cinnamon roll institution since 1945. Originally served as complimentary bread basket items at this Swedish diner. Oversized, sweet, glazed, two per order. The Infatuation: 'everything you want in a cinnamon roll and then some.' Deep, unreasonable loyalty from Chicagoans.",
    price_approx: "$6–8", website: "annsather.com", mentions: ["The Infatuation", "Food Network", "Travel + Leisure"],
  },
  {
    city: "Chicago", country: "United States", name: "Kanela Breakfast Club", neighborhood: "Wicker Park",
    formatted_address: "1408 N Milwaukee Ave, Chicago, IL 60647",
    location_type: "restaurant", roll_style: "classic",
    notes: "Named Travel + Leisure World's Best Cinnamon Roll (2022). Buttermilk-and-butter brioche dough rolled thin and baked in a deep pan with melted sugar pooling underneath. Crispy exterior, pillow-soft inside. The name is Greek for cinnamon.",
    price_approx: "$12", website: "kanelabreakfastclub.com", mentions: ["Travel + Leisure World's Best"],
  },
  {
    city: "Chicago", country: "United States", name: "Lost Larson", neighborhood: "Andersonville",
    formatted_address: "5318 N Clark St, Chicago, IL 60640",
    location_type: "bakery", roll_style: "cardamom", google_rating: 4.2,
    notes: "Owner Bobby Schaffer mills his own flour in-house from regional Illinois farms, opening in Andersonville — Chicago's historic Swedish neighborhood, steps from the Swedish American Museum. Cardamom buns are 'really heavy with cardamom' — no timid nod to tradition. Named Illinois' best bakery by Mashed.",
    price_approx: "$5–7", website: "lostlarson.com", mentions: ["Mashed #1 Illinois Bakery", "NBC Chicago"],
  },
  {
    city: "Chicago", country: "United States", name: "Mindy's Bakery", neighborhood: "Wicker Park",
    formatted_address: "1623 N Milwaukee Ave, Chicago, IL 60647",
    location_type: "bakery", roll_style: "classic", google_rating: 4.3, google_review_count: 2600,
    notes: "James Beard Outstanding Pastry Chef (2012 winner) Mindy Segal's passion project after HotChocolate. Massive cinnamon roll with cinnamon cream cheese glaze — outer layers with slight crunch, soft and gooey center. Long lines are standard; go early.",
    price_approx: "$8–12", website: "mindysbakery.com", mentions: ["James Beard Award"],
  },
  {
    city: "Chicago", country: "United States", name: "Sugar Moon Bakery", neighborhood: "Logan Square",
    formatted_address: "3612 W Wrightwood Ave, Chicago, IL 60647",
    location_type: "bakery", roll_style: "cardamom",
    notes: "Weekend-only micro-bakery (Fri–Sun until sold out). The Chai Roll has chai spice filling and brown butter cream cheese icing. Lines form before opening. One of the best, if not the best bakery in the city per reviewers — remarkable for a tiny no-frills spot.",
    price_approx: "$5–7", website: "sugarmoonchicago.com", mentions: ["Yelp Top Bakery"],
  },
  {
    city: "Chicago", country: "United States", name: "Floriole Cafe & Bakery", neighborhood: "Lincoln Park",
    formatted_address: "1220 W Webster Ave, Chicago, IL 60614",
    location_type: "bakery", roll_style: "laminated", google_rating: 4.4, google_review_count: 585,
    notes: "Laminated croissant dough pinwheeled around cinnamon brown sugar with orange zest — dozens of shatteringly crisp, buttery layers rather than a soft spiral. French-leaning, women-owned, using Midwestern ingredients. Also sells a Take & Bake version.",
    price_approx: "$6–8", website: "floriole.com", mentions: ["Choose Chicago", "The Infatuation"],
  },

  // ─── AUSTIN ───────────────────────────────────────────────────────────────
  {
    city: "Austin", country: "United States", name: "Upper Crust Bakery", neighborhood: "Rosedale",
    formatted_address: "4508 Burnet Rd, Austin, TX 78756",
    location_type: "bakery", roll_style: "classic", google_rating: 4.6,
    notes: "The Infatuation declared with 'absolute certainty' these are the best cinnamon rolls in the world. Made with multiple layers of fresh, flaky pastry dough rather than typical enriched bread — crisp-edged, gooey-centered, enormous. Austin institution since 1975. Arrive before noon.",
    price_approx: "$3.25–4", website: "uppercrustbakery.com", mentions: ["The Infatuation", "Austin Chronicle"],
  },
  {
    city: "Austin", country: "United States", name: "Teal House Coffee + Bakery", neighborhood: "South Congress",
    formatted_address: "2304 S Congress Ave, Austin, TX 78704",
    location_type: "bakery", roll_style: "classic", google_rating: 4.6, google_review_count: 400,
    notes: "The go-to Austin cinnamon roll per local food media and TikTok. Restrained and intentional — the icing acts like a glaze that soaks in when warmed, creating gooeyness without being cloying. Family-owned, brick-and-mortar since 2021 on the South Congress strip.",
    price_approx: "$5–6", website: "tealhouse.co", mentions: ["Austin Chronicle"],
  },
  {
    city: "Austin", country: "United States", name: "Swedish Hill", neighborhood: "Clarksville",
    formatted_address: "1128 W 6th St, Austin, TX 78703",
    location_type: "bakery", roll_style: "classic", google_rating: 4.4,
    notes: "One of Austin's most beloved bakery institutions — the original Sweetish Hill opened 1975, now rebranded by McGuire Moorman Lambert hospitality group. Decades of institutional reputation. The Austin Chronicle featured it in their cinnamon roll roundup. Three locations.",
    price_approx: "$6–8", website: "swedishhillbakery.com", mentions: ["Austin Chronicle"],
  },
  {
    city: "Austin", country: "United States", name: "Cranky Granny's Sweet Rolls", neighborhood: "Pflugerville",
    formatted_address: "16051 Dessau Rd Suite F, Austin, TX 78728",
    location_type: "bakery", roll_style: "classic", google_rating: 4.7,
    notes: "Black woman-owned. Every 10 minutes a new batch exits the oven. Unambiguously dessert-scale in 10+ rotating flavors: banana pudding, peach cobbler, tres leches, Oreo, peanut butter. The Austin food scene's 'wildest' cinnamon rolls.",
    price_approx: "$7.89–8.19", website: "crankygrannys.com", mentions: ["Austin Chronicle"],
  },
  {
    city: "Austin", country: "United States", name: "Fixe Southern House", neighborhood: "Downtown",
    formatted_address: "500 W 5th St, Austin, TX 78701",
    location_type: "restaurant", roll_style: "classic",
    notes: "Biscuit dough rather than yeasted bread — a flaky, buttery exterior with a soft, pillowy interior and vanilla glaze. Brunch-only (Sundays 11am–2pm). Tied for the #1 cinnamon roll in Austin alongside Teal House per local bloggers.",
    price_approx: "$9", website: "fixesouthernhouse.com", mentions: ["Guide 2 Austin"],
  },

  // ─── SAN FRANCISCO ────────────────────────────────────────────────────────
  {
    city: "San Francisco", country: "United States", name: "Devil's Teeth Baking Company", neighborhood: "Outer Sunset",
    formatted_address: "3876 Noriega St, San Francisco, CA 94122",
    location_type: "bakery", roll_style: "classic", google_rating: 4.6, google_review_count: 2500,
    notes: "Owner uses her Ukrainian grandmother's recipe. Instead of white icing, each buttery coil is painted with thick caramelized sugar. Laminated dough pulls apart in gauze-thin layers. 7x7 Bay Area: 'perennial line snaking out the door.' The cult roll. Get there early.",
    price_approx: "$4–5", website: "devilsteethbakingcompany.com", mentions: ["7x7 Bay Area", "The Infatuation"],
  },
  {
    city: "San Francisco", country: "United States", name: "Astranda Bakery", neighborhood: "Mission",
    formatted_address: "3198 16th St, San Francisco, CA 94103",
    location_type: "pop-up", roll_style: "classic",
    notes: "Run by Eric Chow, former pastry chef at both Tartine and Bar Agricole. Fluffy, soft roll with coffee-caramel sauce and coffee-flavored frosting — cinnamon roll meets tiramisu. The Infatuation: 'do what you need to do to get your hands on one.' Pre-order essentially required.",
    price_approx: "$6–8", instagram: "astrandabakery", mentions: ["The Infatuation"],
  },
  {
    city: "San Francisco", country: "United States", name: "Tartine Bakery", neighborhood: "Mission",
    formatted_address: "600 Guerrero St, San Francisco, CA 94110",
    location_type: "bakery", roll_style: "laminated", google_rating: 4.5, google_review_count: 9100,
    notes: "The morning bun that made SF food tourists line up before the bakery opened. Laminated croissant dough creates a shatteringly crisp, caramelized exterior coated in cinnamon-orange sugar — the orange zest brightens what would otherwise be pure richness. $5.25, one of the best pastry values in the city.",
    price_approx: "$5.25", website: "tartinebakery.com", mentions: ["James Beard Award", "Bon Appétit"],
  },
  {
    city: "San Francisco", country: "United States", name: "Kahnfections", neighborhood: "Mission",
    formatted_address: "3321 20th St, San Francisco, CA 94110",
    location_type: "bakery", roll_style: "classic", google_rating: 4.7, google_review_count: 322,
    notes: "Weekend-only cinnamon roll ($5) with cream cheese frosting that multiple reviewers call 'nothing short of divine.' Rivals Devil's Teeth for top SF cinnamon roll per Yelp. Pre-order via Tock recommended. The bakery is best known for its biscuit sandwiches, but the roll has its own devoted crowd.",
    price_approx: "$5", website: "kahnfections.com", mentions: ["Yelp Top"],
  },
  {
    city: "San Francisco", country: "United States", name: "Hayes Valley Bakeworks", neighborhood: "Hayes Valley",
    formatted_address: "550 Gough St, San Francisco, CA 94102",
    location_type: "bakery", roll_style: "classic",
    notes: "Run by Toolworks, a nonprofit providing job training. The Maple Bacon Cinnamon Roll ($3.75) layers crispy bacon into cinnamon-sugar Danish dough with cream cheese icing. TripAdvisor: 'so incredible you won't share.' Weekdays only. Possibly the best value on this list.",
    price_approx: "$3.75", website: "bakeworkssf.com", mentions: ["TripAdvisor"],
  },
  {
    city: "San Francisco", country: "United States", name: "Loquat", neighborhood: "Hayes Valley",
    formatted_address: "198 Gough St, San Francisco, CA 94102",
    location_type: "bakery", roll_style: "cardamom", google_rating: 4.5, google_review_count: 299,
    notes: "From former Tartine pastry chef Kristina Costa. Jewish/Levantine-inspired cinnamon date babka — laminated golden-brown swirl packed with sweet date paste and warm cinnamon. Named one of Bon Appétit's 9 most exciting bakeries of 2024.",
    price_approx: "$5–7", website: "loquatsf.com", mentions: ["Bon Appétit Best Bakeries 2024"],
  },

  // ─── LOS ANGELES ──────────────────────────────────────────────────────────
  {
    city: "Los Angeles", country: "United States", name: "All About The Cinnamon", neighborhood: "Sherman Oaks",
    formatted_address: "4341 Van Nuys Blvd, Sherman Oaks, CA 91403",
    location_type: "bakery", roll_style: "classic",
    notes: "The only LA bakery dedicated exclusively to cinnamon rolls. Hip-hop concept — rolls named after rap legends (Big Poppa, LL Cool J, Missy Elliot). Started as a Smorgasburg pop-up, opened brick-and-mortar September 2025. LAmag February 2026 cover story.",
    price_approx: "$10–12", website: "allaboutthecinnamon.com", mentions: ["LAmag", "The Infatuation", "NBC Los Angeles"],
  },
  {
    city: "Los Angeles", country: "United States", name: "Badash Bakes", neighborhood: "Pasadena",
    formatted_address: "247 E Colorado Blvd, Pasadena, CA 91101",
    location_type: "bakery", roll_style: "classic",
    notes: "Went TikTok-viral almost immediately — owner Ashley Cunningham has 600K TikTok followers. The Infatuation called it 'arguably the most visually flawless cinnamon roll in the city.' Neat Fibonacci spirals, fragrant cinnamon, not-too-sweet frosting with a citrus note. The matcha version is equally photogenic.",
    price_approx: "$7–8", website: "badashbakes.com", mentions: ["The Infatuation", "KTLA", "Pasadena Magazine"],
  },
  {
    city: "Los Angeles", country: "United States", name: "Clark Street Bakery", neighborhood: "Echo Park",
    formatted_address: "331 Glendale Blvd, Los Angeles, CA 90026",
    location_type: "bakery", roll_style: "cardamom",
    notes: "One of LA's most respected artisan bread operations (founded 2014). Swedish kanelbullar — chewy enriched dough, heavy on cinnamon, dusted with pearl sugar rather than drowned in frosting. Companion cardamom bun adds floral complexity. Multiple LA locations.",
    price_approx: "$6", website: "clarkstreetbakery.com", mentions: ["The Infatuation"],
  },
  {
    city: "Los Angeles", country: "United States", name: "Lodge Bread Company", neighborhood: "Culver City",
    formatted_address: "11918 Washington Blvd, Los Angeles, CA 90066",
    location_type: "bakery", roll_style: "classic", google_rating: 4.5, google_review_count: 1112,
    notes: "The Infatuation: 'the size of a not-small baby's head' and 'a legitimate tourist attraction.' From one of LA's celebrated bread operations. Frosting served on the side so you control sweetness. Feeds 2–4 people.",
    price_approx: "$7", website: "lodgebread.com", mentions: ["The Infatuation", "Time Out LA"],
  },
  {
    city: "Los Angeles", country: "United States", name: "Gjusta", neighborhood: "Venice",
    formatted_address: "320 Sunset Ave, Venice, CA 90291",
    location_type: "bakery", roll_style: "laminated", google_rating: 4.5, google_review_count: 2332,
    notes: "Sprawling warehouse bakery from the Gjelina hospitality group. Cinnamon knot uses layers of buttery laminated dough twisted with cinnamon sugar — deeply caramelized at the edges. Line snakes outside most mornings. Mandatory 15–20% service charge.",
    price_approx: "$7–9", website: "gjusta.com", mentions: ["The Infatuation", "LAmag"],
  },
  {
    city: "Los Angeles", country: "United States", name: "Huckleberry Bakery & Cafe", neighborhood: "Santa Monica",
    formatted_address: "1014 Wilshire Blvd, Santa Monica, CA 90401",
    location_type: "bakery", roll_style: "classic", google_rating: 4.5, google_review_count: 2370,
    notes: "Dense and sticky rather than pillowy, coated in granulated sugar — closer to a morning bun in spirit. Organic, seasonal ingredients from the Santa Monica Farmers' Market. The Infatuation: 'easily one of the best in town.' Phil Rosenthal (Somebody Feed Phil) is a public fan.",
    price_approx: "$6–8", website: "huckleberrycafe.com", mentions: ["The Infatuation"],
  },
  {
    city: "Los Angeles", country: "United States", name: "All Time", neighborhood: "Los Feliz",
    formatted_address: "2040 Hillhurst Ave, Los Angeles, CA 90027",
    location_type: "restaurant", roll_style: "classic",
    notes: "No frosting — none. The brioche dough is so moist, sticky, and generously cinnamon-filled that the absence of icing is irrelevant. The Infatuation: 'you won't notice the absence of anything.' A roll for people who think frosting is a distraction.",
    price_approx: "$9", website: "alltimelosangeles.com", mentions: ["The Infatuation"],
  },

  // ─── SEATTLE ──────────────────────────────────────────────────────────────
  {
    city: "Seattle", country: "United States", name: "Sea Wolf Bakers", neighborhood: "Fremont",
    formatted_address: "3617 Stone Way N, Seattle, WA 98103",
    location_type: "bakery", roll_style: "laminated", google_rating: 4.7, google_review_count: 445,
    notes: "The consensus pick for best in Seattle. Same laminated dough as their acclaimed croissants — crunchy caramelized exterior, flaky croissant-like interior. Enormous. James Beard Award Semifinalist for Outstanding Baker (2019). Sells out by mid-morning on weekends.",
    price_approx: "$7", website: "seawolfbakers.com", mentions: ["James Beard Semifinalist", "The Infatuation"],
  },
  {
    city: "Seattle", country: "United States", name: "Bakery Nouveau", neighborhood: "West Seattle",
    formatted_address: "4737 California Ave SW, Seattle, WA 98116",
    location_type: "bakery", roll_style: "classic", google_rating: 4.6, google_review_count: 1754,
    notes: "Owner William Leaman was Captain of the World Champion 2005 Bread Baker's Guild Team USA. Tightly wound with Vietnamese cinnamon, served warm with citrusy cream cheese icing. Zagat 28/30. Seattle Times Best in the PNW (2023). Also Capitol Hill and Burien locations.",
    price_approx: "$4.75", website: "bakerynouveau.com", mentions: ["Zagat", "Seattle Times", "Good Food Awards"],
  },
  {
    city: "Seattle", country: "United States", name: "The Flour Box", neighborhood: "Hillman City",
    formatted_address: "5520 Rainier Ave S, Seattle, WA 98118",
    location_type: "bakery", roll_style: "classic",
    notes: "POC woman-owned bakery. The Infatuation: 'every pastry at The Flour Box is flawless.' Pillowy, consistently gooey, with warm cinnamon and strong vanilla notes. Lines form two hours before the 10am opening.",
    price_approx: "$5–6", website: "theflourboxseattle.com", mentions: ["The Infatuation"],
  },
  {
    city: "Seattle", country: "United States", name: "Nielsen's Pastries", neighborhood: "Lower Queen Anne",
    formatted_address: "520 2nd Ave W, Seattle, WA 98119",
    location_type: "bakery", roll_style: "cardamom", google_rating: 4.9, google_review_count: 276,
    notes: "Seattle's premier Danish bakery, founded 1965. The signature 'snitter' is a Danish-American invention: cinnamon roll dough rolled flat with a line of custard and almond paste. Mon–Sat 8am–2pm only. Seattle Times: 'a sweet dose of hygge.'",
    price_approx: "$3–3.75", website: "nielsenspastries.com", mentions: ["Seattle Times", "Atlas Obscura"],
  },
  {
    city: "Seattle", country: "United States", name: "Byen Bakeri", neighborhood: "North Queen Anne",
    formatted_address: "15 Nickerson St, Seattle, WA 98109",
    location_type: "bakery", roll_style: "cardamom", google_rating: 4.5, google_review_count: 363,
    notes: "Modern Nordic café with hygge atmosphere. Cinnamon buns and cardamom rolls with 'perfectly swirled layers' — softer and less sweet than American rolls, closer to the Swedish/Norwegian tradition. Also famous for Swedish princess cake.",
    price_approx: "$5", website: "byenbakeri.com", mentions: ["Seattle Times Pacific NW Magazine"],
  },
  {
    city: "Seattle", country: "United States", name: "Cinnamon Works", neighborhood: "Downtown",
    formatted_address: "1536 Pike Pl, Seattle, WA 98101",
    location_type: "bakery", roll_style: "classic", google_rating: 4.3, google_review_count: 497,
    notes: "One of the last true scratch bakeries in Seattle, founded 1983. Fluffy, gooey, heavily glazed rolls baked fresh daily in small batches. A Pike Place Market institution where the smell hits you before you see the counter. Also offers vegan and gluten-free options.",
    price_approx: "$5–6", website: "cinnamonworks.com", mentions: ["Pike Place Market"],
  },

  // ─── PORTLAND ─────────────────────────────────────────────────────────────
  {
    city: "Portland", country: "United States", name: "Ken's Artisan Bakery", neighborhood: "Northwest District",
    formatted_address: "338 NW 21st Ave, Portland, OR 97209",
    location_type: "bakery", roll_style: "classic", google_rating: 4.5, google_review_count: 1040,
    notes: "Portland's most nationally recognized artisan bakery, opened 2001 by Ken Forkish (author of Flour Water Salt Yeast). Buttery dough with cream cheese icing. Named one of the best bakeries in the country across multiple publications including Food & Wine and Sunset Magazine.",
    price_approx: "$4–6", website: "kensartisan.com", mentions: ["Food & Wine", "Sunset Magazine"],
  },
  {
    city: "Portland", country: "United States", name: "Lauretta Jean's", neighborhood: "SE Division",
    formatted_address: "3402 SE Division St, Portland, OR 97202",
    location_type: "bakery", roll_style: "classic", google_rating: 4.5, google_review_count: 797,
    notes: "Portland's beloved pie institution with a serious cinnamon roll cult following. Brown butter icing with a hint of nutmeg — 'a spiritual experience' per reviewers. Extended evening hours (until 9–10pm weekends) make this a destination for late-night pastry runs.",
    price_approx: "$5–7", website: "laurettajeans.com", mentions: ["Eater Portland", "Willamette Week"],
  },
  {
    city: "Portland", country: "United States", name: "Tabor Bread", neighborhood: "Sunnyside",
    formatted_address: "4438 SE Belmont St, Portland, OR 97215",
    location_type: "bakery", roll_style: "classic",
    notes: "Portland's first retail bakery to mill its own flour and bake in a wood-fired oven. Naturally fermented dough with real grain flavor — not just sugar and white flour. Runner-up Willamette Week Best Bakery 2022. The roll changes with what grain is milled that week.",
    price_approx: "$4–5", website: "taborbread.com", mentions: ["New York Times", "Portland Monthly"],
  },
  {
    city: "Portland", country: "United States", name: "Fressen Artisan Bakery", neighborhood: "Montavilla",
    formatted_address: "7075 NE Glisan St, Portland, OR 97213",
    location_type: "bakery", roll_style: "cardamom", google_rating: 4.5, google_review_count: 179,
    notes: "Portland's only authentic German Franzbrot: cinnamon and cardamom filling in laminated croissant-style dough, no frosting. 'Like a croissant and a cinnamon bun having a baby.' Owner grew up in a German family in Romania and uses traditional methods with locally milled grain.",
    price_approx: "$4–5", website: "fressenartisanbakery.com", mentions: ["Portland Monthly"],
  },
  {
    city: "Portland", country: "United States", name: "Sweet CoCo G", neighborhood: "Johns Landing",
    formatted_address: "6141 SW Macadam Ave, Portland, OR 97239",
    location_type: "bakery", roll_style: "laminated", google_rating: 4.9,
    notes: "4.9-star Google rating is exceptional for any Portland bakery. Heavily layered with visible spiral layers. Rolls stay soft and fresh even hours after purchase — a point reviewers specifically call out. Babka-and-roll focus means the lamination technique gets full attention.",
    price_approx: "$5–7", website: "sweetcocog.com", mentions: ["Yelp Top"],
  },
  {
    city: "Portland", country: "United States", name: "Hail Snail", neighborhood: "Arbor Lodge",
    formatted_address: "6550 N Interstate Ave, Portland, OR 97217",
    location_type: "bakery", roll_style: "vegan",
    notes: "Queer, family-owned vegan cinnamon roll shop. Build-your-own format with 25+ toppings — the GF version is 'the best gluten-free cinnamon roll I've ever had.' Signature combos include Lunchbox (peanut butter + strawberry) and The Quake (banana + pistachios + carrot bacon).",
    price_approx: "$6–9", website: "hailsnailpdx.com", mentions: ["VegNews"],
  },

  // ─── COPENHAGEN ───────────────────────────────────────────────────────────
  {
    city: "Copenhagen", country: "Denmark", name: "Sankt Peders Bageri", neighborhood: "Indre By",
    formatted_address: "Sankt Peders Stræde 29, 1453 København K",
    location_type: "bakery", roll_style: "cardamom",
    notes: "Denmark's oldest active bakery, founded 1652. The regular kanelsnegl is a sturdy bread-dough roll with crunchy sugar and strong cinnamon. The Onsdagssnegl (Wednesday Snail) is sold only on Wednesdays, twice the size, and they sell over 4,000 of them. TripAdvisor #1 Dessert in Copenhagen.",
    price_approx: "DKK 20–25 (~$3)", mentions: ["TripAdvisor #1 Desserts CPH", "Atlas Obscura"],
  },
  {
    city: "Copenhagen", country: "Denmark", name: "Juno the Bakery", neighborhood: "Østerbro",
    formatted_address: "Århusgade 48, 2100 København Ø",
    location_type: "bakery", roll_style: "cardamom", google_rating: 4.7, google_review_count: 3259,
    notes: "Opened 2017 by former Noma pastry chef Emil Glaser. The cardamom rolls are fragrant, sticky, and intensely aromatic — 100% organic, heritage grain varieties. Winner of Berlingske's Best Bakery in Copenhagen 2024. Lines form before opening; rolls go fast.",
    price_approx: "DKK 35–40 (~$5)", website: "junothebakery.com", instagram: "juno_the_bakery", mentions: ["Berlingske Best Bakery 2024"],
  },
  {
    city: "Copenhagen", country: "Denmark", name: "Hart Bageri", neighborhood: "Frederiksberg",
    formatted_address: "Gammel Kongevej 109, 1850 Frederiksberg",
    location_type: "bakery", roll_style: "cardamom", google_rating: 4.6,
    notes: "Founded by Richard Hart — former head baker at Tartine in San Francisco — at René Redzepi's suggestion. Mills own organic grains on-site. The kanelsnurre has a distinctive orange zest note that cuts the sweetness. Ranked #3 in Europe's top cheap eats by Opinionated About Dining (2023, 2024).",
    price_approx: "DKK 40–45 (~$6)", website: "hartbageri.com", instagram: "hartbageri", mentions: ["Opinionated About Dining Top 3 Europe"],
  },
  {
    city: "Copenhagen", country: "Denmark", name: "Meyers Bageri", neighborhood: "Nørrebro",
    formatted_address: "Jægersborggade 9, 2200 København N",
    location_type: "bakery", roll_style: "cardamom", google_rating: 4.7,
    notes: "From Claus Meyer, co-founder of Noma. The biggest kanelsnegl in the city — tall laminated Vienna dough with brown sugar, cinnamon, and a dark chocolate glaze for bittersweet contrast. 100% organic. Located on Jægersborggade, Copenhagen's most charming bakery street.",
    price_approx: "DKK 35–40 (~$5)", website: "meyersgroup.dk", mentions: ["Noma founder"],
  },
  {
    city: "Copenhagen", country: "Denmark", name: "Bageriet Brød", neighborhood: "Vesterbro",
    formatted_address: "Enghave Plads 7, 1670 København V",
    location_type: "bakery", roll_style: "cardamom",
    notes: "The choice for purists: no glaze, no chocolate — just the laminated dough and cinnamon doing the work. Tall-stacked rather than flat, leaving the spice and butter to carry the roll entirely. Foursquare 9.0/10, ranked #2 for pastries in Copenhagen.",
    price_approx: "DKK 25–30 (~$3.60)", instagram: "bagerietbrod", mentions: ["Foursquare #2 Pastries CPH"],
  },
  {
    city: "Copenhagen", country: "Denmark", name: "Andersen & Maillard", neighborhood: "Nørrebro",
    formatted_address: "Nørrebrogade 62, 2200 København N",
    location_type: "bakery", roll_style: "cardamom", google_rating: 4.4,
    notes: "Founded by a barista and pastry chef who both came out of Noma and Amass. The kanelsnegl gets a cream cheese glaze — a tangy, rich counterpoint almost no other Copenhagen bakery does. Set inside a former bank building with high ceilings. Coffee roasted on-site.",
    price_approx: "DKK 38 (~$5.50)", website: "andersenmaillard.dk", instagram: "andersenmaillard",
  },
  {
    city: "Copenhagen", country: "Denmark", name: "Lille Bakery", neighborhood: "Refshaleøen",
    formatted_address: "Refshalevej 213A, 1432 København K",
    location_type: "bakery", roll_style: "cardamom", google_rating: 4.4, google_review_count: 1234,
    notes: "On Refshaleøen — the industrial harbour island home to Noma and Copenhagen Street Food. Works exclusively with Danish grains and local small-scale farms. Industrial space, outdoor benches, harbor views. The Infatuation reviewed it (December 2024). Wed–Sun only.",
    price_approx: "DKK 35–45 (~$5)", mentions: ["The Infatuation"],
  },

  // ─── STOCKHOLM ────────────────────────────────────────────────────────────
  {
    city: "Stockholm", country: "Sweden", name: "Socker Sucker", neighborhood: "Vasastan",
    formatted_address: "Drottninggatan 93, 113 60 Stockholm",
    location_type: "bakery", roll_style: "cardamom", google_rating: 4.7,
    notes: "2025 winner of Thatsup's city-wide blind kanelbulle tasting. Co-founders Frida Bäcke (won World Championships gold, was head pastry chef at Michelin restaurants Aira and Frantzén) and Bedros Kabranian (World Baker of the Year). The most pedigreed kanelbulle in Stockholm.",
    price_approx: "SEK 42–48 (~$4)", website: "sockersucker.se", instagram: "sockersucker", mentions: ["Thatsup Best Kanelbulle 2025"],
  },
  {
    city: "Stockholm", country: "Sweden", name: "Skeppsbro Bageri", neighborhood: "Gamla Stan",
    formatted_address: "Tullhus 1, Skeppsbron 21, 111 30 Stockholm",
    location_type: "bakery", roll_style: "cardamom", google_rating: 4.5, google_review_count: 970,
    notes: "Two-time Thatsup Best Kanelbulle winner (2019 & 2024). Mills its own whole-grain flour on-site with stone mills, wild-fermented starters, stone-oven baking. Set on the quay in Gamla Stan directly facing the Royal Palace. Led by Sweden's only world champion baker.",
    price_approx: "SEK 40–45 (~$3.80)", website: "skeppsbrobageri.com", mentions: ["Thatsup Best Kanelbulle 2019 & 2024"],
  },
  {
    city: "Stockholm", country: "Sweden", name: "Tössebageriet", neighborhood: "Östermalm",
    formatted_address: "Karlavägen 77, 114 49 Stockholm",
    location_type: "bakery", roll_style: "cardamom", google_rating: 4.3, google_review_count: 895,
    notes: "Stockholm's most storied konditori, still at its original address since 1920. Made the wedding cakes for Prince Carl Philip's 2015 royal wedding. Scored 8.5/10 in systematic comparative tasting — the highest in that evaluation. Classic cardamom-accented kanelbulle with a crisp top layer.",
    price_approx: "SEK 38–45 (~$3.60)", mentions: ["Royal wedding cake"],
  },
  {
    city: "Stockholm", country: "Sweden", name: "Vete-Katten", neighborhood: "City Centre",
    formatted_address: "Kungsgatan 55, 111 22 Stockholm",
    location_type: "bakery", roll_style: "cardamom", google_rating: 4.3,
    notes: "Founded 1928 by Ester Nordhammar — one of few female-owned businesses in Sweden at the time. Nearly 100 years on Kungsgatan. One of Stockholm's most spectacular konditori interiors: high ceilings, chandeliers, wood panelling, labyrinthine seating. The pilgrimage konditori.",
    price_approx: "SEK 33–40 (~$3.15)", instagram: "vetekatten", mentions: ["Visit Stockholm"],
  },
  {
    city: "Stockholm", country: "Sweden", name: "Lillebrors Bageri", neighborhood: "Vasastan",
    formatted_address: "Rörstrandsgatan 10, 113 40 Stockholm",
    location_type: "bakery", roll_style: "cardamom", google_rating: 4.8, google_review_count: 2350,
    notes: "Among the highest-rated bakeries in Stockholm by review volume. Founded 2016, built an outsized reputation extremely fast. Takeaway-only — no seating. Cardamom buns often sell out before afternoon. Tripadvisor puts it in the top 5% of Stockholm restaurants outright.",
    price_approx: "SEK 37–42 (~$3.50)",
  },
  {
    city: "Stockholm", country: "Sweden", name: "Fabrique Stenugnsbageri", neighborhood: "Södermalm",
    formatted_address: "Rosenlundsgatan 28A, 118 63 Stockholm",
    location_type: "bakery", roll_style: "cardamom", google_rating: 4.4,
    notes: "Founded 2008, now 19 Stockholm locations plus London and NYC. Moist, buttery kanelbulle baked in a stone oven with no additives. The bakery that arguably introduced Stockholm's modern artisan bun culture to international audiences. The most accessible quality kanelbulle in the city.",
    price_approx: "SEK 35–40 (~$3.35)", website: "fabrique.se", mentions: ["Goldbelly ships internationally"],
  },
  {
    city: "Stockholm", country: "Sweden", name: "Rosendals Trädgård", neighborhood: "Djurgården",
    formatted_address: "Rosendalsvägen 38, 115 21 Stockholm",
    location_type: "café", roll_style: "cardamom", google_rating: 4.5,
    notes: "Nowhere else in Stockholm can you eat a cinnamon bun under an apple orchard next to a working biodynamic farm. 16-tonne wood-fired stone oven. Operates on Djurgården island, 15 minutes from the city center. The experience is as much about setting as pastry.",
    price_approx: "SEK 42–50 (~$4)", instagram: "rosendalstradgard", mentions: ["Visit Stockholm"],
  },
  {
    city: "Stockholm", country: "Sweden", name: "Sundbergs Konditori", neighborhood: "Gamla Stan",
    formatted_address: "Järntorget 83, 111 29 Stockholm",
    location_type: "bakery", roll_style: "cardamom", google_rating: 4.2,
    notes: "Founded 1785 — the oldest continuously operating pastry shop in Stockholm. The kanelbulle was popularized in the 1920s, and this shop was already 130 years old by then. On cobblestone Järntorget square with chandeliers and outdoor seating. Notably the cheapest fika in the city.",
    price_approx: "SEK 30–38 (~$2.85)",
  },

  // ─── MELBOURNE ────────────────────────────────────────────────────────────
  {
    city: "Melbourne", country: "Australia", name: "Sebby's Scrolls", neighborhood: "Caulfield South",
    formatted_address: "367 North Road, Caulfield South VIC 3162",
    location_type: "bakery", roll_style: "classic", google_rating: 4.6,
    notes: "Melbourne ground-zero for the city's cinnamon scroll obsession — they sparked the entire scroll boom when they opened in 2021. Sells up to 16,000 scrolls weekly across two locations. Super-soft pull-apart dough, cream cheese icing tart enough to cut the sweetness.",
    price_approx: "AUD $7", website: "sebbysscrolls.com", mentions: ["Broadsheet", "3AW", "Time Out"],
  },
  {
    city: "Melbourne", country: "Australia", name: "Heart Bakes", neighborhood: "Port Melbourne",
    formatted_address: "220 Bridge Street, Port Melbourne VIC 3207",
    location_type: "bakery", roll_style: "classic", google_rating: 4.8,
    notes: "Consistently cited alongside Sebby's as one of the two defining Melbourne scroll spots. Pillowy-soft with a generous cream-cheese glaze that isn't cloying. TikTok viral (millions of views). Over 80% of reviewers specifically mention the softness and balance.",
    price_approx: "AUD $6–9", instagram: "heartbakesmelbourne", mentions: ["Broadsheet", "Urban List", "Time Out"],
  },
  {
    city: "Melbourne", country: "Australia", name: "Cinnabuns", neighborhood: "Albion",
    formatted_address: "29B Perth Avenue, Albion VIC 3020",
    location_type: "bakery", roll_style: "laminated", google_rating: 4.8,
    notes: "French-trained pastry chef who spent years in Paris bakeries. Precision lamination — not the supersized American style but more refined. 700+ scrolls on a weekend from a tiny strip-mall spot. Rotating flavours: pandan custard, Biscoff-raspberry, coffee scroll. TikTok reviewers have bumped it above Sebby's.",
    price_approx: "AUD $8.45", instagram: "cinnabunsmelb", mentions: ["Broadsheet", "Urban List"],
  },
  {
    city: "Melbourne", country: "Australia", name: "Butter Days", neighborhood: "Malvern",
    formatted_address: "209 Glenferrie Road, Malvern VIC 3144",
    location_type: "bakery", roll_style: "cardamom",
    notes: "Opened by John Demetrios, winner of Dessert Masters 2024 (Australia's top pastry competition), and his wife Martina, who brings Swedish heritage. Signature Sunshine Bun is a Norwegian solboller-inspired pastry — golden, flaky, filled with lemon-cinnamon custard. Sold out within hours on opening day.",
    price_approx: "AUD $6–9", instagram: "alwaysbutterdays", mentions: ["Broadsheet", "Dessert Masters 2024 winner"],
  },
  {
    city: "Melbourne", country: "Australia", name: "Mörk Chocolate", neighborhood: "North Melbourne",
    formatted_address: "150 Errol Street, North Melbourne VIC 3051",
    location_type: "café", roll_style: "cardamom",
    notes: "Melbourne's premier drinking chocolate house. The Swedish cinnamon and cardamom buns — made with organic Ceylon cinnamon and caramelized chocolate — took 6 months to perfect. Broadsheet says the buns 'steal the show.' Paired with serious drinking chocolate.",
    price_approx: "AUD $5 (AUD $30 for 6-pack)", website: "morkchocolate.com.au", mentions: ["Broadsheet"],
  },
  {
    city: "Melbourne", country: "Australia", name: "Back Alley Bakes", neighborhood: "Coburg North",
    formatted_address: "10 Leslie Avenue, Coburg North VIC 3058",
    location_type: "bakery", roll_style: "classic", google_rating: 4.7,
    notes: "Literally behind a pink roller door in a brick industrial building. Uses only biodynamic, stone-milled Victorian wheat. Cinnamon scrolls sticky, swirled, and perfectly spiced. Seasonal standout: sticky-date scroll. Paired with Axil Coffee Roasters. Cult following among Melbourne's inner-north food community.",
    price_approx: "AUD $6–8", website: "backalleybakes.com.au", mentions: ["Broadsheet", "Urban List"],
  },
  {
    city: "Melbourne", country: "Australia", name: "Baker Bleu Melbourne", neighborhood: "Caulfield North",
    formatted_address: "119 Hawthorn Road, Caulfield North VIC 3161",
    location_type: "bakery", roll_style: "classic",
    notes: "Award-winning sourdough bakery applying its sourdough mastery to a cinnamon scroll. Described as 'tooth-achingly sweet, sticky and chewy (all in the best way)' with the tang of the sourdough base setting it apart. Sells out every weekend. Multiple national bakery award mentions.",
    price_approx: "AUD $7–9", website: "bakerbleu.com.au", mentions: ["Broadsheet", "National bakery awards"],
  },

  // ─── TORONTO ──────────────────────────────────────────────────────────────
  {
    city: "Toronto", country: "Canada", name: "Sweet Trolley Bakery", neighborhood: "The Junction",
    formatted_address: "3056 Dundas St W, Toronto, ON",
    location_type: "bakery", roll_style: "classic",
    notes: "Established 1970 — the oldest bakery in the Junction, one of the oldest continuously running cinnamon bun destinations in the city. Family-owned across generations. The buns are oversized with a 'shimmering veil of syrupy glaze.' Multiple reviewers call it the best in Toronto. Cash-only. Nut-free.",
    price_approx: "CAD $3–5", instagram: "sweettrolleybakery", mentions: ["Toronto Star", "TripAdvisor #1 cinnamon rolls"],
  },
  {
    city: "Toronto", country: "Canada", name: "Fika Cafe", neighborhood: "Kensington Market",
    formatted_address: "28 Kensington Ave, Toronto, ON",
    location_type: "café", roll_style: "cardamom",
    notes: "The only spot in the city with a genuine kanelbulle pedigree. Dough infused with cardamom throughout, topped with pearl sugar rather than frosting. Co-founded by chef Victor Barry and Nikki Leigh McKean in 2013 — one of Toronto's longest-running Scandinavian-style cafés.",
    price_approx: "CAD $4–5", website: "fika.ca", instagram: "fikakensington", mentions: ["Toronto Life"],
  },
  {
    city: "Toronto", country: "Canada", name: "Blackbird Baking Co.", neighborhood: "Kensington Market",
    formatted_address: "172 Baldwin St, Toronto, ON",
    location_type: "bakery", roll_style: "classic",
    notes: "One of Toronto's most respected serious bakeries, 37K Instagram followers. The cinnamon bun is 'really light, almost like a churro' — a distinct departure from the dense, doughy city standard. Bakes only enough to sell out daily, refusing to sell day-old product.",
    price_approx: "CAD $5–6", website: "blackbirdbakingco.com", instagram: "bbirdco", mentions: ["Toronto Life"],
  },
  {
    city: "Toronto", country: "Canada", name: "Breadhead Bakery", neighborhood: "West End",
    formatted_address: "346 Westmoreland Ave N, Toronto, ON",
    location_type: "bakery", roll_style: "classic",
    notes: "Started as a one-woman apartment operation fulfilling Instagram orders. Sourdough-hybrid dough with cinnamon, salted caramel, and 'lots and lots' of butter. Toronto Life 'Sort-of Secret' feature. Available at ~10 west-end partner cafes.",
    price_approx: "CAD $5.50", website: "breadhead.ca", instagram: "breadheadyyz", mentions: ["Toronto Life"],
  },
  {
    city: "Toronto", country: "Canada", name: "Bakerbots Baking", neighborhood: "Bloorcourt Village",
    formatted_address: "1242 Bloor St W, Toronto, ON",
    location_type: "bakery", roll_style: "classic", google_rating: 4.7,
    notes: "One of the most consistently recommended bakeries on Yelp and Google across all of Toronto. The cinnamon bun is a signature item alongside famous crackpuffs (oversized cream puffs). Serious portion sizes, incredible value. The kind of word-of-mouth that fills the case before noon.",
    price_approx: "CAD $5–6", instagram: "bakerbots_baking", mentions: ["Yelp Top Toronto"],
  },
  {
    city: "Toronto", country: "Canada", name: "Bunner's Bakeshop", neighborhood: "Kensington Market",
    formatted_address: "244 Augusta Ave, Toronto, ON",
    location_type: "bakery", roll_style: "vegan",
    notes: "Since 2010, Toronto's gold standard for allergen-friendly baking. Everything vegan, dairy-free, egg-free, gluten-free, and nut-free. The 'Mama Bun' is rolled with cinnamon sugar, baked in demerara brown sugar sauce, crowned with dairy-free buttercream. Reviewers: 'gooey, moist, and rich — converts skeptics.'",
    price_approx: "CAD $5–6", website: "bunners.ca", instagram: "bunner", mentions: ["blogTO"],
  },
  {
    city: "Toronto", country: "Canada", name: "Circles & Squares Bakery", neighborhood: "East York",
    formatted_address: "197 Bartley Drive, Toronto, ON",
    location_type: "bakery", roll_style: "classic",
    notes: "Ontario's best butter tart winner. Brown Butter Cinnamon Buns are a weekend-only item that sells out fast. The brown butter adds a nutty, caramelized depth absent from any other bun on this list. 23K Instagram followers. Worth the out-of-the-way trip.",
    price_approx: "CAD $4–6", website: "circlesandsquares.ca", instagram: "circlesandsquaresbakery", mentions: ["blogTO"],
  },

  // ─── WASHINGTON DC ────────────────────────────────────────────────────────
  {
    city: "Washington DC", country: "United States", name: "Ted's Bulletin", neighborhood: "14th Street",
    formatted_address: "1818 14th St NW, Washington, DC 20009",
    location_type: "restaurant", roll_style: "classic",
    notes: "The 'Cinnamon Roll As Big as Ya Head' — cream cheese frosting comes in a gravy boat on the side. Weekend-only, serves until sold out. Cult status is undeniable. A DC rite of passage.",
    price_approx: "$9.89", website: "tedsbulletin.com", mentions: ["TripAdvisor"],
  },
  {
    city: "Washington DC", country: "United States", name: "Lou's Buns", neighborhood: "L'Enfant Plaza",
    formatted_address: "429 L'Enfant Plaza SW, Washington, DC 20024",
    location_type: "bakery", roll_style: "classic",
    notes: "DC-native Alexandria Diggs left teaching during the pandemic to bake full-time. Bold flavor riffs: Sweet Buntato, Bunfetti, Red Velvet, Apple Pie, Blueberry Cinnamon. Customers: 'the best cinnamon bun I've ever had.' Also a Nationals Park vendor in the 2026 season.",
    price_approx: "$7–10", website: "lousbuns.com", instagram: "lousbuns_", mentions: ["WJLA", "DC.gov"],
  },
  {
    city: "Washington DC", country: "United States", name: "Seylou", neighborhood: "Shaw",
    formatted_address: "926 N St NW Suite A, Washington, DC 20001",
    location_type: "bakery", roll_style: "classic",
    notes: "Mills 100% of its flour in-house daily from organic whole grains — heirloom wheats, einkorn, spelt, emmer, rye. The cinnamon bun carries nutty complexity from the whole wheat and long fermentation that no conventional bakery can replicate. Also does cardamom buns. Every serious DC bakery roundup includes Seylou.",
    price_approx: "$5.25–6.75", website: "seylou.com", mentions: ["The Infatuation", "Washingtonian"],
  },
  {
    city: "Washington DC", country: "United States", name: "The Royal", neighborhood: "Bloomingdale",
    formatted_address: "501 Florida Ave NW, Washington, DC 20001",
    location_type: "café", roll_style: "classic", google_rating: 4.5, google_review_count: 434,
    notes: "The signature cinnamon roll is soaked in tres leches custard — a creative mashup called 'one of the best in the city.' Coffee-shop by day, bar by night. Brunch reservation recommended.",
    price_approx: "$12–18 brunch", website: "theroyaldc.com", mentions: ["Yelp Top DC"],
  },
  {
    city: "Washington DC", country: "United States", name: "Sticky Fingers Bakery", neighborhood: "Takoma",
    formatted_address: "314 Carroll St NW, Washington, DC 20010",
    location_type: "bakery", roll_style: "vegan",
    notes: "DC's defining vegan roll since 1999. Women-owned, kosher. The 'Sticky Bun' is filled with chopped walnuts or pecans and topped with vanilla cream cheese-style frosting (all plant-based). Two-time Food Network Cupcake Wars winner. Moved to a full new Takoma bakery in January 2024.",
    price_approx: "$6–8", website: "stickyfingersbakery.com", mentions: ["Food Network Cupcake Wars"],
  },
  {
    city: "Washington DC", country: "United States", name: "Pluma by Bluebird Bakery", neighborhood: "NoMa",
    formatted_address: "391 Morse St NE, Washington, DC 20002",
    location_type: "bakery", roll_style: "classic",
    notes: "2024 James Beard Awards Semifinalist for Outstanding Bakery. Feather-light croissants and a morning bun described as 'quite filling and delicious.' Blue Mediterranean tile interior, communal wooden table. The most prestigious bakery pedigree on this DC list.",
    price_approx: "$5.25–6.75", website: "plumabybluebird.com", mentions: ["James Beard Semifinalist 2024"],
  },

  // ─── MINNEAPOLIS ──────────────────────────────────────────────────────────
  {
    city: "Minneapolis", country: "United States", name: "Isles Bun & Coffee", neighborhood: "Uptown",
    formatted_address: "1424 W 28th St, Minneapolis, MN 55408",
    location_type: "bakery", roll_style: "classic", google_rating: 4.5, google_review_count: 619,
    notes: "Named 2024 World's Best Cinnamon Roll after a four-continent, multi-year search. Nearly 30 years in Uptown with zero frills. Thick, tangy cream cheese frosting served with extra in a to-go coffee cup on request. Cult side item: Puppy Dog Tails, twisted dough scraps at $2 each.",
    price_approx: "$6.25", website: "islesbun.com", mentions: ["2024 World's Best Cinnamon Roll", "Star Tribune"],
  },
  {
    city: "Minneapolis", country: "United States", name: "FIKA Café at American Swedish Institute", neighborhood: "Whittier",
    formatted_address: "2600 Park Ave, Minneapolis, MN 55407",
    location_type: "café", roll_style: "cardamom",
    notes: "Inside the American Swedish Institute — the heart of Minneapolis's Scandinavian heritage, in a stunning Gilded Age mansion. Pearl sugar-topped kanelbulle and cardamom buns (kardemummabullar) baked in-house daily. New York Times: 'more than a museum café.' The most culturally significant stop on this list.",
    price_approx: "$3–5", website: "asimn.org", mentions: ["New York Times", "Food Network"],
  },
  {
    city: "Minneapolis", country: "United States", name: "Aki's BreadHaus", neighborhood: "Northeast Minneapolis",
    formatted_address: "1712 Marshall St NE, Minneapolis, MN 55413",
    location_type: "bakery", roll_style: "cardamom", google_rating: 4.9,
    notes: "Founded by an architect-turned-baker who grew up in Mönchengladbach, Germany. Cardamom twists with a Scandi spin — enriched dough, fragrant with cardamom, twisted pull-apart form. Andrew Zimmern called the bakery's aroma 'infectious.' The new Marshall St location added a wine bar (WunderBar).",
    price_approx: "$3–6", website: "akisbreadhaus.com", mentions: ["Andrew Zimmern", "Minnesota Monthly"],
  },
  {
    city: "Minneapolis", country: "United States", name: "Brake Bread", neighborhood: "West Seventh",
    formatted_address: "1174 W 7th St, Saint Paul, MN 55102",
    location_type: "bakery", roll_style: "cardamom", google_rating: 4.8, google_review_count: 181,
    notes: "Started with a bike bread-delivery service. Cardamom Spinners made with wild-yeast starter dough over 36 hours — layered cardamom perfume unique in the Twin Cities. Multiple reviewers say they dream about these rolls. The shop has a converted-bus patio (the 'Bread Bus').",
    price_approx: "$3–4", website: "brakebread.com", mentions: ["Heavy Table"],
  },
  {
    city: "Minneapolis", country: "United States", name: "A Baker's Wife's Pastry Shop", neighborhood: "Powderhorn Park",
    formatted_address: "4200 28th Ave S, Minneapolis, MN 55406",
    location_type: "bakery", roll_style: "classic", google_rating: 4.0, google_review_count: 538,
    notes: "A Powderhorn institution for 30+ years — old-fashioned cases, paper bags, rolls the size of your face. No-frills and priced like it's still 1994. The neighborhood bakery that Minneapolis actually runs on. Open 6am–6pm daily.",
    price_approx: "$3–5", website: "abakerswifespastryshop.com",
  },
  {
    city: "Minneapolis", country: "United States", name: "The Buttered Tin", neighborhood: "Lowertown",
    formatted_address: "237 7th St E, Saint Paul, MN 55101",
    location_type: "bakery", roll_style: "classic", google_rating: 4.6,
    notes: "Run by Cupcake Wars winner Alicia Hinze. Scratch-made, generously sized cinnamon rolls with cream cheese frosting. Voted Best Dessert in Minnesota. Sells their rolls through Lunds & Byerlys grocery stores. The anchor brunch spot in Lowertown St. Paul.",
    price_approx: "$6–9", website: "thebutteredtin.com", mentions: ["Best Dessert in Minnesota"],
  },
  {
    city: "Minneapolis", country: "United States", name: "Sarah Jane's Bakery", neighborhood: "Northeast Minneapolis",
    formatted_address: "2853 Johnson St NE, Minneapolis, MN 55418",
    location_type: "bakery", roll_style: "classic",
    notes: "Established in the 1920s — genuinely old Minneapolis. A cash-register-and-glass-case bakery that feels like 1953. The fried cinnamon roll ($1.19) is the sleeper hit: soft dough, fried rather than baked, dusted with cinnamon sugar. Indeed Brewing created a Maple Stick Stout in tribute.",
    price_approx: "$1.19–2.85", website: "sarahjanesbakery.com",
  },
];

async function main() {
  console.log(`Inserting ${spots.length} spots across ${new Set(spots.map(s => s.city)).size} cities...`);

  // Insert in batches of 20
  const batchSize = 20;
  let inserted = 0;
  for (let i = 0; i < spots.length; i += batchSize) {
    const batch = spots.slice(i, i + batchSize);
    const { error } = await supabase.from("city_locations").insert(batch);
    if (error) {
      console.error(`Batch ${i / batchSize + 1} failed:`, error.message);
      process.exit(1);
    }
    inserted += batch.length;
    console.log(`  Inserted ${inserted}/${spots.length}`);
  }

  console.log("Done!");

  // Print city summary
  const counts = {};
  for (const s of spots) counts[s.city] = (counts[s.city] || 0) + 1;
  console.log("\nCity counts:");
  Object.entries(counts).sort().forEach(([city, n]) => console.log(`  ${city}: ${n}`));
}

main().catch(console.error);
