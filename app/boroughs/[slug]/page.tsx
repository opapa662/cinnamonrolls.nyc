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

type Location = LocationRowData & { borough: string | null };

// ---------------------------------------------------------------------------
// Unique intro copy per borough — the biggest SEO lever on these pages
// ---------------------------------------------------------------------------
const BOROUGH_COPY: Record<string, string> = {
  manhattan: `Manhattan is the undisputed center of NYC's cinnamon roll scene. From the Scandinavian-style cardamom rolls tucked into West Village bakeries to the frosted American classics in Midtown, the variety here is unmatched. You'll find everything from grab-and-go morning staples in NoMad to weekend-only specials that sell out before noon in the East Village. With more spots per square mile than anywhere else in the city, there's always a swirl within walking distance.`,
  brooklyn: `Brooklyn punches above its weight when it comes to cinnamon rolls. The borough's independent bakery culture — from the Scandinavian-influenced spots in Greenpoint to the community-rooted bakeries of Bed-Stuy — means you're more likely to find something handmade and unexpected here than anywhere else. Williamsburg, Brooklyn Heights, and Prospect Heights each have their own distinct roll culture worth exploring on foot.`,
  queens: `Queens is still an underrated destination for cinnamon rolls, but the spots that are here are worth the trip. Expect the borough's characteristic diversity to show up in unexpected flavor combinations and bakery styles you won't find in Manhattan or Brooklyn.`,
  bronx: `The Bronx has a small but growing cinnamon roll presence. As the borough's independent food scene continues to expand, it's becoming an increasingly interesting destination for bakers and roll hunters alike.`,
  "staten-island": `Staten Island's cinnamon roll scene is quieter than the other boroughs, but the spots that exist here tend to be neighborhood institutions with loyal followings.`,
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
    .filter((l) => l.borough)
    .map((l) => ({ slug: toSlug(l.borough!) }))
    .filter(({ slug }) => {
      if (seen.has(slug)) return false;
      seen.add(slug);
      return true;
    });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const locations = await getAllLocations();
  const spots = locations.filter((l) => l.borough && toSlug(l.borough) === slug);
  if (!spots.length) return {};
  const borough = spots[0].borough!;
  const count = spots.length;
  const description = `Discover ${count} cinnamon roll spot${count !== 1 ? "s" : ""} in ${borough}, NYC. Bakeries, cafés, and hidden gems — all mapped by cinnamonrolls.nyc.`;
  return {
    title: `Best Cinnamon Rolls in ${borough}, NYC | cinnamonrolls.nyc`,
    description,
    alternates: { canonical: `https://cinnamonrolls.nyc/boroughs/${slug}` },
    openGraph: {
      title: `Best Cinnamon Rolls in ${borough}, NYC | cinnamonrolls.nyc`,
      description: `${count} cinnamon roll spot${count !== 1 ? "s" : ""} in ${borough} mapped and ready to explore.`,
      url: `https://cinnamonrolls.nyc/boroughs/${slug}`,
      images: [{ url: "https://cinnamonrolls.nyc/icon.png", width: 512, height: 512 }],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: `Best Cinnamon Rolls in ${borough}, NYC | cinnamonrolls.nyc`,
      description: `${count} spot${count !== 1 ? "s" : ""} mapped in ${borough}. Bakeries, cafés, and hidden gems.`,
      images: ["https://cinnamonrolls.nyc/opengraph-image"],
    },
  };
}

export default async function BoroughPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [locations, countResult] = await Promise.all([
    getAllLocations(),
    supabase.from("locations").select("*", { count: "exact", head: true }).eq("visible", true),
  ]);

  const spots = locations.filter((l) => l.borough && toSlug(l.borough) === slug);
  if (!spots.length) notFound();

  const borough = spots[0].borough!;
  const totalCount = countResult.count ?? 0;
  const introCopy = BOROUGH_COPY[slug] ?? `${borough} has ${spots.length} cinnamon roll spot${spots.length !== 1 ? "s" : ""} on the map. Browse every option below or explore by neighborhood.`;

  // Unique neighborhoods within this borough for internal linking
  const neighborhoods = [...new Set(spots.map((l) => l.neighborhood).filter(Boolean) as string[])].sort();

  // All boroughs for cross-borough navigation
  const allBoroughs = [...new Set(locations.map((l) => l.borough).filter(Boolean) as string[])].sort();

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Cinnamon Roll Spots in ${borough}, NYC`,
    "description": `${spots.length} cinnamon roll spot${spots.length !== 1 ? "s" : ""} in ${borough}, NYC — bakeries, cafés, and more.`,
    "numberOfItems": spots.length,
    "itemListElement": spots.map((loc, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": loc.display_name ?? loc.name,
      "url": `https://cinnamonrolls.nyc/locations/${locationSlug(loc.name)}`,
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Map", "item": "https://cinnamonrolls.nyc" },
      { "@type": "ListItem", "position": 2, "name": borough, "item": `https://cinnamonrolls.nyc/boroughs/${slug}` },
    ],
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--cr-cream)", fontFamily: "var(--font-inter), -apple-system, sans-serif" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Header count={totalCount} backLink />
      <div style={{ paddingTop: 60 }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px 100px" }}>

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" style={{ fontSize: 12, color: "#9C6B3C", marginBottom: 20, display: "flex", gap: 6, alignItems: "center" }}>
            <Link href="/" style={{ color: "#9C6B3C", textDecoration: "none" }}>Map</Link>
            <span style={{ opacity: 0.4 }}>›</span>
            <span>{borough}</span>
          </nav>

          {/* Hero */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--cr-brown-dark)", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              Best Cinnamon Rolls in {borough}, NYC
            </h1>
            <ShareButton
              url={`https://cinnamonrolls.nyc/boroughs/${slug}`}
              title={`Best Cinnamon Rolls in ${borough}, NYC — cinnamonrolls.nyc`}
              style={{ marginTop: 6, flexShrink: 0 }}
            />
          </div>

          {/* Intro copy */}
          <p style={{ fontSize: 15, color: "#5a3a1a", lineHeight: 1.7, margin: "0 0 24px" }}>
            {introCopy}
          </p>

          {/* Count header — h2 for correct heading hierarchy */}
          <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "#9C6B3C", margin: "0 0 12px", paddingBottom: 10, borderBottom: "2px solid rgba(139,69,19,0.1)" }}>
            {spots.length} SPOT{spots.length !== 1 ? "S" : ""} IN {borough.toUpperCase()}
          </h2>

          {/* Spots list */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {spots.map((loc) => (
              <LocationRow key={loc.id} loc={loc} showNeighborhood />
            ))}
          </div>

          {/* Cross-links to utility pages */}
          <div style={{ marginTop: 40, marginBottom: 40, padding: "18px 20px", background: "rgba(139,69,19,0.05)", borderRadius: 10 }}>
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

          {/* Neighborhood links */}
          {neighborhoods.length > 0 && (
            <div style={{ marginBottom: 40 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--cr-brown-dark)", margin: "0 0 12px" }}>
                Explore cinnamon rolls in {borough} neighborhoods:
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {neighborhoods.map((n) => (
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
          {allBoroughs.length > 1 && (
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
