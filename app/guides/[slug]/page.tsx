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
  title: string;
  metaDescription: string;
  twitterDescription?: string;
  /** Maximum total spots shown (cards + rows). Default: 6 */
  maxSpots?: number;
  sections: GuideSection[];
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
      { type: "more" },
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

  const areaName = guide.neighborhood ?? guide.borough ?? "NYC";
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
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "headline": guide.title,
        "description": guide.metaDescription,
        "url": `https://cinnamonrolls.nyc/guides/${slug}`,
        "datePublished": "2025-03-01",
        "dateModified": "2026-04-08",
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
