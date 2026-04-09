import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import ShareButton from "@/components/ShareButton";
import GuideSpotCard, { type GuideSpotData } from "@/components/GuideSpotCard";
import { supabase } from "@/lib/supabase";
import { locationSlug, toSlug } from "@/lib/location-slug";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "The Best Cinnamon Rolls in NYC (2026 Guide) | cinnamonrolls.nyc",
  description: "The definitive guide to NYC's best cinnamon rolls — curated picks across all five boroughs. From classic American swirls to Scandinavian cardamom rolls, here's where to find the city's best.",
  alternates: { canonical: "https://cinnamonrolls.nyc/guides/best-cinnamon-rolls-nyc" },
  openGraph: {
    title: "The Best Cinnamon Rolls in NYC (2026 Guide)",
    description: "The definitive guide to NYC's best cinnamon rolls — curated picks across all five boroughs.",
    url: "https://cinnamonrolls.nyc/guides/best-cinnamon-rolls-nyc",
    images: [{ url: "https://cinnamonrolls.nyc/icon.png", width: 512, height: 512 }],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "The Best Cinnamon Rolls in NYC (2026 Guide)",
    description: "Benji's Buns, Radio Bakery, L'Appartement 4F — the definitive NYC cinnamon roll guide.",
    images: ["https://cinnamonrolls.nyc/opengraph-image"],
  },
};

const BOROUGH_GUIDES = [
  { slug: "best-cinnamon-rolls-manhattan", borough: "Manhattan", href: "/guides/best-cinnamon-rolls-manhattan", summary: "Benji's, L'Appartement 4F, Barachou, Sunday Morning, and more." },
  { slug: "best-cinnamon-rolls-brooklyn", borough: "Brooklyn", href: "/guides/best-cinnamon-rolls-brooklyn", summary: "Radio Bakery, Welcome Home, Bakeri, and Brooklyn's craft-first roll culture." },
  { slug: "best-cinnamon-rolls-queens", borough: "Queens", href: "/guides/best-cinnamon-rolls-queens", summary: "Serano Bakery in Astoria and the borough's growing scene." },
];

// The 6 spots to feature — sorted by editorial priority, not just rating
const FEATURED_NAMES = [
  "Benji's Buns",
  "Radio Bakery",
  "L'Appartement 4F",
  "Barachou",
  "Sunday Morning",
  "Bakeri",
];

