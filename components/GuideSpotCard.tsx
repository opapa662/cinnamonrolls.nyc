import Link from "next/link";
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
  photo_url?: string | null;
  object_position?: string | null;
  roll_style?: string | null;
  frosting_types?: string[] | null;
  gluten_free?: boolean;
  dairy_free?: boolean;
  vegan?: boolean;
  price_approx?: string | null;
}

interface Props {
  loc: GuideSpotData;
  showNeighborhood?: boolean;
}

export default function GuideSpotCard({ loc, showNeighborhood = true }: Props) {
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

  const dietaryParts = [
    ...(loc.gluten_free ? ["Gluten-free"] : []),
    ...(loc.dairy_free  ? ["Dairy-free"] : []),
    ...(loc.vegan       ? ["Vegan"] : []),
  ];

  return (
    <div
      style={{
        margin: "8px 0 28px",
        background: "#fff",
        borderRadius: "0 10px 10px 0",
        borderLeft: "3px solid rgba(196,132,58,0.7)",
        overflow: "hidden",
      }}
    >
      {loc.photo_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={loc.photo_url}
          alt={`${loc.display_name ?? loc.name} cinnamon roll`}
          style={{ width: "100%", height: 220, objectFit: "cover", objectPosition: loc.object_position ?? "center center", display: "block" }}
        />
      )}
      <div style={{ padding: "16px 18px" }}>
      {/* Name + rating + price */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
        <Link
          href={`/locations/${locationSlug(loc.name)}`}
          style={{ fontSize: 19, fontWeight: 700, color: "var(--cr-brown-dark)", textDecoration: "none", lineHeight: 1.2 }}
        >
          {displayName}
        </Link>
        {(loc.google_rating || loc.price_approx) && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, whiteSpace: "nowrap" }}>
            {loc.google_rating && (
              mapsUrl ? (
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#9C6B3C", fontWeight: 600, textDecoration: "none" }}>
                  ⭐ {loc.google_rating.toFixed(1)}
                </a>
              ) : (
                <span style={{ fontSize: 13, color: "#9C6B3C", fontWeight: 600 }}>⭐ {loc.google_rating.toFixed(1)}</span>
              )
            )}
            {loc.google_rating && loc.price_approx && (
              <span style={{ fontSize: 12, color: "rgba(139,69,19,0.3)" }}>|</span>
            )}
            {loc.price_approx && (
              <span style={{ fontSize: 13, fontWeight: 600, color: "#9C6B3C" }}>{loc.price_approx}</span>
            )}
          </div>
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

      {/* Footer: roll style + mentions + CTA — v2 */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {(loc.roll_style || (loc.frosting_types ?? []).length > 0 || dietaryParts.length > 0) && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9C6B3C", marginBottom: 4 }}>
                Roll Styles
              </div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {loc.roll_style && (
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 20, background: "rgba(196,132,58,0.1)", color: "#7a3e0a", border: "1px solid rgba(196,132,58,0.3)" }}>
                    {loc.roll_style}
                  </span>
                )}
                {(loc.frosting_types ?? []).map((f) => (
                  <span key={f} style={{ fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 20, background: "rgba(196,132,58,0.1)", color: "#7a3e0a", border: "1px solid rgba(196,132,58,0.3)" }}>
                    {f}
                  </span>
                ))}
                {dietaryParts.map((d) => (
                  <span key={d} style={{ fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 20, background: "#f0fdf4", color: "#15803d", border: "1px solid rgba(21,128,61,0.2)" }}>
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}
          {(loc.mentions ?? []).length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9C6B3C", marginBottom: 4 }}>
                Featured in
              </div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {loc.mentions?.map((m) => (
                  <span key={m} style={{ fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 20, background: "rgba(139,69,19,0.07)", color: "#8B4513", border: "1px solid rgba(139,69,19,0.15)" }}>
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <Link
          href={`/locations/${locationSlug(loc.name)}`}
          style={{ fontSize: 12, fontWeight: 600, color: "var(--cr-brown)", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}
        >
          View details →
        </Link>
      </div>
      </div>
    </div>
  );
}
