import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";
import { toSlug, locationSlug } from "@/lib/location-slug";
import ShareButton from "@/components/ShareButton";
import LocationRow, { type LocationRowData } from "@/components/LocationRow";

export const revalidate = 3600;
export const dynamicParams = false;

type Location = LocationRowData;

// ---------------------------------------------------------------------------
// Hand-written intro copy for top neighborhoods — falls back to generated text
// ---------------------------------------------------------------------------
const NEIGHBORHOOD_COPY: Record<string, string> = {
  "west-village": `The West Village has quietly become one of the best neighborhoods in NYC for cinnamon rolls. A cluster of independent bakeries — many with Scandinavian or European influences — means you can do a legitimate roll crawl within a few blocks. Expect flaky cardamom swirls, classic frosted spirals, and weekend specials that sell out fast.`,
  "east-village": `The East Village brings the same energy to cinnamon rolls that it brings to everything else: eclectic, unexpected, and worth seeking out. From no-frills counter spots to cult-favorite bakeries with lines out the door on weekends, this is one of the most rewarding neighborhoods to explore on a roll-hunting mission.`,
  williamsburg: `Williamsburg's bakery scene punches well above its weight. The neighborhood's mix of longtime local spots and newer cafés means you'll find everything from classic American frosted rolls to more experimental takes. Weekend mornings here are worth planning around.`,
  greenpoint: `Greenpoint has developed a strong cinnamon roll culture, in part thanks to its Polish bakery heritage and a wave of independent spots that have opened in recent years. The neighborhood rewards slow mornings — pick a direction and see what you find.`,
  "prospect-heights": `Prospect Heights has emerged as one of Brooklyn's top neighborhoods for quality baked goods. The cinnamon roll spots here tend to be serious about their craft, drawing regulars who come specifically for the pastry counter.`,
  "brooklyn-heights": `Brooklyn Heights combines old-school neighborhood bakeries with newer spots that have raised the bar on what a cinnamon roll can be. The area's residential calm makes it a great destination for a slower weekend morning.`,
  "south-slope": `South Slope has a tight cluster of independent bakeries that have turned it into a reliable destination for cinnamon roll seekers in Brooklyn. It's less hyped than Park Slope proper, which means shorter lines and more room to linger.`,
  "bed-stuy": `Bed-Stuy's cinnamon roll scene is community-rooted and unpretentious. The spots here tend to be neighborhood institutions — places that have earned their regulars through consistency rather than hype.`,
  "upper-west-side": `The Upper West Side has a reliable set of spots for a classic NYC cinnamon roll experience. Think familiar comfort, good coffee, and the kind of baked goods that have been feeding the neighborhood for years.`,
  "lower-east-side": `The Lower East Side brings a creative edge to its cinnamon roll offerings. Expect the neighborhood's characteristic mix of cultures to show up in unexpected flavors and formats.`,
  "union-square": `Union Square is a natural gathering point, and its cinnamon roll spots benefit from that foot traffic — you'll find solid options that are convenient, consistent, and worth stopping for on the way through.`,
  nomad: `NoMad has become one of Manhattan's more interesting food neighborhoods, and its cinnamon roll spots reflect that. Expect polished, well-executed pastry from bakeries that take their craft seriously.`,
  midtown: `Midtown's cinnamon roll options skew toward grab-and-go convenience, but there are genuine finds if you know where to look. Good for a quick fix between meetings or after arriving at Penn Station.`,
  noho: `NoHo's small but curated bakery scene means the cinnamon roll spots here tend to be worth the trip. Quality over quantity is the rule in this neighborhood.`,
  tribeca: `Tribeca's food scene is understated but high-quality, and that applies to its cinnamon rolls. The spots here tend to be the kind of place locals return to every weekend.`,
  "park-slope": `Park Slope has long been one of Brooklyn's best neighborhoods for independent bakeries, and its cinnamon roll scene lives up to that reputation. Relaxed, family-friendly, and reliably delicious.`,
  soho: `SoHo has a handful of standout cinnamon roll spots tucked between the retail flagships. Easier to find on a weekday morning when the neighborhood belongs to locals rather than shoppers.`,
  astoria: `Astoria is Queens' most reliable destination for cinnamon rolls. The neighborhood's diverse food scene means you might find something unexpected alongside the more classic options.`,
};

async function getAllLocations(): Promise<Location[]> {
  const { data } = await supabase
    .from("locations")
    .select("id, name, display_name, neighborhood, borough, location_type, google_rating, google_place_id, formatted_address, mentions")
    .eq("visible", true)
    .order("name");
  return data ?? [];
}

