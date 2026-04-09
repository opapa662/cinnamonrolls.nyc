import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";
import { locationSlug } from "@/lib/location-slug";
import { cleanAddress } from "@/lib/address";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Available Today — cinnamonrolls.nyc",
  description: "See every NYC cinnamon roll spot open today, with today's hours and ratings. Updated daily.",
  alternates: { canonical: "https://cinnamonrolls.nyc/today" },
  openGraph: {
    title: "Available Today — cinnamonrolls.nyc",
    description: "See every NYC cinnamon roll spot open today, with today's hours and ratings.",
    url: "https://cinnamonrolls.nyc/today",
  },
};

// ---------------------------------------------------------------------------
// Day-expansion helpers
// ---------------------------------------------------------------------------
const DAYS_ORDERED = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function expandDaysOpen(daysOpen: string | null): Set<string> {
  if (!daysOpen) return new Set(DAYS_ORDERED);
  const text = daysOpen.toLowerCase();
  if (
    text.includes("daily") ||
    text.includes("everyday") ||
    text.includes("every day") ||
    text.includes("7 day")
  ) {
    return new Set(DAYS_ORDERED);
  }
  const result = new Set<string>();
  const rangeMatch = daysOpen.match(/(\w+)\s*[-–]\s*(\w+)/);
  if (rangeMatch) {
    const start = DAYS_ORDERED.findIndex((d) =>
      d.toLowerCase().startsWith(rangeMatch[1].toLowerCase().slice(0, 3))
    );
    const end = DAYS_ORDERED.findIndex((d) =>
      d.toLowerCase().startsWith(rangeMatch[2].toLowerCase().slice(0, 3))
    );
    if (start !== -1 && end !== -1) {
      if (end >= start) {
        for (let i = start; i <= end; i++) result.add(DAYS_ORDERED[i]);
      } else {
        for (let i = start; i < 7; i++) result.add(DAYS_ORDERED[i]);
        for (let i = 0; i <= end; i++) result.add(DAYS_ORDERED[i]);
      }
    }
  }
  DAYS_ORDERED.forEach((day) => {
    if (text.includes(day.toLowerCase().slice(0, 3))) result.add(day);
  });
  return result.size > 0 ? result : new Set(DAYS_ORDERED);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Location {
  id: string;
  name: string;
  display_name: string | null;
  neighborhood: string | null;
  borough: string | null;
  location_type: string | null;
  days_open: string | null;
  google_hours: { weekday_text?: string[] } | null;
  google_rating: number | null;
  google_place_id: string | null;
  formatted_address: string | null;
  website: string | null;
  instagram: string | null;
  latitude: number | null;
  longitude: number | null;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default async function TodayPage() {
  const { data: locations, count } = await supabase
    .from("locations")
    .select(
      "id, name, display_name, neighborhood, borough, location_type, days_open, google_hours, google_rating, google_place_id, formatted_address, website, instagram, latitude, longitude",
      { count: "exact" }
    )
    .eq("visible", true)
    .order("name");

  // Determine today's day name in NYC time
  const todayName = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "America/New_York",
  });

  // Filter to spots open today
  const openToday = (locations ?? []).filter((loc: Location) =>
    expandDaysOpen(loc.days_open).has(todayName)
  );

  // Extract today's hours from google_hours.weekday_text
  function getTodayHours(loc: Location): string | null {
    const weekdayText = loc.google_hours?.weekday_text;
    if (!Array.isArray(weekdayText)) return null;
    const entry = weekdayText.find((line) =>
      line.toLowerCase().startsWith(todayName.toLowerCase())
    );
    if (!entry) return null;
    // Strip "DayName: " prefix
    const colonIdx = entry.indexOf(":");
    if (colonIdx === -1) return null;
    return entry.slice(colonIdx + 1).trim();
  }

  // Sort by rating descending, then name
  const sorted = [...openToday].sort((a, b) => {
    const ra = a.google_rating ?? 0;
    const rb = b.google_rating ?? 0;
    if (rb !== ra) return rb - ra;
    return (a.display_name ?? a.name).localeCompare(b.display_name ?? b.name);
  });

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
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>

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
              Available today
            </div>
            <h1
              style={{
                fontSize: 42,
                fontWeight: 800,
                color: "var(--cr-brown-dark)",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                margin: "0 0 10px",
              }}
            >
              {todayName}
            </h1>
            <p style={{ fontSize: 18, color: "#7A4010", margin: "0 0 16px", lineHeight: 1.5 }}>
              Here&apos;s what&apos;s open for rolls today.
            </p>
            <div
              style={{
                display: "inline-block",
                background: "var(--cr-brown)",
                color: "var(--cr-cream)",
                borderRadius: 20,
                padding: "6px 16px",
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "0.01em",
              }}
            >
              {sorted.length} spot{sorted.length !== 1 ? "s" : ""} rolling today
            </div>
          </div>

          {/* Cards — 1 col mobile, 2 col md, 3 col desktop */}
          <div style={{ paddingTop: 24, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {sorted.length === 0 ? (
              <div
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  padding: "56px 24px",
                  color: "var(--cr-brown-mid)",
                  fontSize: 16,
                  lineHeight: 1.6,
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 16 }}>🥲</div>
                <div style={{ fontWeight: 600, color: "var(--cr-brown-dark)", marginBottom: 8 }}>
                  Nothing confirmed open today
                </div>
                <div>Check back another day, or browse all spots on the map.</div>
                <Link
                  href="/"
                  style={{
                    display: "inline-block",
                    marginTop: 20,
                    padding: "9px 18px",
                    background: "var(--cr-brown)",
                    color: "var(--cr-cream)",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  View the full map →
                </Link>
              </div>
            ) : (
              sorted.map((loc: Location) => {
                const todayHours = getTodayHours(loc);
                const isClosed =
                  todayHours?.toLowerCase().includes("closed") ?? false;
                const displayName = loc.display_name ?? loc.name;

                return (
                  <div
                    key={loc.id}
                    style={{
                      background: "#fff",
                      borderRadius: 10,
                      border: "1px solid rgba(139,69,19,0.12)",
                      padding: "18px 20px",
                      opacity: isClosed ? 0.6 : 1,
                    }}
                  >
                    {/* Name */}
                    <Link
                      href={`/locations/${locationSlug(loc.name)}`}
                      style={{
                        display: "block",
                        fontSize: 22,
                        fontWeight: 700,
                        color: "var(--cr-brown-dark)",
                        textDecoration: "none",
                        lineHeight: 1.2,
                        marginBottom: 5,
                      }}
                    >
                      {displayName}
                    </Link>

                    {/* Neighborhood · Borough */}
                    {(loc.neighborhood || loc.borough) && (
                      <div
                        style={{
                          fontSize: 14,
                          fontVariant: "small-caps",
                          letterSpacing: "0.04em",
                          color: "var(--cr-brown-mid)",
                          marginBottom: 10,
                        }}
                      >
                        {[loc.neighborhood, loc.borough].filter(Boolean).join(" · ")}
                      </div>
                    )}

                    {/* Hours + rating row */}
                    {(todayHours || loc.google_rating) && (
                      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 10 }}>
                        {todayHours && (
                          <span style={{ fontSize: 15, color: "#5a3a1a" }}>
                            🕐 {todayHours}
                          </span>
                        )}
                        {loc.google_rating && (
                          <span style={{ fontSize: 15, color: "#5a3a1a" }}>
                            ⭐ {loc.google_rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Address */}
                    {loc.formatted_address && (() => {
                      const mapsUrl = loc.google_place_id
                        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayName)}&query_place_id=${loc.google_place_id}`
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.formatted_address)}`;
                      return (
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: "block", fontSize: 14, color: "#7a5230", textDecoration: "none", marginBottom: 12 }}
                        >
                          📍 {cleanAddress(loc.formatted_address)}
                        </a>
                      );
                    })()}

                    {/* View spot link */}
                    <Link
                      href={`/locations/${locationSlug(loc.name)}`}
                      style={{ fontSize: 14, fontWeight: 600, color: "var(--cr-brown)", textDecoration: "none" }}
                    >
                      View spot →
                    </Link>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer link */}
          {sorted.length > 0 && (
            <div style={{ textAlign: "center", paddingTop: 36, paddingBottom: 8 }}>
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
          )}
        </div>
      </div>
    </div>
  );
}
