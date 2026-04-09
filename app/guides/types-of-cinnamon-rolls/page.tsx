import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import GuideSpotCard, { type GuideSpotData } from "@/components/GuideSpotCard";
import { supabase } from "@/lib/supabase";
import { locationSlug } from "@/lib/location-slug";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Types of Cinnamon Rolls — A Guide | cinnamonrolls.nyc",
  description: "Classic American, Scandinavian, sourdough, laminated — a guide to the main styles of cinnamon rolls and where to find each one in NYC.",
  alternates: { canonical: "https://cinnamonrolls.nyc/guides/types-of-cinnamon-rolls" },
  openGraph: {
    title: "Types of Cinnamon Rolls — A Guide",
    description: "Classic American, Scandinavian, sourdough, laminated — and where to find each style in NYC.",
    url: "https://cinnamonrolls.nyc/guides/types-of-cinnamon-rolls",
    images: [{ url: "https://cinnamonrolls.nyc/icon.png", width: 512, height: 512 }],
  },
};

interface RollStyleConfig {
  style: string;
  emoji: string;
  headline: string;
  description: string;
  dough: string;
  frosting: string;
  texture: string;
  spotNames: string[];
}

const ROLL_STYLES: RollStyleConfig[] = [
  {
    style: "Classic American",
    emoji: "🍥",
    headline: "Big, gooey, unapologetically sweet",
    description:
      "The American cinnamon roll is a study in excess — and that's the point. A thick enriched dough (often brioche-adjacent) is slathered with butter, cinnamon sugar, and brown sugar, then rolled, sliced into thick rounds, and baked until the center is pull-apart soft and the edges are lightly caramelized. The defining move: a generous pour of frosting while the rolls are still warm, so it melts into every groove.",
    dough: "Enriched yeasted dough — eggs, butter, milk, sugar. Soft and pillowy with a tender crumb.",
    frosting: "Cream cheese frosting is the classic. Some bakeries use a simple vanilla or brown butter glaze instead.",
    texture: "Soft, pillowy, and gooey. The center should pull apart in layers.",
    spotNames: [
      "Sunday Morning",
      "Welcome Home",
      "Benji's Buns",
      "Spirals",
      "Ceremonia Bakeshop",
      "Ciao Gloria",
      "Dreams of Sugar",
    ],
  },
  {
    style: "Scandinavian",
    emoji: "🌀",
    headline: "Cardamom-forward, less sweet, built for coffee",
    description:
      "The Swedish kanelbulle (and its Danish cousin) predates the American cinnamon roll by generations. Where the American version maximizes sweetness, the Scandinavian version maximizes spice — cardamom in both the dough and the filling is non-negotiable. The shape is often a twisted knot rather than a flat spiral, the dough is less enriched, and the whole thing is lighter and less sticky. A dusting of pearl sugar replaces frosting. Best eaten with a very strong black coffee.",
    dough: "Slightly enriched yeasted dough with cardamom. Less butter and sugar than American versions.",
    frosting: "Pearl sugar (no frosting). Some bakeries add a light egg wash glaze.",
    texture: "Denser and chewier than Classic American. More bread-like, less cake-like.",
    spotNames: ["Ole & Steen", "Bakeri"],
  },
  {
    style: "Sourdough",
    emoji: "🍞",
    headline: "Naturally leavened, complex, and tangy",
    description:
      "Sourdough cinnamon rolls use a live starter instead of commercial yeast, which adds a subtle tang that balances the sweetness of the filling. The fermentation process also makes the dough more digestible and develops a deeper, more complex flavor. The result is a roll with more character — not just sweet, but savory-adjacent. Proof times are longer (often overnight), which is why sourdough rolls are usually a weekend-only or limited-quantity item.",
    dough: "Naturally leavened with sourdough starter. Often cold-fermented overnight for flavor development.",
    frosting: "Brown butter glaze is a natural match — the nuttiness complements the tang. Cream cheese also works.",
    texture: "More structured crumb than Classic American. Slight chew with a thin crust on the exterior.",
    spotNames: ["Radio Bakery", "Apt. 2 Bread"],
  },
  {
    style: "Laminated",
    emoji: "🥐",
    headline: "Flaky layers, croissant dough, a French accent",
    description:
      "Laminated cinnamon rolls use croissant or puff pastry dough — butter is folded repeatedly into the dough to create hundreds of distinct layers. The filling of cinnamon sugar caramelizes between those layers as it bakes, producing a roll that shatters slightly on the outside and melts inside. These are technically demanding (lamination takes hours) and usually more expensive. Think of them as the croissant-roll hybrid that wins every Instagram argument.",
    dough: "Laminated dough — butter folded in dozens of times to create visible flaky layers.",
    frosting: "Light vanilla glaze or left plain. The pastry itself is the star — heavy frosting would overwhelm it.",
    texture: "Flaky and shatteringly crisp on the outside, soft and layered inside.",
    spotNames: ["Barachou", "L'Appartement 4F"],
  },
  {
    style: "Japanese Milk Bread",
    emoji: "🍡",
    headline: "Pillowy soft, milk-sweet, impossibly tender",
    description:
      "Japanese milk bread rolls use the tangzhong technique — a portion of flour is cooked with liquid into a paste before being added to the dough. This pre-gelatinizes the starches, allowing the dough to absorb more moisture and producing an exceptionally soft, feathery crumb that stays fresh longer than any other style. The flavor is milky-sweet and gentle, with the cinnamon filling providing contrast. Less common in NYC than the classic styles but worth seeking out.",
    dough: "Tangzhong (water roux) method. Enriched with milk, butter, and eggs. Extremely soft crumb.",
    frosting: "Often a light vanilla glaze or cream cheese. The dough's natural sweetness means less frosting is needed.",
    texture: "Cloud-like. The softest of any style — almost fluffy in a way that feels architectural.",
    spotNames: [],
  },
];

