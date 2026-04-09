"use client";

import { useRouter } from "next/navigation";

export interface SidebarLocation {
  id: string;
  name: string;
  display_name: string | null;
  neighborhood: string | null;
  borough: string | null;
  latitude: number;
  longitude: number;
  created_at: string;
  location_type: string | null;
  days_open: string | null;
}

interface SidebarProps {
  locations: SidebarLocation[];          // all locations — for Recently Added + total count
  filteredLocations: SidebarLocation[];  // post-filter — for list + X count
  isFiltered: boolean;
  onShowAll: () => void;
  onSelectLocation: (loc: SidebarLocation) => void;
  onSearchOpen: () => void;
  onSurpriseMe: () => void;
  savedIds: Set<string>;
  onToggleSave: (id: string) => void;
  savedMode: boolean;
  onToggleSavedMode: () => void;
  selectedId: string | null;
  nearbyMode: boolean;
  nearbyRadius: number | null;
  nearbyError: string | null;
  onNearbyClick: () => void;
  onNearbyRefresh: () => void;
  onClearAll: () => void;
  distances: globalThis.Map<string, number> | null;
}

const BUTTONS = [
  {
    label: "Nearby",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M9 2C5.686 2 3 4.686 3 8c0 4.5 6 9 6 9s6-4.5 6-9c0-3.314-2.686-6-6-6z" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    label: "Search",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M14 14l-2.5-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "Saved",
    icon: (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
        <path d="M8 13.5S2 9.5 2 5.5C2 3.567 3.567 2 5.5 2c1 0 1.9.45 2.5 1.15C8.6 2.45 9.5 2 10.5 2 12.433 2 14 3.567 14 5.5c0 4-6 8-6 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "Add or Edit",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 13.5V15h1.5l7.372-7.372-1.5-1.5L3 13.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M12.872 4.128a1.06 1.06 0 011.5 1.5l-.872.872-1.5-1.5.872-.872z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "Surprise Me",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2.5" y="2.5" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="6" cy="6" r="1" fill="currentColor"/>
        <circle cx="12" cy="6" r="1" fill="currentColor"/>
        <circle cx="6" cy="12" r="1" fill="currentColor"/>
        <circle cx="12" cy="12" r="1" fill="currentColor"/>
        <circle cx="9" cy="9" r="1" fill="currentColor"/>
      </svg>
    ),
  },
];

function getRecentlyAdded(locations: SidebarLocation[], count = 4) {
  return [...locations]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, count);
}

export function RecentlyAddedItem({ loc, onClick, selected }: { loc: SidebarLocation; onClick: () => void; selected: boolean }) {
  const displayName = loc.display_name || loc.name;
  return (
    <div
      onClick={onClick}
      style={{
        padding: "5px 12px",
        cursor: "pointer",
        borderBottom: "1px solid rgba(139,69,19,0.06)",
        background: selected ? "rgba(139,69,19,0.07)" : "transparent",
        transition: "background 0.1s",
        borderLeft: selected ? "2px solid var(--cr-brown)" : "2px solid transparent",
        fontSize: 12,
        fontWeight: 400,
        color: "var(--cr-brown-dark)",
        lineHeight: 1.3,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
      onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = "rgba(139,69,19,0.05)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = selected ? "rgba(139,69,19,0.08)" : "transparent"; }}
    >
      {displayName}
    </div>
  );
}

export function Heart({ filled }: { filled: boolean }) {
  return filled ? (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="#c0392b">
      <path d="M8 13.5S2 9.5 2 5.5C2 3.567 3.567 2 5.5 2c1 0 1.9.45 2.5 1.15C8.6 2.45 9.5 2 10.5 2 12.433 2 14 3.567 14 5.5c0 4-6 8-6 8Z"/>
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
      <path d="M8 13.5S2 9.5 2 5.5C2 3.567 3.567 2 5.5 2c1 0 1.9.45 2.5 1.15C8.6 2.45 9.5 2 10.5 2 12.433 2 14 3.567 14 5.5c0 4-6 8-6 8Z" stroke="rgba(139,69,19,0.35)" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

export function LocationItem({
  loc,
  onClick,
  saved,
  onToggleSave,
  selected,
  distanceMiles,
}: {
  loc: SidebarLocation;
  onClick: () => void;
  saved: boolean;
  onToggleSave: (id: string) => void;
  selected: boolean;
  distanceMiles?: number;
}) {
  const displayName = loc.display_name || loc.name;
  const sub = [loc.neighborhood, loc.borough].filter(Boolean).join(" · ");
  const distLabel = distanceMiles != null
    ? distanceMiles < 0.1 ? "< 0.1 mi" : `${distanceMiles.toFixed(1)} mi`
    : null;

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        cursor: "pointer",
        borderBottom: "1px solid rgba(139,69,19,0.07)",
        background: selected ? "rgba(139,69,19,0.08)" : "transparent",
        transition: "background 0.1s",
        borderLeft: selected ? "3px solid var(--cr-brown)" : "3px solid transparent",
      }}
      onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = "rgba(139,69,19,0.05)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = selected ? "rgba(139,69,19,0.08)" : "transparent"; }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icon.png" alt="" style={{ width: 26, height: 26, objectFit: "contain", flexShrink: 0 }} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--cr-brown-dark)",
            lineHeight: 1.3,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {displayName}
        </div>
        {sub && <div style={{ fontSize: 11, color: "#9C6B3C", marginTop: 2 }}>{sub}</div>}
        {distLabel && <div style={{ fontSize: 11, color: "#b08060", marginTop: 1, fontWeight: 500 }}>{distLabel}</div>}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onToggleSave(loc.id); }}
        style={{ background: "none", border: "none", cursor: "pointer", padding: 8, flexShrink: 0, lineHeight: 1 }}
        title={saved ? "Remove from saved" : "Save"}
        aria-label={saved ? "Remove from saved" : "Save"}
      >
        <Heart filled={saved} />
      </button>
    </div>
  );
}

