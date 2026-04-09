import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Cinnamon Roll Guides for NYC | cinnamonrolls.nyc",
  description:
    "In-depth guides to the best cinnamon rolls in NYC — by borough and by neighborhood. Manhattan, Brooklyn, Queens, West Village, East Village, Greenpoint, Williamsburg, and more.",
  alternates: { canonical: "https://cinnamonrolls.nyc/guides" },
  openGraph: {
    title: "Cinnamon Roll Guides for NYC | cinnamonrolls.nyc",
    description:
      "In-depth guides to the best cinnamon rolls in NYC — by borough and by neighborhood.",
    url: "https://cinnamonrolls.nyc/guides",
    images: [{ url: "https://cinnamonrolls.nyc/icon.png", width: 512, height: 512 }],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "Cinnamon Roll Guides for NYC",
    description: "Borough and neighborhood guides to NYC's best cinnamon rolls — cinnamonrolls.nyc",
    images: ["https://cinnamonrolls.nyc/opengraph-image"],
  },
};

const BOROUGH_GUIDES = [
  {
    slug: "best-cinnamon-rolls-nyc",
    href: "/guides/best-cinnamon-rolls-nyc",
    title: "Best Cinnamon Rolls in NYC",
    description:
      "The definitive guide to NYC's cinnamon roll scene — all five boroughs, featured picks, and everything mapped.",
  },
  {
    slug: "best-cinnamon-rolls-manhattan",
    href: "/guides/best-cinnamon-rolls-manhattan",
    title: "Best Cinnamon Rolls in Manhattan",
    description:
      "Benji's Buns, The Noortwyck, Barachou, Sunday Morning, and every other worthwhile roll in Manhattan.",
  },
  {
    slug: "best-cinnamon-rolls-brooklyn",
    href: "/guides/best-cinnamon-rolls-brooklyn",
    title: "Best Cinnamon Rolls in Brooklyn",
    description:
      "Radio Bakery, Welcome Home, Bakeri, and the rest of Brooklyn's craft-driven cinnamon roll scene.",
  },
  {
    slug: "best-cinnamon-rolls-queens",
    href: "/guides/best-cinnamon-rolls-queens",
    title: "Best Cinnamon Rolls in Queens",
    description:
      "Serano Bakery in Astoria and every other cinnamon roll worth knowing in Queens.",
  },
];

const NEIGHBORHOOD_GUIDES = [
  {
    slug: "best-cinnamon-rolls-west-village",
    href: "/guides/best-cinnamon-rolls-west-village",
    title: "West Village",
    borough: "Manhattan",
    description:
      "NYC's most concentrated roll destination — Benji's midnight rolls, L'Appartement 4F's laminated dough, Barachou, and more.",
  },
  {
    slug: "best-cinnamon-rolls-east-village",
    href: "/guides/best-cinnamon-rolls-east-village",
    title: "East Village",
    borough: "Manhattan",
    description:
      "Sunday Morning's sell-out swirls, Spirals' shortbread-topped rolls, Red Gate's brown butter specials, and Petit Chou.",
  },
  {
    slug: "best-cinnamon-rolls-greenpoint",
    href: "/guides/best-cinnamon-rolls-greenpoint",
    title: "Greenpoint",
    borough: "Brooklyn",
    description:
      "Radio Bakery's flagship and Brooklyn's Polish bakery tradition — the best rolls in Greenpoint.",
  },
  {
    slug: "best-cinnamon-rolls-williamsburg",
    href: "/guides/best-cinnamon-rolls-williamsburg",
    title: "Williamsburg",
    borough: "Brooklyn",
    description:
      "Bakeri's Norwegian cardamom rolls and Williamsburg's eclectic weekend bakery scene.",
  },
  {
    slug: "best-cinnamon-rolls-prospect-heights",
    href: "/guides/best-cinnamon-rolls-prospect-heights",
    title: "Prospect Heights",
    borough: "Brooklyn",
    description:
      "Radio Bakery's second location and Prospect Heights' serious craft bakery culture.",
  },
  {
    slug: "best-cinnamon-rolls-brooklyn-heights",
    href: "/guides/best-cinnamon-rolls-brooklyn-heights",
    title: "Brooklyn Heights",
    borough: "Brooklyn",
    description:
      "Neighborhood institutions and quality-first spots — the best cinnamon rolls in Brooklyn Heights.",
  },
];

export default async function GuidesIndexPage() {
  const { count } = await supabase
    .from("locations")
    .select("*", { count: "exact", head: true })
    .eq("visible", true);

  const totalCount = count ?? 0;

  return (
    <div style={{ minHeight: "100vh", background: "var(--cr-cream)", fontFamily: "var(--font-inter), -apple-system, sans-serif" }}>
      <Header count={totalCount} backLink />
      <div style={{ paddingTop: 60 }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px 100px" }}>

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" style={{ fontSize: 12, color: "#9C6B3C", marginBottom: 20, display: "flex", gap: 6, alignItems: "center" }}>
            <Link href="/" style={{ color: "#9C6B3C", textDecoration: "none" }}>Map</Link>
            <span style={{ opacity: 0.4 }}>›</span>
            <span>Guides</span>
          </nav>

          {/* Hero */}
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--cr-brown-dark)", margin: "0 0 16px", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            NYC Cinnamon Roll Guides
          </h1>
          <p style={{ fontSize: 15, color: "#7A4010", lineHeight: 1.75, margin: "0 0 48px" }}>
            In-depth guides to the best cinnamon rolls in New York City — by borough and by neighborhood.
            Every spot is mapped and linked, so you can go from reading to rolling in one click.
          </p>

          {/* Borough guides */}
          <section style={{ marginBottom: 52 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", color: "#9C6B3C", margin: "0 0 16px", textTransform: "uppercase" }}>
              By Borough
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {BOROUGH_GUIDES.map((guide) => (
                <Link key={guide.slug} href={guide.href} style={{ textDecoration: "none" }}>
                  <div style={{ background: "#fff", borderRadius: 10, border: "1px solid rgba(139,69,19,0.12)", padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--cr-brown-dark)", marginBottom: 4 }}>
                        {guide.title}
                      </div>
                      <div style={{ fontSize: 13, color: "#7A4010", lineHeight: 1.5 }}>
                        {guide.description}
                      </div>
                    </div>
                    <span style={{ fontSize: 16, color: "rgba(139,69,19,0.4)", flexShrink: 0 }}>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Neighborhood guides */}
          <section style={{ marginBottom: 52 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", color: "#9C6B3C", margin: "0 0 16px", textTransform: "uppercase" }}>
              By Neighborhood
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {NEIGHBORHOOD_GUIDES.map((guide) => (
                <Link key={guide.slug} href={guide.href} style={{ textDecoration: "none" }}>
                  <div style={{ background: "#fff", borderRadius: 10, border: "1px solid rgba(139,69,19,0.12)", padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: "var(--cr-brown-dark)" }}>
                          {guide.title}
                        </span>
                        <span style={{ fontSize: 12, color: "#9C6B3C" }}>
                          {guide.borough}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: "#7A4010", lineHeight: 1.5 }}>
                        {guide.description}
                      </div>
                    </div>
                    <span style={{ fontSize: 16, color: "rgba(139,69,19,0.4)", flexShrink: 0 }}>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* CTA */}
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
