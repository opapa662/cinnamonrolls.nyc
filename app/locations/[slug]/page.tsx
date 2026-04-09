import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import LocationPageTracker from "@/components/LocationPageTracker";
import BackToMapLink from "@/components/BackToMapLink";
import OutboundLink from "@/components/OutboundLink";
import { supabase } from "@/lib/supabase";
import { locationSlug, toSlug } from "@/lib/location-slug";
import ShareButton from "@/components/ShareButton";
import { cleanAddress } from "@/lib/address";

interface Location {
  id: string;
  name: string;
  display_name: string | null;
  neighborhood: string | null;
  borough: string | null;
  location_type: string | null;
  notes: string | null;
  website: string | null;
  instagram: string | null;
  mentions: string[] | null;
  days_open: string | null;
  google_rating: number | null;
  google_review_count: number | null;
  google_place_id: string | null;
  google_hours: { weekday_text: string[] } | null;
  formatted_address: string | null;
  latitude: number;
  longitude: number;
  photo_url: string | null;
  roll_style: string | null;
  frosting_type: string | null;
  gluten_free: boolean;
  dairy_free: boolean;
  vegan: boolean;
}

async function getLocations(): Promise<Location[]> {
  const { data } = await supabase
    .from("locations")
    .select("id, name, display_name, neighborhood, borough, location_type, notes, website, instagram, mentions, days_open, google_rating, google_review_count, google_place_id, google_hours, formatted_address, latitude, longitude, photo_url, roll_style, frosting_type, gluten_free, dairy_free, vegan")
    .eq("visible", true);
  return data ?? [];
}

function buildJsonLd(loc: Location, slug: string) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    "name": loc.display_name ?? loc.name,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": loc.neighborhood ?? "New York",
      "addressRegion": "NY",
      "addressCountry": "US",
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": loc.latitude,
      "longitude": loc.longitude,
    },
    "url": `https://cinnamonrolls.nyc/locations/${slug}`,
  };
  if (loc.google_rating && loc.google_review_count) {
    data["aggregateRating"] = {
      "@type": "AggregateRating",
      "ratingValue": loc.google_rating,
      "reviewCount": loc.google_review_count,
    };
  }
  if (loc.website) data["sameAs"] = loc.website;
  if (loc.location_type) data["servesCuisine"] = "Cinnamon Rolls";
  return data;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const locations = await getLocations();
  const seen = new Set<string>();
  return locations
    .map((loc) => ({ slug: locationSlug(loc.name) }))
    .filter(({ slug }) => {
      if (seen.has(slug)) return false;
      seen.add(slug);
      return true;
    });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locations = await getLocations();
  const matches = locations.filter((l) => locationSlug(l.name) === slug);
  if (!matches.length) return {};
  const first = matches[0];
  const name = first.name;

  let description: string;
  if (matches.length > 1) {
    const boroughs = [...new Set(matches.map((l) => l.borough).filter(Boolean))];
    description = `${name} has multiple NYC locations serving cinnamon rolls${boroughs.length ? ` — in ${boroughs.join(" and ")}` : ""}. Find hours, ratings, and details on cinnamonrolls.nyc.`;
  } else {
    const parts: string[] = [];
    if (first.location_type) parts.push(`a ${first.location_type.toLowerCase()}`);
    if (first.neighborhood && first.borough) parts.push(`in ${first.neighborhood}, ${first.borough}`);
    else if (first.neighborhood) parts.push(`in ${first.neighborhood}`);
    else if (first.borough) parts.push(`in ${first.borough}`);
    const ratingStr = first.google_rating ? ` Rated ${first.google_rating.toFixed(1)} on Google.` : "";
    description = `${name}${parts.length ? ` — ${parts.join(" ")}` : ""} serving cinnamon rolls in NYC.${ratingStr} Find hours, directions, and more on cinnamonrolls.nyc.`;
  }

  return {
    title: `${name} — cinnamonrolls.nyc`,
    description,
    alternates: { canonical: `https://cinnamonrolls.nyc/locations/${slug}` },
    openGraph: {
      title: `${name} — cinnamonrolls.nyc`,
      description,
      url: `https://cinnamonrolls.nyc/locations/${slug}`,
      images: [{ url: "https://cinnamonrolls.nyc/icon.png", width: 512, height: 512 }],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: `${name} — cinnamonrolls.nyc`,
      images: ["https://cinnamonrolls.nyc/opengraph-image"],
    },
  };
}