export default async function GuidePage() {
  const [{ data: locations }, countResult, { data: boroughCounts }] = await Promise.all([
    supabase
      .from("locations")
      .select("id, name, display_name, neighborhood, borough, location_type, notes, google_rating, google_place_id, formatted_address, mentions")
      .eq("visible", true)
      .in("name", FEATURED_NAMES),
    supabase.from("locations").select("*", { count: "exact", head: true }).eq("visible", true),
    supabase.from("locations").select("borough").eq("visible", true),
  ]);

  // Count per borough
  const boroughCountMap: Record<string, number> = {};
  for (const row of boroughCounts ?? []) {
    if (row.borough) boroughCountMap[row.borough] = (boroughCountMap[row.borough] ?? 0) + 1;
  }

  const totalCount = countResult.count ?? 0;

  // Sort by the editorial order defined in FEATURED_NAMES
  const spotMap = new Map((locations ?? []).map((l) => [l.name, l]));
  const featured = FEATURED_NAMES.map((n) => spotMap.get(n)).filter(Boolean) as GuideSpotData[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "The Best Cinnamon Rolls in NYC (2026 Guide)",
    "description": "The definitive guide to NYC's best cinnamon rolls — curated picks across all five boroughs.",
    "url": "https://cinnamonrolls.nyc/guides/best-cinnamon-rolls-nyc",
    "publisher": { "@type": "Organization", "name": "cinnamonrolls.nyc", "url": "https://cinnamonrolls.nyc", "logo": "https://cinnamonrolls.nyc/icon.png" },
    "mainEntity": {
      "@type": "ItemList",
      "name": "Best Cinnamon Rolls in NYC",
      "numberOfItems": featured.length,
      "itemListElement": featured.map((l, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "name": l.display_name ?? l.name,
        "url": `https://cinnamonrolls.nyc/locations/${locationSlug(l.name)}`,
      })),
    },
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--cr-cream)", fontFamily: "var(--font-inter), -apple-system, sans-serif" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header count={totalCount} backLink />
      <div style={{ paddingTop: 60 }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px 100px" }}>

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" style={{ fontSize: 12, color: "#9C6B3C", marginBottom: 24, display: "flex", gap: 6, alignItems: "center" }}>
            <Link href="/" style={{ color: "#9C6B3C", textDecoration: "none" }}>Map</Link>
            <span style={{ opacity: 0.4 }}>›</span>
            <Link href="/guides" style={{ color: "#9C6B3C", textDecoration: "none" }}>Guides</Link>
            <span style={{ opacity: 0.4 }}>›</span>
            <span>Best in NYC</span>
          </nav>

          {/* Hero */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
              <h1 style={{ fontSize: 34, fontWeight: 800, color: "var(--cr-brown-dark)", margin: 0, letterSpacing: "-0.03em", lineHeight: 1.15 }}>
                The Best Cinnamon Rolls in NYC
              </h1>
              <ShareButton
                url="https://cinnamonrolls.nyc/guides/best-cinnamon-rolls-nyc"
                title="The Best Cinnamon Rolls in NYC (2026 Guide)"
                style={{ marginTop: 6, flexShrink: 0 }}
              />
            </div>
            <div style={{ height: 2, background: "rgba(139,69,19,0.12)", borderRadius: 1 }} />
          </div>

          {/* Article */}
          <article>
            <p style={{ fontSize: 16, color: "#5a3a1a", lineHeight: 1.85, margin: "0 0 24px" }}>
              NYC has a quietly thriving cinnamon roll scene — and it's more varied than most people expect. There's the classic American swirl, glazed and gooey, found at neighborhood bakeries across all five boroughs. There's the Scandinavian cardamom roll, fragrant and less sweet. There are midnight roll shops, sell-out-by-11am cult spots, laminated-dough showpieces, and $5 sleepers that score higher than anything twice the price.
            </p>
            <p style={{ fontSize: 16, color: "#5a3a1a", lineHeight: 1.85, margin: "0 0 28px" }}>
              We've mapped {totalCount} spots across the city. Here are six worth knowing.
            </p>

            {/* 6 featured picks */}
            {featured.map((loc) => (
              <GuideSpotCard key={loc.id} loc={loc} showNeighborhood />
            ))}

            {/* Borough guides */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0 20px" }}>
              <div style={{ flex: 1, height: 1, background: "rgba(139,69,19,0.12)" }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", color: "#9C6B3C", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                Explore by borough
              </span>
              <div style={{ flex: 1, height: 1, background: "rgba(139,69,19,0.12)" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 48 }}>
              {BOROUGH_GUIDES.map((g) => {
                const count = boroughCountMap[g.borough];
                return (
                  <Link key={g.slug} href={g.href} style={{ textDecoration: "none" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 16px", background: "#fff", borderRadius: 10, border: "1px solid rgba(139,69,19,0.1)" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 3 }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--cr-brown-dark)" }}>{g.borough}</span>
                          {count && <span style={{ fontSize: 12, color: "#9C6B3C" }}>{count} spots</span>}
                        </div>
                        <div style={{ fontSize: 13, color: "#7A4010", lineHeight: 1.4 }}>{g.summary}</div>
                      </div>
                      <span style={{ fontSize: 14, color: "rgba(139,69,19,0.4)", flexShrink: 0 }}>→</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </article>

          {/* Also read — neighborhood guides */}
          <div style={{ marginBottom: 40 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", color: "#9C6B3C", textTransform: "uppercase", margin: "0 0 12px" }}>
              Neighborhood guides
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[
                { href: "/guides/best-cinnamon-rolls-west-village", label: "West Village" },
                { href: "/guides/best-cinnamon-rolls-east-village", label: "East Village" },
                { href: "/guides/best-cinnamon-rolls-greenpoint", label: "Greenpoint" },
                { href: "/guides/best-cinnamon-rolls-williamsburg", label: "Williamsburg" },
                { href: "/guides/best-cinnamon-rolls-prospect-heights", label: "Prospect Heights" },
                { href: "/guides/best-cinnamon-rolls-brooklyn-heights", label: "Brooklyn Heights" },
              ].map(({ href, label }) => (
                <Link key={href} href={href} style={{ fontSize: 13, fontWeight: 600, padding: "6px 14px", borderRadius: 20, background: "#fff", color: "var(--cr-brown)", border: "1px solid rgba(139,69,19,0.2)", textDecoration: "none" }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

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
