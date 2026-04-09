"use client";

import Link from "next/link";
import { useState } from "react";
import { locationSlug } from "@/lib/location-slug";
import { cleanAddress } from "@/lib/address";

export interface GuideSpotData {
  id: string;
  name: string;
  display_name: string | null;
  neighborhood: string | null;
  borough: string | null;
  location_type: string | null;
  notes: string | null;
  google_rating: number | null;
  google_place_id: string | null;
  formatted_address: string | null;
  mentions: string[] | null;
}

interface Props {
  loc: GuideSpotData;
  showNeighborhood?: boolean;
}

export default function GuideSpotCard({ loc, showNeighborhood = true }: Props) {
  const [hovered, setHovered] = useState(false);
  const displayName = loc.display_name ?? loc.name;
  const metaParts = [
    ...(showNeighborhood && loc.neighborhood ? [loc.neighborhood] : []),
    ...(loc.location_type ? [loc.location_type] : []),
  ];

  const mapsUrl = loc.google_place_id
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayName)}&query_place_id=${loc.google_place_id}`
    : loc.formatted_address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayName + " " + loc.formatted_address)}`
    : null;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        margin: "8px 0 28px",
        padding: "16px 18px",
        background: hovered ? "#fdf6ee" : "#fff",
        borderRadius: "0 10px 10px 0",
        borderLeft: `3px solid rgba(196,132,58,${hovered ? "0.9" : "0.7"})`,
        transition: "background 0.15s ease, border-color 0.15s ease",
      }}
    >
      {/* Name + rating */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
        <Link
          href={`/locations/${locationSlug(loc.name)}`}
          style={{ fontSize: 19, fontWeight: 700, color: "var(--cr-brown-dark)", textDecoration: "none", lineHeight: 1.2 }}
        >
          {displayName}
        </Link>
        {loc.google_rating && (
          mapsUrl ? (
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#9C6B3C", fontWeight: 500, flexShrink: 0, textDecoration: "none", whiteSpace: "nowrap" }}>
              ⭐ {loc.google_rating.toFixed(1)}
            </a>
          ) : (
            <span style={{ fontSize: 13, color: "#9C6B3C", fontWeight: 500, flexShrink: 0 }}>⭐ {loc.google_rating.toFixed(1)}</span>
          )
        )}
      </div>

      {/* Meta + address */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 12px", marginBottom: loc.notes ? 10 : 8 }}>
        {metaParts.length > 0 && (
          <span style={{ fontSize: 12, color: "#9C6B3C", letterSpacing: "0.01em" }}>
            {metaParts.join(" · ")}
          </span>
        )}
        {loc.formatted_address && mapsUrl && (
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "rgba(90,58,26,0.5)", textDecoration: "none" }}>
            📍 {cleanAddress(loc.formatted_address)}
          </a>
        )}
        {loc.formatted_address && !mapsUrl && (
          <span style={{ fontSize: 12, color: "rgba(90,58,26,0.5)" }}>
            📍 {cleanAddress(loc.formatted_address)}
          </span>
        )}
      </div>

      {/* Notes */}
      {loc.notes && (
        <p style={{ fontSize: 15, color: "#4a2e10", lineHeight: 1.75, margin: "0 0 12px" }}>{loc.notes}</p>
      )}

      {/* Footer: mentions + CTA */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {loc.mentions?.map((m) => (
            <span key={m} style={{ fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 20, background: "rgba(139,69,19,0.07)", color: "#8B4513", border: "1px solid rgba(139,69,19,0.15)" }}>
              {m}
            </span>
          ))}
        </div>
        <Link
          href={`/locations/${locationSlug(loc.name)}`}
          style={{ fontSize: 12, fontWeight: 600, color: "var(--cr-brown)", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}
        >
          View details →
        </Link>
      </div>
    </div>
  );
}