export async function generateStaticParams() {
  const locations = await getAllLocations();
  const seen = new Set<string>();
  return locations
    .filter((l) => l.neighborhood)
    .map((l) => ({ slug: toSlug(l.neighborhood!) }))
    .filter(({ slug }) => {
      if (seen.has(slug)) return false;
      seen.add(slug);
      return true;
    });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const locations = await getAllLocations();
  const spots = locations.filter((l) => l.neighborhood && toSlug(l.neighborhood) === slug);
  if (!spots.length) return {};
  const neighborhood = spots[0].neighborhood!;
  const borough = spots[0].borough;
  const count = spots.length;
  const locationStr = borough ? `${neighborhood}, ${borough}` : neighborhood;
  const description = `Looking for cinnamon rolls in ${locationStr}? cinnamonrolls.nyc has mapped ${count} spot${count !== 1 ? "s" : ""} in ${neighborhood} — browse every option and find your perfect swirl.`;
  return {
    title: `Best Cinnamon Rolls in ${neighborhood}${borough ? `, ${borough}` : ""} | cinnamonrolls.nyc`,
    description,
    alternates: { canonical: `https://cinnamonrolls.nyc/neighborhoods/${slug}` },
    openGraph: {
      title: `Best Cinnamon Rolls in ${neighborhood}${borough ? `, ${borough}` : ""} | cinnamonrolls.nyc`,
      description: `${count} cinnamon roll spot${count !== 1 ? "s" : ""} in ${locationStr}, mapped and ready to explore.`,
      url: `https://cinnamonrolls.nyc/neighborhoods/${slug}`,
      images: [{ url: "https://cinnamonrolls.nyc/icon.png", width: 512, height: 512 }],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: `Best Cinnamon Rolls in ${neighborhood}${borough ? `, ${borough}` : ""} | cinnamonrolls.nyc`,
      description: `${count} spot${count !== 1 ? "s" : ""} in ${locationStr}. Find your perfect swirl on cinnamonrolls.nyc.`,
      images: ["https://cinnamonrolls.nyc/opengraph-image"],
    },
  };
}

