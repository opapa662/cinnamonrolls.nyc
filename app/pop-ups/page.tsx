import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";
import { locationSlug } from "@/lib/location-slug";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Pop-Ups — cinnamonrolls.nyc",
  description: "NYC cinnamon roll pop-ups: where to find them, how to order, and who to follow. No fixed address — just great rolls.",
  alternates: { canonical: "https://cinnamonrolls.nyc/pop-ups" },
  openGraph: {
    title: "Pop-Ups — cinnamonrolls.nyc",
    description: "NYC cinnamon roll pop-ups: where to find them, how to order, and who to follow.",
    url: "https://cinnamonrolls.nyc/pop-ups",
  },
};

interface Location {
  id: string;
  name: string;
  display_name: string | null;
  neighborhood: string | null;
  borough: string | null;
  notes: string | null;
  website: string | null;
  instagram: string | null;
  mentions: string[] | null;
  google_rating: number | null;
  google_place_id: string | null;
  photo_url: string | null;
}

export default async function PopUpsPage() {
  const { data: popups, count } = await supabase
    .from("locations")
    .select("id, name, display_name, neighborhood, borough, notes, website, instagram, mentions, google_rating, google_place_id, photo_url", { count: "exact" })
    .eq("location_type", "Pop-up")
    .order("name");

  const spots = (popups ?? []) as Location[];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--cr-cream)",
        fontFamily: "var(--font-inter), -apple-system, sans-serif",
      }}
    >
      <Header count={count ?? 0} backLink />

      <div style={{ paddingTop: "60px", paddingBottom: "72px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>

          {/* Hero */}
          <div style={{ paddingTop: 40, paddingBottom: 28, borderBottom: "1px solid rgba(139,69,19,0.12)" }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--cr-brown-mid)",
                marginBottom: 8,
              }}
            >
              No fixed address
            </div>
            <h1
              style={{
                fontSize: 42,
                fontWeight: 800,
                color: "var(--cr-brown-dark)",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                margin: "0 0 12px",
              }}
            >
              Pop-Ups
            </h1>
            <p style={{ fontSize: 18, color: "#7A4010", margin: 0, lineHeight: 1.6, maxWidth: 520 }}>
              These spots don&apos;t have a permanent home — follow them on Instagram to catch their next drop.
            </p>
          </div>

          {/* Cards */}
          <div style={{ paddingTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            {spots.map((loc) => {
              const displayName = loc.display_name ?? loc.name;
              const sub = [loc.neighborhood, loc.borough].filter(Boolean).join(" · ");
              const igHandle = loc.instagram?.replace(/^@/, "");
              const igUrl = igHandle ? `https://instagram.com/${igHandle}` : null;

              return (
                <div
                  key={loc.id}
                  style={{
                    background: "#fff",
                    borderRadius: 12,
                    border: "1px solid rgba(139,69,19,0.12)",
                    overflow: "hidden",
                  }}
                >
                  {/* Photo */}
                  {loc.photo_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={loc.photo_url}
                      alt={`${displayName} cinnamon roll`}
                      style={{ width: "100%", height: 240, objectFit: "cover", display: "block" }}
                    />
                  )}
                  <div style={{ padding: "22px 24px" }}>
                  {/* Name + sub */}
                  <Link
                    href={`/locations/${locationSlug(loc.name)}`}
                    style={{
                      display: "block",
                      fontSize: 22,
                      fontWeight: 700,
                      color: "var(--cr-brown-dark)",
                      textDecoration: "none",
                      lineHeight: 1.2,
                      marginBottom: sub ? 4 : 10,
                    }}
                  >
                    {displayName}
                  </Link>

                  {sub && (
                    <div
                      style={{
                        fontSize: 13,
                        fontVariant: "small-caps",
                        letterSpacing: "0.04em",
                        color: "var(--cr-brown-mid)",
                        marginBottom: 10,
                      }}
                    >
                      {sub}
                    </div>
                  )}

                  {/* Rating */}
                  {loc.google_rating && (
                    <div style={{ fontSize: 14, color: "#5a3a1a", marginBottom: 10 }}>
                      ⭐ {loc.google_rating.toFixed(1)}
                    </div>
                  )}

                  {/* Notes */}
                  {loc.notes && (
                    <p
                      style={{
                        fontSize: 15,
                        color: "#5a3a1a",
                        lineHeight: 1.65,
                        margin: "0 0 14px",
                      }}
                    >
                      {loc.notes}
                    </p>
                  )}

                  {/* Press mentions */}
                  {(loc.mentions ?? []).length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                      {(loc.mentions ?? []).map((m) => (
                        <span
                          key={m}
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            padding: "4px 12px",
                            borderRadius: 20,
                            background: "#fff8ed",
                            color: "#8B4513",
                            border: "1px solid rgba(139,69,19,0.25)",
                          }}
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* CTAs */}
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                    {igUrl && (
                      <a
                        href={igUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "9px 18px",
                          background: "var(--cr-brown)",
                          color: "var(--cr-cream)",
                          borderRadius: 8,
                          fontSize: 14,
                          fontWeight: 600,
                          textDecoration: "none",
                        }}
                      >
                        Follow @{igHandle}
                      </a>
                    )}
                    {loc.website && (
                      <a
                        href={loc.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: "var(--cr-brown)",
                          textDecoration: "none",
                        }}
                      >
                        🌐 Website
                      </a>
                    )}
                  </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{ textAlign: "center", paddingTop: 40 }}>
            <Link
              href="/"
              style={{
                fontSize: 13,
                color: "var(--cr-brown-mid)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              ← View all spots on the map
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
