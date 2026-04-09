import Link from "next/link";
import { locationSlug } from "@/lib/location-slug";
import { cleanAddress } from "@/lib/address";

export interface LocationRowData {
  id: string;
  name: string;
  display_name: string | null;
  neighborhood: string | null;
  borough: string | null;
  location_type: string | null;
  google_rating: number | null;
  google_place_id: string | null;
  formatted_address: string | null;
  mentions: string[] | null;
}

interface Props {
  loc: LocationRowData;
  /** Show neighborhood label — pass false on neighborhood-scoped pages */
  showNeighborhood?: boolean;
}

export default function LocationRow({ loc, showNeighborhood = true }: Props) {
  const displayName = loc.display_name ?? loc.name;
  const hasMeta = (showNeighborhood && loc.neighborhood) || loc.location_type;
  const hasMentions = loc.mentions && loc.mentions.length > 0;

  const mapsUrl = loc.google_place_id
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayName)}&query_place_id=${loc.google_place_id}`
    : loc.formatted_address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayName + " " + loc.formatted_address)}`
    : null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 4px",
        borderBottom: "1px solid rgba(139,69,19,0.08)",
        gap: 12,
      }}
    >
      <div style={{ minWidth: 0 }}>
        {/* Name → bakery page */}
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 3 }}>
          <Link href={`/locations/${locationSlug(loc.name)}`} style={{ color: "var(--cr-brown-dark)", textDecoration: "none" }}>
            {displayName}
          </Link>
        </div>

        {/* Neighborhood · Type */}
        {hasMeta && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginBottom: 2 }}>
            {showNeighborhood && loc.neighborhood && (
              <span style={{ fontSize: 12, color: "#9C6B3C" }}>{loc.neighborhood}</span>
            )}
            {showNeighborhood && loc.neighborhood && loc.location_type && (
              <span style={{ fontSize: 12, color: "rgba(139,69,19,0.3)" }}>·</span>
            )}
            {loc.location_type && (
              <span style={{ fontSize: 12, color: "#b08060" }}>{loc.location_type}</span>
            )}
          </div>
        )}

        {/* Address → Google Maps */}
        {loc.formatted_address && mapsUrl && (
          <div style={{ marginBottom: hasMentions ? 6 : 0 }}>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 12, color: "rgba(90,58,26,0.55)", textDecoration: "none" }}
            >
              📍 {cleanAddress(loc.formatted_address)}
            </a>
          </div>
        )}
        {loc.formatted_address && !mapsUrl && (
          <div style={{ fontSize: 12, color: "rgba(90,58,26,0.55)", marginBottom: hasMentions ? 6 : 0 }}>
            📍 {cleanAddress(loc.formatted_address)}
          </div>
        )}

        {/* Mentions pills */}
        {hasMentions && (
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {loc.mentions!.map((m) => (
              <span
                key={m}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "2px 9px",
                  borderRadius: 20,
                  background: "#fff8ed",
                  color: "#8B4513",
                  border: "1px solid rgba(139,69,19,0.2)",
                }}
              >
                {m}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Rating → Google Maps, arrow → bakery page */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        {loc.google_rating && (
          mapsUrl ? (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 13, color: "#5a3a1a", fontWeight: 500, textDecoration: "none" }}
            >
              ⭐ {loc.google_rating.toFixed(1)}
            </a>
          ) : (
            <span style={{ fontSize: 13, color: "#5a3a1a", fontWeight: 500 }}>
              ⭐ {loc.google_rating.toFixed(1)}
            </span>
          )
        )}
        <Link href={`/locations/${locationSlug(loc.name)}`} style={{ fontSize: 13, color: "rgba(139,69,19,0.4)", textDecoration: "none" }}>
          →
        </Link>
      </div>
    </div>
  );
}