export default async function LocationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [locations, countResult] = await Promise.all([
    getLocations(),
    supabase.from("locations").select("*", { count: "exact", head: true }).eq("visible", true),
  ]);

  const matches = locations.filter((l) => locationSlug(l.name) === slug);
  if (!matches.length) notFound();

  const name = matches[0].name;
  const count = countResult.count ?? 0;
  const multiLocation = matches.length > 1;

  // Shared fields — take from first location (consistent across branches)
  const first = matches[0];
  const allMentions = [...new Set(matches.flatMap((l) => l.mentions ?? []))];

  const jsonLd = matches.length === 1
    ? buildJsonLd(matches[0], slug)
    : { "@context": "https://schema.org", "@graph": matches.map((l) => buildJsonLd(l, slug)) };

  return (
    <div style={{ minHeight: "100vh", background: "var(--cr-cream)", fontFamily: "var(--font-inter), -apple-system, sans-serif" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LocationPageTracker bakeryId={first.id} bakeryName={name} />
      <Header count={count} />
      <div style={{ paddingTop: 60 }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px 80px" }}>

          {/* Back to map */}
          <BackToMapLink />

          {/* Breadcrumb */}
          {(first.borough || first.neighborhood) && (
            <nav aria-label="Breadcrumb" style={{ fontSize: 12, color: "#9C6B3C", marginBottom: 20, marginTop: -12, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <Link href="/" style={{ color: "#9C6B3C", textDecoration: "none" }}>Map</Link>
              {first.borough && (
                <>
                  <span style={{ opacity: 0.4 }}>›</span>
                  <Link href={`/boroughs/${toSlug(first.borough)}`} style={{ color: "#9C6B3C", textDecoration: "none" }}>
                    {first.borough}
                  </Link>
                </>
              )}
              {first.neighborhood && (
                <>
                  <span style={{ opacity: 0.4 }}>›</span>
                  <Link href={`/neighborhoods/${toSlug(first.neighborhood)}`} style={{ color: "#9C6B3C", textDecoration: "none" }}>
                    {first.neighborhood}
                  </Link>
                </>
              )}
            </nav>
          )}

          {/* Bakery name */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--cr-brown-dark)", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
              {name}
            </h1>
            <ShareButton
              url={`https://cinnamonrolls.nyc/locations/${slug}`}
              title={`${name} - cinnamonrolls.nyc`}
              text={`Check out ${name} on cinnamonrolls.nyc`}
              style={{ marginTop: 6 }}
            />
          </div>

          {/* Shared meta */}
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "6px 14px", marginBottom: 24, fontSize: 14, color: "#5a3a1a" }}>
            {first.location_type && <span>{first.location_type}</span>}
            {first.days_open && (
              <>
                <span style={{ color: "rgba(139,69,19,0.25)" }}>|</span>
                <span>{first.days_open}</span>
              </>
            )}
          </div>

          {/* Shared links */}
          {(first.website || first.instagram) && (
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
              {first.website && (
                <OutboundLink href={first.website} linkType="bakery_website" bakeryId={first.id} linkLocation="location_page" style={{ fontSize: 14, color: "#3b6fc4", textDecoration: "none", fontWeight: 500 }}>
                  🌐 Website
                </OutboundLink>
              )}
              {first.instagram && (
                <OutboundLink href={`https://instagram.com/${first.instagram.replace(/^@/, "")}`} linkType="instagram" bakeryId={first.id} linkLocation="location_page" style={{ fontSize: 14, color: "#3b6fc4", textDecoration: "none", fontWeight: 500 }}>
                  @{first.instagram.replace(/^@/, "")}
                </OutboundLink>
              )}
            </div>
          )}

          {/* Press & Recognition */}
          {allMentions.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "#9C6B3C", margin: "0 0 8px" }}>AS SEEN IN</h2>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {allMentions.map((m) => (
                  <span key={m} style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: "#fff8ed", color: "#8B4513", border: "1px solid rgba(139,69,19,0.25)" }}>
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Per-location sections */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 28 }}>
            {matches.map((loc) => {
              const locationLabel = loc.display_name ?? loc.name;
              const sub = [loc.neighborhood, loc.borough].filter(Boolean).join(" · ");
              const mapsUrl = loc.google_place_id
                ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationLabel)}&query_place_id=${loc.google_place_id}`
                : null;
              return (
                <div key={loc.id} style={{ background: "#fff", borderRadius: 10, border: "1px solid rgba(139,69,19,0.12)", overflow: "hidden" }}>
                  {/* Photo */}
                  {loc.photo_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={loc.photo_url}
                      alt={`${loc.display_name ?? loc.name} cinnamon roll`}
                      style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }}
                    />
                  )}
                  <div style={{ padding: "18px 20px" }}>
                  {/* Location label (only shown for multi-location brands) */}
                  {multiLocation && sub && (
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "#9C6B3C", marginBottom: 6 }}>
                      {sub.toUpperCase()}
                    </div>
                  )}
                  {!multiLocation && sub && (
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "#9C6B3C", marginBottom: 6 }}>
                      {sub.toUpperCase()}
                    </div>
                  )}

                  {/* Roll style + dietary badges */}
                  {(loc.roll_style || loc.gluten_free || loc.dairy_free || loc.vegan) && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                      {loc.roll_style && (
                        <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: "#fff8ed", color: "#8B4513", border: "1px solid rgba(139,69,19,0.2)" }}>
                          {loc.roll_style}
                        </span>
                      )}
                      {loc.frosting_type && (
                        <span style={{ fontSize: 12, fontWeight: 500, padding: "3px 10px", borderRadius: 20, background: "rgba(139,69,19,0.06)", color: "#7A4010", border: "1px solid rgba(139,69,19,0.15)" }}>
                          {loc.frosting_type}
                        </span>
                      )}
                      {loc.gluten_free && <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: "#f0fdf4", color: "#15803d", border: "1px solid rgba(21,128,61,0.2)" }}>GF</span>}
                      {loc.dairy_free  && <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: "#f0fdf4", color: "#15803d", border: "1px solid rgba(21,128,61,0.2)" }}>DF</span>}
                      {loc.vegan       && <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: "#f0fdf4", color: "#15803d", border: "1px solid rgba(21,128,61,0.2)" }}>Vegan</span>}
                    </div>
                  )}

                  {/* Rating */}
                  {loc.google_rating && (
                    <div style={{ fontSize: 13, color: "#5a3a1a", marginBottom: loc.notes ? 8 : 0 }}>
                      {mapsUrl ? (
                        <OutboundLink href={mapsUrl} linkType="google_maps_directions" bakeryId={loc.id} linkLocation="location_page" style={{ color: "inherit", textDecoration: "none" }}>
                          ⭐ {loc.google_rating.toFixed(1)} on Google
                          {loc.google_review_count ? ` (${loc.google_review_count.toLocaleString()} reviews)` : ""}
                        </OutboundLink>
                      ) : (
                        <span>⭐ {loc.google_rating.toFixed(1)}{loc.google_review_count ? ` (${loc.google_review_count.toLocaleString()} reviews)` : ""}</span>
                      )}
                    </div>
                  )}

                  {/* Address */}
                  {loc.formatted_address && (
                    <div style={{ fontSize: 13, color: "#5a3a1a", marginTop: loc.google_rating ? 6 : 0 }}>
                      {mapsUrl ? (
                        <OutboundLink href={mapsUrl} linkType="google_maps_directions" bakeryId={loc.id} linkLocation="location_page" style={{ color: "inherit", textDecoration: "none" }}>
                          📍 {cleanAddress(loc.formatted_address)}
                        </OutboundLink>
                      ) : (
                        <span>📍 {cleanAddress(loc.formatted_address)}</span>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  {loc.notes && (
                    <p style={{ fontSize: 14, color: "#5a3a1a", lineHeight: 1.7, margin: "8px 0 0" }}>
                      {loc.notes}
                    </p>
                  )}

                  {/* Static map */}
                  {process.env.NEXT_PUBLIC_MAPBOX_TOKEN && (
                    <a
                      href={mapsUrl ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.display_name ?? loc.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: "block", marginTop: 14, borderRadius: 8, overflow: "hidden", lineHeight: 0 }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://api.mapbox.com/styles/v1/mapbox/light-v11/static/pin-l+8b4513(${loc.longitude},${loc.latitude})/${loc.longitude},${loc.latitude},14,0/640x200@2x?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`}
                        alt={`Map showing location of ${loc.display_name ?? loc.name}`}
                        width={640}
                        height={200}
                        style={{ width: "100%", height: "auto", display: "block" }}
                      />
                    </a>
                  )}

                  {/* Hours */}
                  {loc.google_hours?.weekday_text && loc.google_hours.weekday_text.length > 0 && (
                    <div style={{ marginTop: 14 }}>
                      <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "#9C6B3C", margin: "0 0 6px" }}>HOURS</h2>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {loc.google_hours.weekday_text.map((line, i) => (
                          <div key={i} style={{ fontSize: 12, color: "#5a3a1a" }}>{line}</div>
                        ))}
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Neighborhood / borough cross-links */}
          {(first.neighborhood || first.borough) && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
              {first.neighborhood && (
                <Link
                  href={`/neighborhoods/${toSlug(first.neighborhood)}`}
                  style={{ fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 20, background: "#fff", color: "var(--cr-brown)", border: "1px solid rgba(139,69,19,0.2)", textDecoration: "none" }}
                >
                  More in {first.neighborhood}
                </Link>
              )}
              {first.borough && (
                <Link
                  href={`/boroughs/${toSlug(first.borough)}`}
                  style={{ fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 20, background: "#fff", color: "var(--cr-brown)", border: "1px solid rgba(139,69,19,0.2)", textDecoration: "none" }}
                >
                  Browse {first.borough}
                </Link>
              )}
              {first.borough && (
                <Link
                  href={`/guides/best-cinnamon-rolls-${toSlug(first.borough)}`}
                  style={{ fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 20, background: "#fff", color: "var(--cr-brown)", border: "1px solid rgba(139,69,19,0.2)", textDecoration: "none" }}
                >
                  {first.borough} guide
                </Link>
              )}
            </div>
          )}

          {/* Claim CTA */}
          <div style={{ background: "rgba(139,69,19,0.06)", borderRadius: 10, padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--cr-brown-dark)", marginBottom: 3 }}>Is this your spot?</div>
              <div style={{ fontSize: 13, color: "#7A4010", lineHeight: 1.5 }}>Claim your page and keep your details up to date.</div>
            </div>
            <Link
              href="/about#contact"
              style={{ flexShrink: 0, display: "inline-block", padding: "9px 18px", background: "var(--cr-brown)", color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}
            >
              Contact us →
            </Link>
          </div>

          {/* Explore more CTA */}
          <div style={{ background: "var(--cr-brown)", borderRadius: 12, padding: "22px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
              Explore all {count} spots on the map
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,248,240,0.8)", marginBottom: 14, lineHeight: 1.6 }}>
              Filter by neighborhood, type, rating, and more.
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
