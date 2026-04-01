"use client";

import { useEffect, useRef, useState } from "react";
import type { SidebarLocation } from "@/components/Sidebar";

export interface Filters {
  query: string;
  boroughs: string[];
  types: string[];
  days: string[];
  neighborhoods: string[];
}

export const EMPTY_FILTERS: Filters = {
  query: "",
  boroughs: [],
  types: [],
  days: [],
  neighborhoods: [],
};

export function hasActiveFilters(f: Filters): boolean {
  return !!(f.query || f.boroughs.length || f.types.length || f.days.length || f.neighborhoods.length);
}

const TYPE_LABELS: Record<string, string> = {
  Bakery: "Bakery",
  Café: "Café",
  Restaurant: "Restaurant",
  Market: "Market",
  "Pop-up": "Pop-up",
  Kiosk: "Kiosk",
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_SHORT: Record<string, string> = {
  Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu",
  Friday: "Fri", Saturday: "Sat", Sunday: "Sun",
};

function toggle(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}

function Chip({ label, active, onClick, compact }: { label: string; active: boolean; onClick: () => void; compact?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: compact ? "4px 7px" : "4px 11px",
        fontSize: compact ? 11 : 11,
        fontWeight: 600,
        borderRadius: 20,
        border: `1.5px solid ${active ? "var(--cr-brown)" : "rgba(139,69,19,0.22)"}`,
        background: active ? "var(--cr-brown)" : "transparent",
        color: active ? "#fff" : "#8B4513",
        cursor: "pointer",
        whiteSpace: "nowrap",
        transition: "all 0.1s",
        fontFamily: "inherit",
      }}
    >
      {label}
    </button>
  );
}

interface SearchPanelProps {
  filters: Filters;
  onChange: (f: Filters) => void;
  onClose: () => void;
  locations: SidebarLocation[];
  filteredCount: number;
}

export default function SearchPanel({ filters, onChange, onClose, locations, filteredCount }: SearchPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [nameInputOpen, setNameInputOpen] = useState(() =>
    (typeof window !== "undefined" && window.innerWidth >= 768) || !!filters.query,
  );

  function openNameInput() {
    setNameInputOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    // Delay so the button click that opens the panel doesn't immediately close it
    const t = setTimeout(() => document.addEventListener("mousedown", handleClick), 50);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [onClose]);

  const uniqueBoroughs = [...new Set(locations.map((l) => l.borough).filter(Boolean))].sort() as string[];
  const uniqueTypes = [...new Set(locations.map((l) => l.location_type).filter(Boolean))].sort() as string[];
  const uniqueNeighborhoods = [...new Set(locations.map((l) => l.neighborhood).filter(Boolean))].sort() as string[];
  const isActive = hasActiveFilters(filters);

  return (
    <div
      ref={panelRef}
      className="search-panel"
      style={{
        background: "var(--cr-cream)",
        border: "1px solid rgba(139,69,19,0.15)",
        borderRadius: 12,
        boxShadow: "0 8px 32px rgba(139,69,19,0.15)",
        zIndex: 50,
        fontFamily: "var(--font-inter), -apple-system, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 14px 10px",
          borderBottom: "1px solid rgba(139,69,19,0.1)",
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--cr-brown-dark)", letterSpacing: "0.01em" }}>
          Search & Filter
          {isActive && (
            <span style={{ fontWeight: 500, color: "#9C6B3C", marginLeft: 6 }}>
              ({filteredCount} of {locations.length})
            </span>
          )}
        </span>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {isActive && (
            <button
              onClick={() => onChange(EMPTY_FILTERS)}
              style={{ fontSize: 11, color: "#9C6B3C", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline", fontFamily: "inherit" }}
            >
              Clear all
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              background: "rgba(139,69,19,0.1)",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              color: "var(--cr-brown)",
              padding: "4px 8px",
              fontSize: 13,
              fontWeight: 600,
              lineHeight: 1,
              fontFamily: "inherit",
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          padding: "12px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          maxHeight: "calc(100vh - 120px)",
          overflowY: "auto",
        }}
      >
        {/* Name search */}
        {nameInputOpen ? (
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by name…"
            value={filters.query}
            onChange={(e) => onChange({ ...filters, query: e.target.value })}
            style={{
              width: "100%",
              padding: "8px 10px",
              fontSize: 13,
              color: "var(--cr-brown-dark)",
              background: "#fff",
              border: "1px solid rgba(139,69,19,0.2)",
              borderRadius: 6,
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />
        ) : (
          <button
            onClick={openNameInput}
            style={{
              width: "100%",
              padding: "8px 10px",
              fontSize: 13,
              color: "rgba(139,69,19,0.45)",
              background: "#fff",
              border: "1px solid rgba(139,69,19,0.2)",
              borderRadius: 6,
              cursor: "text",
              textAlign: "left",
              fontFamily: "inherit",
            }}
          >
            Search by name…
          </button>
        )}

        {/* Borough */}
        {uniqueBoroughs.length > 0 && (
          <div>
            <div style={sectionLabel}>Borough</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {uniqueBoroughs.map((b) => (
                <Chip
                  key={b}
                  label={b}
                  active={filters.boroughs.includes(b)}
                  onClick={() => onChange({ ...filters, boroughs: toggle(filters.boroughs, b) })}
                />
              ))}
            </div>
          </div>
        )}

        {/* Type */}
        {uniqueTypes.length > 0 && (
          <div>
            <div style={sectionLabel}>Type</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {uniqueTypes.map((t) => (
                <Chip
                  key={t}
                  label={TYPE_LABELS[t] ?? t}
                  active={filters.types.includes(t)}
                  onClick={() => onChange({ ...filters, types: toggle(filters.types, t) })}
                />
              ))}
            </div>
          </div>
        )}

        {/* Day */}
        <div>
          <div style={sectionLabel}>Open on</div>
          <div style={{ display: "flex", flexWrap: "nowrap", gap: 5 }}>
            {DAYS.map((d) => (
              <Chip
                key={d}
                label={DAY_SHORT[d]}
                active={filters.days.includes(d)}
                onClick={() => onChange({ ...filters, days: toggle(filters.days, d) })}
                compact
              />
            ))}
          </div>
        </div>

        {/* Neighborhood */}
        {uniqueNeighborhoods.length > 0 && (
          <div>
            <div style={sectionLabel}>Neighborhood</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 96, overflowY: "auto" }}>
              {uniqueNeighborhoods.map((n) => (
                <Chip
                  key={n}
                  label={n}
                  active={filters.neighborhoods.includes(n)}
                  onClick={() => onChange({ ...filters, neighborhoods: toggle(filters.neighborhoods, n) })}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const sectionLabel: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: "#9C6B3C",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: 7,
};
