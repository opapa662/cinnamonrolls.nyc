import Link from "next/link";
import type { Metadata, } from "next";
import type { ReactNode } from "react";
import Header from "@/components/Header";
import ShareButton from "@/components/ShareButton";
import LocationRow, { type LocationRowData } from "@/components/LocationRow";
import GuideSpotCard, { type GuideSpotData } from "@/components/GuideSpotCard";
import { supabase } from "@/lib/supabase";
import { locationSlug, toSlug } from "@/lib/location-slug";

export const revalidate = 3600;
export const dynamicParams = false;

// ---------------------------------------------------------------------------
// Section types — editorial building blocks for each guide
// ---------------------------------------------------------------------------
type GuideSection =
  /** A prose paragraph, may contain inline links */
  | { type: "text"; content: ReactNode }
  /** A featured spot card — looked up by location name from DB */
  | { type: "spot"; name: string }
  /** A row list of remaining (non-featured) spots — cap with max */
  | { type: "more"; heading?: string; max?: number };

interface GuideConfig {
  borough?: string;
  neighborhood?: string;
  dietary?: "gluten_free" | "vegan" | "dairy_free";
  title: string;
  metaDescription: string;
  twitterDescription?: string;
  /** Maximum total spots shown (cards + rows). Default: 6 */
  maxSpots?: number;
  sections: GuideSection[];
  faqs?: Array<{ q: string; a: string }>;
}

// Shared link style for inline bakery links in editorial copy
const il: React.CSSProperties = {
  color: "var(--cr-brown-dark)",
  fontWeight: 600,
  textDecoration: "underline",
  textDecorationColor: "rgba(139,69,19,0.3)",
};

// ---------------------------------------------------------------------------
// All guides
// ---------------------------------------------------------------------------
// Short labels used in "Also read" recommendations
const GUIDE_LABELS: Record<string, string> = {
  "best-cinnamon-rolls-nyc": "Best in NYC",
  "best-cinnamon-rolls-manhattan": "Manhattan Guide",
  "best-cinnamon-rolls-brooklyn": "Brooklyn Guide",
  "best-cinnamon-rolls-queens": "Queens Guide",
  "best-cinnamon-rolls-west-village": "West Village",
  "best-cinnamon-rolls-east-village": "East Village",
  "best-cinnamon-rolls-greenpoint": "Greenpoint",
  "best-cinnamon-rolls-williamsburg": "Williamsburg",
  "best-cinnamon-rolls-prospect-heights": "Prospect Heights",
  "best-cinnamon-rolls-brooklyn-heights": "Brooklyn Heights",
};

const RELATED: Record<string, string[]> = {
  "best-cinnamon-rolls-manhattan": ["best-cinnamon-rolls-west-village", "best-cinnamon-rolls-east-village", "best-cinnamon-rolls-nyc"],
  "best-cinnamon-rolls-brooklyn": ["best-cinnamon-rolls-greenpoint", "best-cinnamon-rolls-williamsburg", "best-cinnamon-rolls-prospect-heights", "best-cinnamon-rolls-brooklyn-heights"],
  "best-cinnamon-rolls-queens": ["best-cinnamon-rolls-nyc", "best-cinnamon-rolls-manhattan"],
  "best-cinnamon-rolls-west-village": ["best-cinnamon-rolls-east-village", "best-cinnamon-rolls-manhattan", "best-cinnamon-rolls-nyc"],
  "best-cinnamon-rolls-east-village": ["best-cinnamon-rolls-west-village", "best-cinnamon-rolls-manhattan", "best-cinnamon-rolls-nyc"],
  "best-cinnamon-rolls-greenpoint": ["best-cinnamon-rolls-williamsburg", "best-cinnamon-rolls-prospect-heights", "best-cinnamon-rolls-brooklyn"],
  "best-cinnamon-rolls-williamsburg": ["best-cinnamon-rolls-greenpoint", "best-cinnamon-rolls-brooklyn-heights", "best-cinnamon-rolls-brooklyn"],
  "best-cinnamon-rolls-prospect-heights": ["best-cinnamon-rolls-brooklyn-heights", "best-cinnamon-rolls-greenpoint", "best-cinnamon-rolls-brooklyn"],
  "best-cinnamon-rolls-brooklyn-heights": ["best-cinnamon-rolls-prospect-heights", "best-cinnamon-rolls-williamsburg", "best-cinnamon-rolls-brooklyn"],
};