interface SpotRow extends GuideSpotData {
  roll_style: string | null;
  frosting_type: string | null;
  gluten_free: boolean;
  dairy_free: boolean;
  vegan: boolean;
}

const typesJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "headline": "Types of Cinnamon Rolls — A Guide",
      "description": "Classic American, Scandinavian, sourdough, laminated — a guide to the main styles of cinnamon rolls and where to find each one in NYC.",
      "url": "https://cinnamonrolls.nyc/guides/types-of-cinnamon-rolls",
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
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Map", "item": "https://cinnamonrolls.nyc" },
        { "@type": "ListItem", "position": 2, "name": "NYC Guide", "item": "https://cinnamonrolls.nyc/guides/best-cinnamon-rolls-nyc" },
        { "@type": "ListItem", "position": 3, "name": "Types of Cinnamon Rolls" },
      ],
    },
  ],
};

export default async function TypesGuidePage() {
  const [{ data: locations }, countResult] = await Promise.all([
    supabase
      .from("locations")
      .select(
        "id, name, display_name, neighborhood, borough, location_type, notes, google_rating, google_place_id, formatted_address, mentions, roll_style, frosting_type, gluten_free, dairy_free, vegan, price_approx"
      )
      .eq("visible", true),
    supabase.from("locations").select("*", { count: "exact", head: true }).eq("visible", true),
  ]);

  const count = countResult.count ?? 0;
  const spots: SpotRow[] = (locations ?? []) as SpotRow[];

  // Index spots by name for quick lookup
  const byName = new Map<string, SpotRow>();
  for (const s of spots) byName.set(s.name, s);

  // Also index by display_name, and partial match
  function findSpot(name: string): SpotRow | null {
    if (byName.has(name)) return byName.get(name)!;
    // Try partial match (for multi-location brands like "Radio Bakery")
    const match = spots.find((s) => s.name.startsWith(name) || s.name === name);
    return match ?? null;
  }

  // Deduplicate by base name (show one card per brand in the guide)
  function getUniqueSpots(names: string[]): SpotRow[] {
    const seen = new Set<string>();
    const result: SpotRow[] = [];
    for (const name of names) {
      const s = findSpot(name);
      if (s && !seen.has(s.name.split(" — ")[0].split(" - ")[0])) {
        seen.add(s.name.split(" — ")[0].split(" - ")[0]);
        result.push(s);
      }
    }
    return result;
  }

  // Dietary counts
  const gfCount = spots.filter((s) => s.gluten_free).length;
  const dfCount = spots.filter((s) => s.dairy_free).length;
  const veganCount = spots.filter((s) => s.vegan).length;

  const styleCounts = ROLL_STYLES.map((rs) => ({
    style: rs.style,
    count: spots.filter((s) => s.roll_style === rs.style).length,
  }));

  return (
    <div style={{ minHeight: "100vh", background: "var(--cr-cream)", fontFamily: "var(--font-inter), -apple-system, sans-serif" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(typesJsonLd) }} />
      <Header count={count} backLink />

      <div style={{ paddingTop: "60px", paddingBottom: "80px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>

          {/* Breadcrumb */}
          <nav style={{ fontSize: 12, color: "#9C6B3C", paddingTop: 32, marginBottom: 24, display: "flex", gap: 6, alignItems: "center" }}>
            <Link href="/" style={{ color: "#9C6B3C", textDecoration: "none" }}>Map</Link>
            <span style={{ opacity: 0.4 }}>›</span>
            <Link href="/guides/best-cinnamon-rolls-nyc" style={{ color: "#9C6B3C", textDecoration: "none" }}>Guides</Link>
            <span style={{ opacity: 0.4 }}>›</span>
            <span>Types of Cinnamon Rolls</span>
          </nav>

          {/* Hero */}
          <div style={{ marginBottom: 40, borderBottom: "1px solid rgba(139,69,19,0.12)", paddingBottom: 32 }}>
            <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--cr-brown-mid)", marginBottom: 10 }}>
              The guide
            </div>
            <h1 style={{ fontSize: 40, fontWeight: 800, color: "var(--cr-brown-dark)", letterSpacing: "-0.03em", lineHeight: 1.1, margin: "0 0 14px" }}>
              Types of Cinnamon Rolls
            </h1>
            <p style={{ fontSize: 17, color: "#7A4010", lineHeight: 1.7, margin: "0 0 8px", maxWidth: 580 }}>
              Not all cinnamon rolls are created equal. From the big gooey American classic to the cardamom-spiced Scandinavian kanelbulle, each style has a distinct philosophy — different dough, different technique, different occasion.
            </p>
            <div style={{ fontSize: 12, color: "rgba(139,69,19,0.45)", marginBottom: 16 }}>Updated April 2026</div>
            {/* Style chips */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {ROLL_STYLES.map((rs) => {
                const c = styleCounts.find((x) => x.style === rs.style);
                return (
                  <a
                    key={rs.style}
                    href={`#${rs.style.toLowerCase().replace(/\s+/g, "-")}`}
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      padding: "5px 14px",
                      borderRadius: 20,
                      background: "#fff",
                      color: "var(--cr-brown)",
                      border: "1px solid rgba(139,69,19,0.2)",
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {rs.style}
                    {c && c.count > 0 && (
                      <span style={{ marginLeft: 6, opacity: 0.55, fontWeight: 400 }}>· {c.count}</span>
                    )}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Roll style sections */}
          {ROLL_STYLES.map((rs) => {
            const sectionSpots = getUniqueSpots(rs.spotNames);
            const anchor = rs.style.toLowerCase().replace(/\s+/g, "-");
            return (
              <section key={rs.style} id={anchor} style={{ marginBottom: 52, scrollMarginTop: 80 }}>
                {/* Section header */}
                <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid rgba(139,69,19,0.1)" }}>
                  <h2 style={{ fontSize: 28, fontWeight: 800, color: "var(--cr-brown-dark)", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
                    {rs.style}
                  </h2>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "var(--cr-brown-mid)", margin: 0, fontStyle: "italic" }}>
                    {rs.headline}
                  </p>
                </div>

                {/* Description */}
                <p style={{ fontSize: 16, color: "#4a2e10", lineHeight: 1.8, margin: "0 0 20px" }}>
                  {rs.description}
                </p>

                {/* Spec grid */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 12,
                  marginBottom: 28,
                  padding: "16px 18px",
                  background: "#fff8f0",
                  borderRadius: 10,
                  border: "1px solid rgba(139,69,19,0.1)",
                }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9C6B3C", marginBottom: 4 }}>Dough</div>
                    <div style={{ fontSize: 13, color: "#4a2e10", lineHeight: 1.5 }}>{rs.dough}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9C6B3C", marginBottom: 4 }}>Frosting</div>
                    <div style={{ fontSize: 13, color: "#4a2e10", lineHeight: 1.5 }}>{rs.frosting}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9C6B3C", marginBottom: 4 }}>Texture</div>
                    <div style={{ fontSize: 13, color: "#4a2e10", lineHeight: 1.5 }}>{rs.texture}</div>
                  </div>
                </div>

                {/* Spots */}
                {sectionSpots.length > 0 ? (
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--cr-brown-dark)", margin: "0 0 12px", letterSpacing: "-0.01em" }}>
                      Where to find {rs.style.toLowerCase()} rolls in NYC
                    </h3>
                    {sectionSpots.map((s) => (
                      <GuideSpotCard key={s.id} loc={s} />
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 14, color: "rgba(139,69,19,0.5)", fontStyle: "italic", padding: "12px 0" }}>
                    We haven&apos;t mapped a NYC spot for this style yet — if you know one, <Link href="/submit" style={{ color: "var(--cr-brown)", textDecoration: "none", fontWeight: 600 }}>suggest it</Link>.
                  </div>
                )}
              </section>
            );
          })}

          {/* Dietary section */}
          <section style={{ marginBottom: 52 }}>
            <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid rgba(139,69,19,0.1)" }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: "var(--cr-brown-dark)", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
                Dietary options
              </h2>
              <p style={{ fontSize: 15, color: "var(--cr-brown-mid)", margin: 0, fontStyle: "italic" }}>
                Gluten-free, dairy-free, and vegan options across the city
              </p>
            </div>
            <p style={{ fontSize: 16, color: "#4a2e10", lineHeight: 1.8, margin: "0 0 24px" }}>
              A growing number of NYC bakeries offer alternative options — not as an afterthought, but as a genuine part of their menu. Availability varies by day so always call ahead or check Instagram before making the trip.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[
                {
                  label: "Gluten-Free",
                  flag: "gluten_free" as const,
                  count: gfCount,
                  note: "Dedicated GF rolls or separate GF baking protocols. Cross-contamination risk varies — ask your bakery.",
                },
                {
                  label: "Dairy-Free",
                  flag: "dairy_free" as const,
                  count: dfCount,
                  note: "Butter and cream cheese substituted with plant-based alternatives. Flavor profile is very close to the original.",
                },
                {
                  label: "Vegan",
                  flag: "vegan" as const,
                  count: veganCount,
                  note: "No animal products — no eggs, butter, milk, or cream cheese. Requires both dairy-free and egg-free substitutions.",
                },
              ].map(({ label, flag, count: dc, note }) => {
                const dietSpots = spots.filter((s) => s[flag]);
                return (
                  <div key={label} style={{ background: "#fff", borderRadius: 10, border: "1px solid rgba(139,69,19,0.12)", padding: "18px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--cr-brown-dark)" }}>{label}</div>
                      <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 9px", borderRadius: 20, background: dc > 0 ? "#f0fdf4" : "rgba(139,69,19,0.06)", color: dc > 0 ? "#15803d" : "var(--cr-brown-mid)" }}>
                        {dc > 0 ? `${dc} spot${dc !== 1 ? "s" : ""}` : "None mapped yet"}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: "#7A4010", lineHeight: 1.6, margin: "0 0 12px" }}>{note}</p>
                    {dietSpots.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {dietSpots.map((s) => (
                          <Link
                            key={s.id}
                            href={`/locations/${locationSlug(s.name)}`}
                            style={{ fontSize: 13, fontWeight: 600, color: "var(--cr-brown)", textDecoration: "none", padding: "4px 12px", borderRadius: 20, background: "#fff8ed", border: "1px solid rgba(139,69,19,0.18)" }}
                          >
                            {s.display_name ?? s.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Frosting guide */}
          <section style={{ marginBottom: 52 }}>
            <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid rgba(139,69,19,0.1)" }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: "var(--cr-brown-dark)", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
                Frosting & topping styles
              </h2>
              <p style={{ fontSize: 15, color: "var(--cr-brown-mid)", margin: 0, fontStyle: "italic" }}>
                The finishing layer makes or breaks the roll
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                {
                  type: "Cream Cheese",
                  desc: "Tangy, thick, and rich. The classic pairing for Classic American rolls — the acid in the cream cheese cuts through the sweetness of the filling. Poured warm so it melts into the spiral.",
                },
                {
                  type: "Brown Butter",
                  desc: "Nutty and caramel-adjacent. Made by cooking butter until the milk solids toast. A natural match for sourdough rolls where the nuttiness complements the tang of the dough.",
                },
                {
                  type: "Vanilla Glaze",
                  desc: "The lighter option — powdered sugar, cream, and vanilla. Less rich than cream cheese, lets the dough and filling speak more. Common on brioche-style and laminated rolls.",
                },
                {
                  type: "Caramel Glaze",
                  desc: "Richer and more complex than vanilla glaze. The caramelization adds depth. Often used when the baker wants sweetness without the tang of cream cheese.",
                },
                {
                  type: "Pearl Sugar",
                  desc: "Not a frosting at all — large sugar crystals that stay crunchy during baking. The Scandinavian signature. Adds sweetness and texture without any moisture, which keeps the roll lighter.",
                },
                {
                  type: "Naked",
                  desc: "No frosting, no glaze, nothing. The roll stands entirely on its filling and dough. Rare in NYC — requires exceptional dough quality and restraint from both baker and eater.",
                },
              ].map(({ type, desc }) => (
                <div key={type} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: "1px solid rgba(139,69,19,0.07)" }}>
                  <div style={{ minWidth: 110, fontSize: 13, fontWeight: 700, color: "var(--cr-brown-dark)", paddingTop: 1 }}>{type}</div>
                  <div style={{ fontSize: 14, color: "#4a2e10", lineHeight: 1.7 }}>{desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div style={{ background: "var(--cr-brown)", borderRadius: 12, padding: "24px", textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
              Find every style on the map
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,248,240,0.8)", marginBottom: 16, lineHeight: 1.6 }}>
              Browse all {count} spots by neighborhood, borough, and more.
            </div>
            <Link
              href="/"
              style={{ display: "inline-block", padding: "9px 22px", background: "#fff", color: "var(--cr-brown)", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}
            >
              Open the map →
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