export default async function NeighborhoodPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [locations, countResult] = await Promise.all([
    getAllLocations(),
    supabase.from("locations").select("*", { count: "exact", head: true }).eq("visible", true),
  ]);

  const spots = locations.filter((l) => l.neighborhood && toSlug(l.neighborhood) === slug);
  if (!spots.length) notFound();

  const neighborhood = spots[0].neighborhood!;
  const borough = spots[0].borough ?? null;
  const totalCount = countResult.count ?? 0;
  const introCopy = NEIGHBORHOOD_COPY[slug]
    ?? `${neighborhood}${borough ? `, ${borough}` : ""} has ${spots.length} cinnamon roll spot${spots.length !== 1 ? "s" : ""} on the map. Browse every option below, or explore nearby neighborhoods${borough ? ` in ${borough}` : " across NYC"}.`;

  // Other neighborhoods in the same borough for internal linking
  const siblingNeighborhoods = borough
    ? [...new Set(
        locations
          .filter((l) => l.borough === borough && l.neighborhood && l.neighborhood !== neighborhood)
          .map((l) => l.neighborhood!)
      )].sort()
    : [];

  // All boroughs for cross-borough navigation
  const allBoroughs = [...new Set(locations.map((l) => l.borough).filter(Boolean) as string[])].sort();

  const breadcrumbItems: { "@type": string; position: number; name: string; item: string }[] = [
    { "@type": "ListItem", position: 1, name: "Map", item: "https://cinnamonrolls.nyc" },
  ];
  if (borough) breadcrumbItems.push({ "@type": "ListItem", position: 2, name: borough, item: `https://cinnamonrolls.nyc/boroughs/${toSlug(borough)}` });
  breadcrumbItems.push({ "@type": "ListItem", position: breadcrumbItems.length + 1, name: neighborhood, item: `https://cinnamonrolls.nyc/neighborhoods/${slug}` });

  const breadcrumbJsonLd = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: breadcrumbItems };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Cinnamon Roll Spots in ${neighborhood}${borough ? `, ${borough}` : ""}`,
    "description": `${spots.length} cinnamon roll spot${spots.length !== 1 ? "s" : ""} in ${neighborhood}${borough ? `, ${borough}` : ""} — mapped and ready to explore.`,
    "numberOfItems": spots.length,
    "itemListElement": spots.map((loc, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": loc.display_name ?? loc.name,
      "url": `https://cinnamonrolls.nyc/locations/${locationSlug(loc.name)}`,
    })),
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--cr-cream)", fontFamily: "var(--font-inter), -apple-system, sans-serif" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Header count={totalCount} backLink />
      <div style={{ paddingTop: 60 }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px 100px" }}>

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" style={{ fontSize: 12, color: "#9C6B3C", marginBottom: 20, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <Link href="/" style={{ color: "#9C6B3C", textDecoration: "none" }}>Map</Link>
            <span style={{ opacity: 0.4 }}>›</span>
            {borough && (
              <>
                <Link href={`/boroughs/${toSlug(borough)}`} style={{ color: "#9C6B3C", textDecoration: "none" }}>{borough}</Link>
                <span style={{ opacity: 0.4 }}>›</span>
              </>
            )}
            <span>{neighborhood}</span>
          </nav>

          {/* Hero */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--cr-brown-dark)", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              Best Cinnamon Rolls in {neighborhood}{borough ? `, ${borough}` : ""}
            </h1>
            <ShareButton
              url={`https://cinnamonrolls.nyc/neighborhoods/${slug}`}
              title={`Best Cinnamon Rolls in ${neighborhood}${borough ? `, ${borough}` : ""} — cinnamonrolls.nyc`}
              style={{ marginTop: 6, flexShrink: 0 }}
            />
          </div>

          {/* Intro copy */}
          <p style={{ fontSize: 15, color: "#5a3a1a", lineHeight: 1.7, margin: "0 0 24px" }}>
            {introCopy}
          </p>

          {/* Count header — h2 for correct heading hierarchy */}
          <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "#9C6B3C", margin: "0 0 12px", paddingBottom: 10, borderBottom: "2px solid rgba(139,69,19,0.1)" }}>
            {spots.length} SPOT{spots.length !== 1 ? "S" : ""} IN {neighborhood.toUpperCase()}
          </h2>

          {/* Spots list */}
          <div style={{ display: "flex", flexDirection: "column", marginBottom: 48 }}>
            {spots.map((loc) => (
              <LocationRow key={loc.id} loc={loc} showNeighborhood={false} />
            ))}
          </div>

          {/* Cross-links to utility pages */}
          <div style={{ marginBottom: 40, padding: "18px 20px", background: "rgba(139,69,19,0.05)", borderRadius: 10 }}>
            <p style={{ fontSize: 14, color: "var(--cr-brown)", margin: "0 0 8px", lineHeight: 1.6 }}>
              Looking for something open right now?{" "}
              <Link href="/today" style={{ color: "var(--cr-brown-dark)", fontWeight: 600, textDecoration: "none" }}>
                See what&apos;s available today →
              </Link>
            </p>
            <p style={{ fontSize: 14, color: "var(--cr-brown)", margin: "0 0 8px", lineHeight: 1.6 }}>
              Into pop-ups and limited runs?{" "}
              <Link href="/pop-ups" style={{ color: "var(--cr-brown-dark)", fontWeight: 600, textDecoration: "none" }}>
                Browse NYC cinnamon roll pop-ups →
              </Link>
            </p>
            <p style={{ fontSize: 14, color: "var(--cr-brown)", margin: 0, lineHeight: 1.6 }}>
              Want the full guide?{" "}
              <Link href="/guides/best-cinnamon-rolls-nyc" style={{ color: "var(--cr-brown-dark)", fontWeight: 600, textDecoration: "none" }}>
                Read our best cinnamon rolls in NYC →
              </Link>
            </p>
          </div>

          {/* More neighborhoods in this borough */}
          {siblingNeighborhoods.length > 0 && borough && (
            <div style={{ marginBottom: 40 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--cr-brown-dark)", margin: "0 0 12px" }}>
                Explore cinnamon rolls in {borough} neighborhoods:
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {siblingNeighborhoods.map((n) => (
                  <Link
                    key={n}
                    href={`/neighborhoods/${toSlug(n)}`}
                    style={{ fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 20, background: "#fff", color: "var(--cr-brown)", border: "1px solid rgba(139,69,19,0.2)", textDecoration: "none" }}
                  >
                    {n}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Cross-borough navigation */}
          {allBoroughs.length > 0 && (
            <div style={{ marginBottom: 40 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--cr-brown-dark)", margin: "0 0 12px" }}>
                Explore cinnamon rolls by borough:
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {allBoroughs.map((b) => (
                  <Link
                    key={b}
                    href={`/boroughs/${toSlug(b)}`}
                    style={{ fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 20, background: b === borough ? "var(--cr-brown)" : "#fff", color: b === borough ? "#fff" : "var(--cr-brown)", border: `1px solid ${b === borough ? "var(--cr-brown)" : "rgba(139,69,19,0.2)"}`, textDecoration: "none" }}
                  >
                    {b}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Footer CTA */}
          <div style={{ background: "var(--cr-brown)", borderRadius: 12, padding: "24px", textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
              Explore all {totalCount} spots on the map
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,248,240,0.8)", marginBottom: 16, lineHeight: 1.6 }}>
              Filter by neighborhood, type, rating, and more.
            </div>
            <Link
              href="/"
              style={{ display: "inline-block", padding: "10px 24px", background: "#fff", color: "var(--cr-brown)", borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: "none" }}
            >
              Open the map →
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