const GUIDES: Record<string, GuideConfig> = {
  // ── Borough guides ────────────────────────────────────────────────────────
  "best-cinnamon-rolls-brooklyn": {
    borough: "Brooklyn",
    title: "The Best Cinnamon Rolls in Brooklyn (2026 Guide)",
    metaDescription:
      "The best cinnamon rolls in Brooklyn — Radio Bakery, Welcome Home, Bakeri, and more. Mapped and curated across Greenpoint, Williamsburg, Prospect Heights, and beyond.",
    twitterDescription:
      "Radio Bakery, Welcome Home, Bakeri — Brooklyn's best cinnamon rolls, mapped and curated.",
    sections: [
      {
        type: "text",
        content: "Brooklyn has the city's most craft-oriented cinnamon roll culture. The through-line is lineage and intention: the spots that matter here tend to be built around a specific baking philosophy, not a market gap.",
      },
      { type: "spot", name: "Radio Bakery" },
      {
        type: "text",
        content: <>The story behind <Link href="/locations/welcome-home" style={il}>Welcome Home</Link> is worth knowing: founder Billy Wright was previously head baker at L'Appartement 4F in the West Village. When he opened Welcome Home in Crown Heights in December 2024, the New York Times named it Bakery of the Year before it had been open twelve months — there was a line around the block on opening day, reportedly with a broken oven.</>,
      },
      { type: "spot", name: "Welcome Home" },
      {
        type: "text",
        content: <>In Williamsburg, <Link href="/locations/bakeri" style={il}>Bakeri</Link> approaches the cinnamon roll from a Scandinavian angle: cardamom-forward, airy, and deliberately less sweet than the American style. It's a useful reminder that the roll is a global format, not a monolithic one.</>,
      },
      { type: "spot", name: "Bakeri" },
      {
        type: "text",
        content: "Winner in Carroll Gardens keeps things simple: a classic cream cheese swirl, baked daily, no gimmicks. It's the kind of roll that reminds you why the format works.",
      },
      { type: "spot", name: "Winner" },
      {
        type: "text",
        content: "Dreams of Sugar in Bed-Stuy is the borough's most community-rooted roll spot — a neighborhood bakery with a loyal following that's built its reputation entirely by word of mouth.",
      },
      { type: "spot", name: "Dreams of Sugar" },
      { type: "more", heading: "More in Brooklyn" },
    ],
    faqs: [
      {
        q: "What is the best cinnamon roll in Brooklyn?",
        a: "Radio Bakery — with locations in Greenpoint and Prospect Heights — is Brooklyn's most acclaimed spot, known for its sourdough process and glossy finish. Welcome Home in Crown Heights was named New York Times Bakery of the Year in 2025 before it had been open twelve months. Bakeri in Williamsburg is the borough's standout for Scandinavian-style cardamom rolls.",
      },
      {
        q: "What time does Radio Bakery sell out?",
        a: "Radio Bakery's cinnamon rolls typically sell out by mid-morning on weekends — often before 11am at the Greenpoint flagship. The Prospect Heights location on Washington Avenue tends to last slightly later. Both open at 8am; arrive by 9am for full selection.",
      },
      {
        q: "What neighborhoods in Brooklyn have the best cinnamon rolls?",
        a: "Greenpoint and Prospect Heights for Radio Bakery. Crown Heights for Welcome Home. Williamsburg for Bakeri's Scandinavian rolls. Carroll Gardens for Winner's classic cream cheese swirl. Bed-Stuy for Dreams of Sugar, a neighborhood favorite built entirely on word of mouth.",
      },
      {
        q: "What makes Brooklyn's cinnamon roll scene different from Manhattan's?",
        a: "Brooklyn spots tend to have a stronger baking philosophy behind them — Radio Bakery's sourdough process, Bakeri's Scandinavian tradition, Welcome Home's lineage from L'Appartement 4F. The rolls feel more rooted. Manhattan leans toward destination shops and theatrical presentation; Brooklyn rewards repeat visits.",
      },
    ],
  },
  "best-cinnamon-rolls-manhattan": {
    borough: "Manhattan",
    title: "The Best Cinnamon Rolls in Manhattan (2026 Guide)",
    metaDescription:
      "The best cinnamon rolls in Manhattan — from Benji's midnight rolls to L'Appartement 4F's laminated-dough swirl. Every spot mapped and curated.",
    twitterDescription:
      "Benji's Buns, Barachou, Sunday Morning, L'Appartement 4F — Manhattan's best cinnamon rolls, mapped and curated.",
    sections: [
      {
        type: "text",
        content: "Manhattan is where NYC's cinnamon roll scene gets theatrical. Three dedicated roll shops — Benji's Buns, Sunday Morning, and Spirals — all operate within a mile of each other in the West Village and East Village, each staking out a different interpretation of what a great roll should be.",
      },
      { type: "spot", name: "Benji's Buns" },
      {
        type: "text",
        content: <>The West Village is the most concentrated roll destination in the city. <Link href="/locations/lappartement-4f" style={il}>L'Appartement 4F</Link>'s laminated croissant-dough swirl is unlike anything else in the five boroughs. <Link href="/locations/barachou" style={il}>Barachou</Link>, a French cream puff shop, makes a $5 cinnamon roll that Carboholic scored 9.7 — one of its highest ratings ever.</>,
      },
      { type: "spot", name: "L'Appartement 4F" },
      { type: "spot", name: "Barachou" },
      {
        type: "text",
        content: "In the East Village, Sunday Morning proofs its dough three times and limits production — ten rotating flavors, out the door by 11:30am most weekends.",
      },
      { type: "spot", name: "Sunday Morning" },
      {
        type: "text",
        content: "Spirals, also in the East Village, finishes every roll with a signature shortbread crumble. It's a small detail that's become the shop's identity — nobody else in the city does it.",
      },
      { type: "spot", name: "Spirals" },
      { type: "more", heading: "More in Manhattan" },
    ],
    faqs: [
      {
        q: "What is the best cinnamon roll in Manhattan?",
        a: "The West Village has the highest concentration of acclaimed spots: Benji's Buns (open until midnight), L'Appartement 4F's laminated croissant-dough swirl, and Barachou's $5 roll — which critic site Carboholic rated 9.7 out of 10. In the East Village, Sunday Morning is worth planning a trip around: ten rotating flavors, typically sold out by 11:30am on weekends.",
      },
      {
        q: "Where can I find a late-night cinnamon roll in Manhattan?",
        a: "Benji's Buns in the West Village is open until midnight — the only dedicated cinnamon roll shop in NYC that works as a late-night option. The quality is consistent; their classic cream cheese swirl at 11pm is the same roll as at 10am.",
      },
      {
        q: "What neighborhoods in Manhattan have the most cinnamon roll shops?",
        a: "The West Village is NYC's most concentrated roll destination, with Benji's Buns, L'Appartement 4F, and Barachou all within a few blocks. The East Village runs it close — Sunday Morning, Spirals, Red Gate Bakery, and Petit Chou are all within walking distance of each other.",
      },
      {
        q: "How early do I need to arrive at Sunday Morning?",
        a: "Sunday Morning opens at 9am and typically sells out of most flavors by 11:30am on weekends. Arrive by 10am for full selection. They proof the dough three times and limit production intentionally — ten rotating flavors each day, usually gone before noon.",
      },
    ],
  },
  "best-cinnamon-rolls-queens": {
    borough: "Queens",
    title: "The Best Cinnamon Rolls in Queens (2026 Guide)",
    metaDescription:
      "The best cinnamon rolls in Queens, NYC. Serano Bakery in Astoria and every other spot worth knowing — mapped and curated.",
    twitterDescription:
      "Serano Bakery and every other cinnamon roll worth knowing in Queens — mapped on cinnamonrolls.nyc.",
    sections: [
      {
        type: "text",
        content: <>Queens is still developing its cinnamon roll scene, but what's here is worth knowing. <Link href="/locations/serano-bakery" style={il}>Serano Bakery</Link> in Astoria is the borough's anchor — a neighborhood staple that's been turning out classic rolls alongside its broader pastry menu for years, with a loyal local following that doesn't need to make the trip to Brooklyn to get their fix.</>,
      },
      { type: "spot", name: "Serano Bakery" },
      {
        type: "text",
        content: "Queens is NYC's most diverse borough — and that diversity shapes its bakery culture. The spots here tend to serve broader neighborhood communities rather than destination visitors, which means you're more likely to find a roll that's earned its place on the menu through years of repeat customers than one that was designed to photograph well.",
      },
      {
        type: "text",
        content: <>Astoria is the most developed neighborhood for pastry hunting in Queens: a dense mix of Greek, Eastern European, and Middle Eastern bakers who&apos;ve been working with enriched doughs for decades. The cinnamon roll as a format fits naturally into that tradition even when it&apos;s not the headline item. Walk along Steinway Street or Ditmars Boulevard and you&apos;ll find more than what&apos;s mapped here.</>,
      },
      {
        type: "text",
        content: "As Queens' independent food scene continues to mature, it's the borough on this map we're watching most closely. Expect new additions.",
      },
      { type: "more" },
    ],
  },

  // ── Manhattan neighborhood guides ─────────────────────────────────────────
  "best-cinnamon-rolls-west-village": {
    neighborhood: "West Village",
    borough: "Manhattan",
    title: "The Best Cinnamon Rolls in the West Village, NYC (2026 Guide)",
    metaDescription:
      "The West Village has more great cinnamon rolls per block than anywhere else in NYC. Benji's Buns, L'Appartement 4F, Barachou, and more — the full guide.",
    twitterDescription:
      "Benji's midnight rolls, L'Appartement 4F's laminated-dough swirl, Barachou's $5 cult roll — the West Village is NYC's best roll neighborhood.",
    sections: [
      {
        type: "text",
        content: "The West Village is the center of gravity for NYC's cinnamon roll scene. A cluster of independent bakeries — many with European or Scandinavian influence — means you can do a legitimate roll crawl within a few blocks.",
      },
      { type: "spot", name: "Benji's Buns" },
      {
        type: "text",
        content: <><Link href="/locations/lappartement-4f" style={il}>L'Appartement 4F</Link>'s West Village location is the closest thing to a pilgrimage site the NYC roll scene has — their laminated croissant-dough swirl is unlike anything else in the five boroughs. Come on a weekend morning; there will be a line.</>,
      },
      { type: "spot", name: "L'Appartement 4F" },
      { type: "spot", name: "Barachou" },
      {
        type: "text",
        content: "The Noortwyck, where two Eleven Madison Park alumni serve a mascarpone-glazed roll exclusively on weekend brunch, adds a fine-dining pedigree to the neighborhood's roll culture. Come on a weekend morning, go early or come late — Benji's open-until-midnight model is the rare spot that rewards both strategies.",
      },
      { type: "more" },
    ],
  },
  "best-cinnamon-rolls-east-village": {
    neighborhood: "East Village",
    borough: "Manhattan",
    title: "The Best Cinnamon Rolls in the East Village, NYC (2026 Guide)",
    metaDescription:
      "Sunday Morning, Spirals, Red Gate, and Petit Chou — the East Village has a serious cinnamon roll scene. Here's the full guide.",
    twitterDescription:
      "Sunday Morning's sell-out swirls, Spirals' shortbread-topped rolls, Red Gate's brown butter specials — the East Village cinnamon roll guide.",
    sections: [
      {
        type: "text",
        content: "The East Village has a quietly serious cinnamon roll scene. These aren't spots you'll stumble into — come with a plan, go early, and don't be surprised when something is already sold out.",
      },
      { type: "spot", name: "Sunday Morning" },
      {
        type: "text",
        content: <><Link href="/locations/spirals" style={il}>Spirals</Link>, from pastry veteran Arin Senior, finishes every roll with a signature shortbread cookie crumble that you won't find anywhere else in the city. <Link href="/locations/red-gate-bakery" style={il}>Red Gate</Link> at Baz Bagel does a brown butter roll mid-week and rotating Instagram-announced specials on Fridays and Saturdays.</>,
      },
      { type: "spot", name: "Spirals" },
      { type: "spot", name: "Red Gate Bakery" },
      { type: "more" },
    ],
  },

  // ── Brooklyn neighborhood guides ──────────────────────────────────────────
  "best-cinnamon-rolls-greenpoint": {
    neighborhood: "Greenpoint",
    borough: "Brooklyn",
    title: "The Best Cinnamon Rolls in Greenpoint, Brooklyn (2026 Guide)",
    metaDescription:
      "Greenpoint's cinnamon roll scene is anchored by Radio Bakery — one of NYC's most-discussed pastry destinations. Here's the full guide to Greenpoint's best rolls.",
    twitterDescription:
      "Radio Bakery and more — the best cinnamon rolls in Greenpoint, Brooklyn.",
    sections: [
      {
        type: "text",
        content: <>Greenpoint's cinnamon roll scene is built around one address: <Link href="/locations/radio-bakery" style={il}>Radio Bakery</Link>. Since opening its flagship here, Radio Bakery has become arguably the most talked-about pastry destination in Brooklyn — its cinnamon roll sells out by mid-morning on weekends, and the weekend lines have become a neighborhood ritual. The roll is generous, glossy, and unapologetically American-style: soft, gooey, and the kind of thing you think about for the rest of the day.</>,
      },
      { type: "spot", name: "Radio Bakery" },
      {
        type: "text",
        content: "But Greenpoint rewards exploration beyond the obvious. The neighborhood's Polish bakery heritage gives it a pastry culture that runs deeper than any single shop. Go early, walk slowly, and see what else you find.",
      },
      { type: "more" },
    ],
  },
  "best-cinnamon-rolls-williamsburg": {
    neighborhood: "Williamsburg",
    borough: "Brooklyn",
    title: "The Best Cinnamon Rolls in Williamsburg, Brooklyn (2026 Guide)",
    metaDescription:
      "Williamsburg's bakery scene ranges from Bakeri's Scandinavian cardamom rolls to rotating weekend specials. Here's where to find the best cinnamon rolls in Williamsburg.",
    twitterDescription:
      "Bakeri's Norwegian cardamom rolls and more — the best cinnamon rolls in Williamsburg, Brooklyn.",
    sections: [
      {
        type: "text",
        content: <>Williamsburg's approach to the cinnamon roll mirrors its approach to most things: a mix of transplanted traditions and local reinvention. <Link href="/locations/bakeri" style={il}>Bakeri</Link>, the Norwegian-owned café on Havemeyer Street, has been serving one of Brooklyn's best cinnamon rolls for years — cardamom-forward, airy, and noticeably less sweet than the American style.</>,
      },
      { type: "spot", name: "Bakeri" },
      {
        type: "text",
        content: "Beyond Bakeri, Williamsburg has a strong supporting cast of cafés and bakeries with rotating seasonal rolls. Weekend mornings are worth planning around, especially in the stretch between Bedford and Driggs.",
      },
      {
        type: "text",
        content: "The neighborhood's food culture has always been early-adopter — if a new roll style is going to surface in Brooklyn first, it's probably here. Worth checking back: Williamsburg has a habit of producing the next thing before the rest of the city catches on.",
      },
      { type: "more" },
    ],
  },
  "best-cinnamon-rolls-prospect-heights": {
    neighborhood: "Prospect Heights",
    borough: "Brooklyn",
    title: "The Best Cinnamon Rolls in Prospect Heights, Brooklyn (2026 Guide)",
    metaDescription:
      "Prospect Heights is home to Radio Bakery's second location and some of Brooklyn's best weekend baking. Here's the full guide.",
    twitterDescription:
      "Radio Bakery's second location and more — the best cinnamon rolls in Prospect Heights, Brooklyn.",
    sections: [
      {
        type: "text",
        content: <>Prospect Heights has become one of Brooklyn's most reliable destinations for quality baked goods, anchored by <Link href="/locations/radio-bakery" style={il}>Radio Bakery</Link>'s second location on Washington Avenue. If Greenpoint is too far, this is where to go — the same cult-status cinnamon roll in a slightly calmer weekend morning setting.</>,
      },
      { type: "spot", name: "Radio Bakery" },
      {
        type: "text",
        content: "Washington Avenue is the main drag: several strong bakeries and coffee shops are within a few blocks of each other, making Prospect Heights a natural destination for a half-morning food walk.",
      },
      {
        type: "text",
        content: "Go before 11am on weekends — Radio Bakery's cinnamon rolls sell out, and the neighborhood is genuinely pleasant in the early morning before the brunch crowds arrive. The proximity to Prospect Park means you can extend the morning into a walk without needing a plan.",
      },
      { type: "more" },
    ],
  },
  "best-cinnamon-rolls-brooklyn-heights": {
    neighborhood: "Brooklyn Heights",
    borough: "Brooklyn",
    title: "The Best Cinnamon Rolls in Brooklyn Heights (2026 Guide)",
    metaDescription:
      "Brooklyn Heights blends old-school neighborhood bakeries with newer spots raising the bar. Here's the full cinnamon roll guide.",
    twitterDescription:
      "The best cinnamon rolls in Brooklyn Heights — neighborhood institutions and newer standouts.",
    sections: [
      {
        type: "text",
        content: <>Brooklyn Heights has a pastry culture that reflects the neighborhood itself: rooted, quality-conscious, and not particularly interested in hype. <Link href="/locations/lappartement-4f" style={il}>L'Appartement 4F</Link>'s Brooklyn Heights outpost brings the same laminated-dough excellence that made the West Village original famous. The spots here earn their regulars through consistency rather than novelty.</>,
      },
      { type: "spot", name: "L'Appartement 4F" },
      {
        type: "text",
        content: "The area's residential calm and proximity to the Brooklyn Heights Promenade makes it one of the most pleasant neighborhoods in the city for a slow-morning pastry run. Combine it with a walk along the Promenade and you have a near-perfect weekend morning in Brooklyn.",
      },
      {
        type: "text",
        content: "Brooklyn Heights rewards the kind of unhurried visit that most NYC neighborhoods don't actually allow. The streets are quiet, the bakeries are good, and you're a five-minute walk from one of the best views in the city. Don't rush it.",
      },
      { type: "more" },
    ],
  },
  // ── Dietary guides ────────────────────────────────────────────────────────
  "best-gluten-free-cinnamon-rolls-nyc": {
    dietary: "gluten_free" as const,
    title: "The Best Gluten-Free Cinnamon Rolls in NYC (2026 Guide)",
    metaDescription: "Finding a great gluten-free cinnamon roll in NYC is harder than it sounds. Here are the spots that actually get it right — no sad substitutes.",
    twitterDescription: "Bub's, Welcome Home, Breads Bakery, Baked — the best gluten-free cinnamon rolls in NYC.",
    sections: [
      {
        type: "text",
        content: "Gluten-free baking at the level of a great cinnamon roll is genuinely hard. The texture, the chew, the way the dough holds the filling — most attempts fall short. These spots have figured it out.",
      },
      {
        type: "text",
        content: "Bub's in NoHo is the standard-bearer. Founded by James Beard-nominated baker Melissa Weller, it's NYC's first bakery built to eliminate all top-9 allergens — and the cinnamon roll is their flagship. Gluten-free, dairy-free, vegan, and genuinely excellent.",
      },
      { type: "spot", name: "Bub's" },
      {
        type: "text",
        content: "Welcome Home in Crown Heights offers a dedicated gluten-free roll from the New York Times' Bakery of the Year — not an afterthought, a real option.",
      },
      { type: "spot", name: "Welcome Home" },
      {
        type: "text",
        content: "Breads Bakery, with locations in Union Square and the Upper West Side, is one of NYC's most acclaimed bakeries. Their gluten-free options reflect the same attention to craft that runs through everything else on the counter.",
      },
      { type: "spot", name: "Breads Bakery" },
      {
        type: "text",
        content: "Baked in Red Hook has been a Brooklyn institution for years. Their gluten-free cinnamon roll is consistent, available most days, and worth the trip to Red Hook on its own.",
      },
      { type: "spot", name: "Baked" },
      { type: "more", heading: "All gluten-free spots" },
    ],
  },
  "best-vegan-cinnamon-rolls-nyc": {
    dietary: "vegan" as const,
    title: "The Best Vegan Cinnamon Rolls in NYC (2026 Guide)",
    metaDescription: "NYC's best vegan cinnamon rolls — fully plant-based, no compromises on flavor. The short list of spots worth knowing.",
    twitterDescription: "Bub's, Petee's — the best vegan cinnamon rolls in NYC.",
    sections: [
      {
        type: "text",
        content: "Vegan cinnamon rolls in NYC are rarer than you'd expect in a city this size. The format — enriched dough, butter, cream cheese frosting — is inherently dairy-heavy, which makes a great vegan version genuinely impressive when it shows up.",
      },
      {
        type: "text",
        content: "Bub's in NoHo is the city's most serious answer to this problem. James Beard-nominated baker Melissa Weller built an entire bakery around eliminating the top-9 allergens — dairy, eggs, and gluten included. The cinnamon roll is their best-seller, and it earned that status on flavor alone.",
      },
      { type: "spot", name: "Bub's" },
      {
        type: "text",
        content: "Petee's Pie Co. in the Lower East Side is the city's most reliable destination for fully vegan baked goods that don't taste like compromises. Their cinnamon roll earns its place next to the non-vegan options on any honest ranking.",
      },
      { type: "spot", name: "Petee's Pie Co." },
      { type: "more", heading: "All vegan spots" },
    ],
  },
};