export default function Sidebar({
  locations,
  filteredLocations,
  isFiltered,
  onShowAll,
  onSelectLocation,
  onSearchOpen,
  onSurpriseMe,
  savedIds,
  onToggleSave,
  savedMode,
  onToggleSavedMode,
  selectedId,
  nearbyMode,
  nearbyRadius,
  nearbyError,
  onNearbyClick,
  onNearbyRefresh,
  onClearAll,
  distances,
}: SidebarProps) {
  const router = useRouter();
  const recentlyAdded = getRecentlyAdded(locations);

  function handleButtonClick(label: string) {
    if (label === "Nearby") onNearbyClick();
    if (label === "Search") onSearchOpen();
    if (label === "Add or Edit") router.push("/submit");
    if (label === "Surprise Me") onSurpriseMe();
    if (label === "Saved") onToggleSavedMode();
  }

  return (
    <aside
      style={{
        width: 400,
        flexShrink: 0,
        background: "var(--cr-cream)",
        borderRight: "1px solid rgba(139,69,19,0.12)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "var(--font-inter), -apple-system, sans-serif",
      }}
    >
      {/* Action buttons */}
      <div
        style={{
          display: "flex",
          flexShrink: 0,
          background: "#f5e6d3",
          boxShadow: "0 2px 8px rgba(139,69,19,0.10)",
          zIndex: 1,
          position: "relative",
        }}
      >
        {BUTTONS.map((btn) => {
          const isActive = (btn.label === "Saved" && savedMode) || (btn.label === "Nearby" && nearbyMode);
          return (
          <button
            key={btn.label}
            onClick={() => handleButtonClick(btn.label)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 2px",
              background: isActive ? "rgba(139,69,19,0.12)" : "none",
              border: "none",
              borderRight: "1px solid rgba(139,69,19,0.12)",
              cursor: "pointer",
              gap: 4,
              color: isActive ? "var(--cr-brown-dark)" : "var(--cr-brown)",
            }}
            onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "rgba(139,69,19,0.08)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = isActive ? "rgba(139,69,19,0.12)" : "transparent"; }}
          >
            {btn.icon}
            <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.01em", lineHeight: 1.2, textAlign: "center" }}>
              {btn.label === "Saved" && savedIds.size > 0 ? `Saved (${savedIds.size})` : btn.label}
            </span>
          </button>
        );})}
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 8 }}>
        {/* Recently Added — hidden when filtered */}
        {!isFiltered && recentlyAdded.length > 0 && (
          <div style={{ padding: "12px 12px 0" }}>
            <div style={sectionLabel}>Recently Added</div>
            <div
              style={{
                borderRadius: 8,
                border: "1px solid rgba(139,69,19,0.1)",
                overflow: "hidden",
                background: "rgba(253,247,242,0.7)",
              }}
            >
              {recentlyAdded.map((loc) => (
                <RecentlyAddedItem key={loc.id} loc={loc} onClick={() => onSelectLocation(loc)} selected={false} />
              ))}

            </div>
          </div>
        )}

        {/* Full list header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 14px 8px",
            marginTop: isFiltered ? 0 : 12,
            borderTop: isFiltered ? "none" : "2px solid rgba(139,69,19,0.18)",
          }}
        >
          <span style={sectionLabel}>
            {nearbyMode
              ? (nearbyRadius != null ? `Nearby (within ${nearbyRadius} mi)` : "Nearby")
              : savedMode
              ? (savedIds.size > 0 ? `Saved (${savedIds.size})` : "Saved")
              : "All Locations"}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {nearbyMode && (
              <button
                onClick={onNearbyRefresh}
                style={{ fontSize: 11, color: "#9C6B3C", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
              >
                Refresh ↻
              </button>
            )}
            {(nearbyMode || savedMode) && (
              <button
                onClick={nearbyMode ? onNearbyClick : onToggleSavedMode}
                style={{ fontSize: 11, color: "#9C6B3C", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
              >
                {nearbyMode ? "Clear ×" : "Close ×"}
              </button>
            )}
            {!nearbyMode && !savedMode && (
              <span style={{ fontSize: 11, color: "#b08060", fontWeight: 500 }}>
                {`${filteredLocations.length} of ${locations.length}`}
              </span>
            )}
            {isFiltered && !nearbyMode && !savedMode && (
              <button
                onClick={onClearAll}
                style={{ fontSize: 11, color: "#9C6B3C", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
              >
                Clear filters ×
              </button>
            )}
          </div>
        </div>

        {/* Full list */}
        <div>
          {filteredLocations.length === 0 ? (
            <div style={{ padding: "20px 14px", fontSize: 12, color: "#b08060", textAlign: "center" }}>
              {savedMode ? "No saved spots yet — heart a location to save it" : "No spots match your filters"}
            </div>
          ) : (
            filteredLocations.map((loc) => (
              <LocationItem
                key={loc.id}
                loc={loc}
                onClick={() => onSelectLocation(loc)}
                saved={savedIds.has(loc.id)}
                onToggleSave={onToggleSave}
                selected={false}
                distanceMiles={distances?.get(loc.id)}
              />
            ))
          )}
        </div>
      </div>
    </aside>
  );
}

export const sectionLabel: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: "#9C6B3C",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: 8,
};
