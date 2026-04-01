"use client";

import { useRouter } from "next/navigation";

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

interface Props {
  savedMode: boolean;
  nearbyMode: boolean;
  onNearbyClick: () => void;
  onSearchOpen: () => void;
  onSurpriseMe: () => void;
  onToggleSavedMode: () => void;
  savedCount: number;
  nearbyRadius: number | null;
}

export default function MobileActionBar({ savedMode, nearbyMode, onNearbyClick, onSearchOpen, onSurpriseMe, onToggleSavedMode, savedCount, nearbyRadius }: Props) {
  const router = useRouter();

  function handleClick(label: string) {
    if (label === "Nearby") onNearbyClick();
    if (label === "Search") onSearchOpen();
    if (label === "Saved") onToggleSavedMode();
    if (label === "Add or Edit") router.push("/submit");
    if (label === "Surprise Me") onSurpriseMe();
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: 0,
        right: 0,
        height: 56,
        background: "#f5e6d3",
        borderTop: "1px solid rgba(139,69,19,0.12)",
        borderBottom: "1px solid rgba(139,69,19,0.12)",
        boxShadow: "0 -2px 8px rgba(139,69,19,0.10)",
        display: "flex",
        zIndex: 40,
        fontFamily: "var(--font-inter), -apple-system, sans-serif",
      }}
    >
      {BUTTONS.map((btn) => {
        const isActive = (btn.label === "Saved" && savedMode) || (btn.label === "Nearby" && nearbyMode);
        return (
          <button
            key={btn.label}
            onClick={() => handleClick(btn.label)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px 2px",
              background: isActive ? "rgba(139,69,19,0.12)" : "none",
              border: "none",
              cursor: "pointer",
              gap: 3,
              color: isActive ? "var(--cr-brown-dark)" : "var(--cr-brown)",
            }}
          >
            {btn.icon}
            <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.01em", lineHeight: 1.2, textAlign: "center" }}>
              {btn.label === "Saved" && savedCount > 0
                ? `Saved (${savedCount})`
                : btn.label === "Nearby" && nearbyMode && nearbyRadius != null
                ? `Nearby (${nearbyRadius} mi)`
                : btn.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