type Location = GuideSpotData & LocationRowData;

export async function generateStaticParams() {
  return Object.keys(GUIDES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = GUIDES[slug];
  if (!guide) return {};
  const twitterDesc = guide.twitterDescription ?? guide.metaDescription;
  return {
    title: `${guide.title} | cinnamonrolls.nyc`,
    description: guide.metaDescription,
    alternates: { canonical: `https://cinnamonrolls.nyc/guides/${slug}` },
    openGraph: {
      title: guide.title,
      description: guide.metaDescription,
      url: `https://cinnamonrolls.nyc/guides/${slug}`,
      images: [{ url: "https://cinnamonrolls.nyc/icon.png", width: 512, height: 512 }],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: guide.title,
      description: twitterDesc,
      images: ["https://cinnamonrolls.nyc/opengraph-image"],
    },
  };
}


export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = GUIDES[slug];
  if (!guide) return null;

  let query = supabase
    .from("locations")
    .select("id, name, display_name, neighborhood, borough, location_type, notes, google_rating, google_place_id, formatted_address, mentions, photo_url, roll_style, frosting_types, gluten_free, dairy_free, vegan, price_approx")
    .eq("visible", true);

  if (guide.neighborhood) {
    query = query.eq("neighborhood", guide.neighborhood);
  } else if (guide.borough) {
    query = query.eq("borough", guide.borough);
  } else if (guide.dietary) {
    query = query.eq(guide.dietary, true);
  }

  const [{ data: locations }, countResult] = await Promise.all([
    query.order("name"),
    supabase.from("locations").select("*", { count: "exact", head: true }).eq("visible", true),
  ]);

  const spots = locations ?? [];
  const totalCount = countResult.count ?? 0;

  // Track which spot names get featured as cards — remaining go in "more"
  const featuredNames = new Set(
    guide.sections.filter((s): s is { type: "spot"; name: string } => s.type === "spot").map((s) => s.name)
  );
  const moreSpots = spots.filter((l) => !featuredNames.has(l.name));

  const areaName = guide.neighborhood ?? guide.borough ?? (guide.dietary === "gluten_free" ? "NYC (gluten-free)" : guide.dietary === "vegan" ? "NYC (vegan)" : guide.dietary === "dairy_free" ? "NYC (dairy-free)" : "NYC");
  const boroughSlug = guide.borough ? toSlug(guide.borough) : null;

  // Breadcrumbs
  type BreadcrumbItem = { name: string; href?: string };
  const breadcrumbs: BreadcrumbItem[] = [
    { name: "Map", href: "/" },
    { name: "NYC Guide", href: "/guides/best-cinnamon-rolls-nyc" },
  ];
  if (guide.neighborhood && guide.borough) {
    breadcrumbs.push({ name: guide.borough, href: `/guides/best-cinnamon-rolls-${toSlug(guide.borough)}` });
    breadcrumbs.push({ name: guide.neighborhood });
  } else if (guide.borough) {
    breadcrumbs.push({ name: guide.borough });
  } else if (guide.dietary) {
    const label = guide.dietary === "gluten_free" ? "Gluten-Free" : guide.dietary === "vegan" ? "Vegan" : "Dairy-Free";
    breadcrumbs.push({ name: label });
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "headline": guide.title,
        "description": guide.metaDescription,
        "url": `https://cinnamonrolls.nyc/guides/${slug}`,
        "datePublished": "2025-03-01T00:00:00Z",
        "dateModified": "2026-04-08T00:00:00Z",
        "image": "https://cinnamonrolls.nyc/icon.png",
        "author": { "@type": "Organization", "name": "cinnamonrolls.nyc", "url": "https://cinnamonrolls.nyc" },
        "publisher": {
          "@type": "Organization",
          "name": "cinnamonrolls.nyc",
          "url": "https://cinnamonrolls.nyc",
          "logo": "https://cinnamonrolls.nyc/icon.png",
        },
        "mainEntity": {
          "@type": "ItemList",
          "name": guide.title,
          "numberOfItems": spots.length,
          "itemListElement": spots.map((l, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "name": l.display_name ?? l.name,
            "url": `https://cinnamonrolls.nyc/locations/${locationSlug(l.name)}`,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "name": crumb.name,
          ...(crumb.href ? { "item": `https://cinnamonrolls.nyc${crumb.href}` } : {}),
        })),
      },
      ...(guide.faqs ? [{
        "@type": "FAQPage",
        "mainEntity": guide.faqs.map(({ q, a }) => ({
          "@type": "Question",
          "name": q,
          "acceptedAnswer": { "@type": "Answer", "text": a },
        })),
      }] : []),
    ],
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--cr-cream)", fontFamily: "var(--font-inter), -apple-system, sans-serif" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header count={totalCount} backLink />
      <div style={{ paddingTop: 60 }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px 100px" }}>

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" style={{ fontSize: 12, color: "#9C6B3C", marginBottom: 24, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            {breadcrumbs.map((crumb, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {i > 0 && <span style={{ opacity: 0.4 }}>›</span>}
                {crumb.href ? (
                  <Link href={crumb.href} style={{ color: "#9C6B3C", textDecoration: "none" }}>{crumb.name}</Link>
                ) : (
                  <span>{crumb.name}</span>
                )}
              </span>
            ))}
          </nav>

          {/* Hero */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
              <h1 style={{ fontSize: 34, fontWeight: 800, color: "var(--cr-brown-dark)", margin: 0, letterSpacing: "-0.03em", lineHeight: 1.15 }}>
                {guide.title.replace(/ \(2026 Guide\)$/, "")}
              </h1>
              <ShareButton
                url={`https://cinnamonrolls.nyc/guides/${slug}`}
                title={guide.title}
                style={{ marginTop: 6, flexShrink: 0 }}
              />
            </div>
            <div style={{ height: 2, background: "rgba(139,69,19,0.12)", borderRadius: 1 }} />
            <div style={{ fontSize: 12, color: "rgba(139,69,19,0.45)", marginTop: 8 }}>Updated April 2026</div>
          </div>

          {/* Article body — sections interleave text, spot picks, and row lists */}
          <article>
            {guide.sections.map((section, i) => {
              if (section.type === "text") {
                return (
                  <p key={i} style={{ fontSize: 16, color: "#5a3a1a", lineHeight: 1.85, margin: "0 0 24px" }}>
                    {section.content}
                  </p>
                );
              }

              if (section.type === "spot") {
                const loc = spots.find((l) => l.name === section.name);
                if (!loc) return null;
                return (
                  <GuideSpotCard
                    key={i}
                    loc={loc}
                    showNeighborhood={!guide.neighborhood}
                  />
                );
              }

              if (section.type === "more" && moreSpots.length > 0) {
                const heading = section.heading ?? (featuredNames.size > 0 ? `Also in ${areaName}` : `All spots in ${areaName}`);
                const shown = section.max ? moreSpots.slice(0, section.max) : moreSpots;
                if (shown.length === 0) return null;
                return (
                  <section key={i} style={{ marginTop: 8, marginBottom: 32 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                      <div style={{ flex: 1, height: 1, background: "rgba(139,69,19,0.12)" }} />
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", color: "#9C6B3C", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                        {heading}
                      </span>
                      <div style={{ flex: 1, height: 1, background: "rgba(139,69,19,0.12)" }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {shown.map((loc) => (
                        <LocationRow key={loc.id} loc={loc} showNeighborhood={!guide.neighborhood} />
                      ))}
                    </div>
                  </section>
                );
              }

              return null;
            })}
          </article>

          {/* FAQ */}
          {guide.faqs && guide.faqs.length > 0 && (
            <section style={{ marginBottom: 40 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "0 0 16px" }}>
                <div style={{ flex: 1, height: 1, background: "rgba(139,69,19,0.12)" }} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", color: "#9C6B3C", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                  Common questions
                </span>
                <div style={{ flex: 1, height: 1, background: "rgba(139,69,19,0.12)" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {guide.faqs.map(({ q, a }) => (
                  <details key={q} style={{ background: "#fff", borderRadius: 10, border: "1px solid rgba(139,69,19,0.1)", padding: "14px 18px" }}>
                    <summary style={{ fontSize: 14, fontWeight: 700, color: "var(--cr-brown-dark)", cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                      {q}
                      <span style={{ fontSize: 18, color: "rgba(139,69,19,0.35)", flexShrink: 0 }}>+</span>
                    </summary>
                    <p style={{ fontSize: 14, color: "#5a3a1a", lineHeight: 1.7, margin: "12px 0 0" }}>{a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* Also read */}
          {RELATED[slug] && (
            <div style={{ marginBottom: 40 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", color: "#9C6B3C", textTransform: "uppercase", margin: "0 0 12px" }}>
                Also read
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {RELATED[slug].map((relSlug) => {
                  const label = GUIDE_LABELS[relSlug];
                  if (!label) return null;
                  const href = relSlug === "best-cinnamon-rolls-nyc"
                    ? "/guides/best-cinnamon-rolls-nyc"
                    : `/guides/${relSlug}`;
                  return (
                    <Link key={relSlug} href={href} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#fff", borderRadius: 8, border: "1px solid rgba(139,69,19,0.1)", textDecoration: "none" }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--cr-brown-dark)" }}>{label}</span>
                      <span style={{ fontSize: 13, color: "rgba(139,69,19,0.4)" }}>→</span>
                    </Link>
                  );
                })}
                {boroughSlug && (
                  <Link href={`/boroughs/${boroughSlug}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#fff", borderRadius: 8, border: "1px solid rgba(139,69,19,0.1)", textDecoration: "none" }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--cr-brown-dark)" }}>All {guide.borough ?? guide.neighborhood} spots</span>
                    <span style={{ fontSize: 13, color: "rgba(139,69,19,0.4)" }}>→</span>
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* CTA */}
          <div style={{ background: "var(--cr-brown)", borderRadius: 12, padding: "24px", textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
              Explore all {totalCount} spots on the map
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,248,240,0.8)", marginBottom: 16, lineHeight: 1.6 }}>
              Filter by neighborhood, type, rating, and more.
            </div>
            <Link href="/" style={{ display: "inline-block", padding: "10px 24px", background: "#fff", color: "var(--cr-brown)", borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
              Open the map →
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
