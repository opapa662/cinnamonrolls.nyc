"use client";

import { useState } from "react";

export interface LocationRow {
  id: string;
  name: string;
  display_name: string | null;
  neighborhood: string | null;
  borough: string | null;
  roll_style: string | null;
  frosting_type: string | null;
  gluten_free: boolean;
  dairy_free: boolean;
  vegan: boolean;
}

interface FieldState {
  roll_style: string | null;
  frosting_type: string | null;
  gluten_free: boolean;
  dairy_free: boolean;
  vegan: boolean;
}

const ROLL_STYLES = [
  "Classic American",
  "Scandinavian",
  "Sourdough",
  "Laminated",
  "Japanese Milk Bread",
];

const FROSTING_TYPES = [
  "Cream Cheese",
  "Vanilla Glaze",
  "Brown Butter",
  "Caramel Glaze",
  "Pearl Sugar",
  "Naked",
  "Multiple",
];

export default function CategorizeClient({ locations }: { locations: LocationRow[] }) {
  const [states, setStates] = useState<Record<string, FieldState>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<"all" | "uncategorized">("all");

  function getState(loc: LocationRow): FieldState {
    return states[loc.id] ?? {
      roll_style: loc.roll_style,
      frosting_type: loc.frosting_type,
      gluten_free: loc.gluten_free,
      dairy_free: loc.dairy_free,
      vegan: loc.vegan,
    };
  }

  async function patch(id: string, update: Partial<FieldState>) {
    setSaving((p) => ({ ...p, [id]: true }));
    try {
      const res = await fetch(`/api/admin-opdl-stfrancis/locations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      });
      if (res.ok) {
        setStates((p) => ({ ...p, [id]: { ...getState(locations.find((l) => l.id === id)!), ...(p[id] ?? {}), ...update } }));
      } else {
        const d = await res.json().catch(() => ({}));
        alert(`Save failed: ${d.error ?? res.status}`);
      }
    } catch {
      alert("Network error");
    }
    setSaving((p) => ({ ...p, [id]: false }));
  }

  const categorized = locations.filter((l) => getState(l).roll_style !== null).length;
  const uncategorized = locations.length - categorized;

  const filtered = filter === "uncategorized"
    ? locations.filter((l) => getState(l).roll_style === null)
    : locations;

  return (
    <div style={{ minHeight: "100vh", background: "var(--cr-cream)", fontFamily: "var(--font-inter), -apple-system, sans-serif" }}>
      {/* Header */}
      <header style={{ background: "#fff", borderBottom: "1px solid rgba(139,69,19,0.1)", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.png" alt="" style={{ width: 24, height: 24 }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--cr-brown-dark)" }}>Categorize</span>
          <span style={{ fontSize: 12, color: "var(--cr-brown-mid)", marginLeft: 4 }}>cinnamonrolls.nyc</span>
        </div>
        <a href="/admin-opdl-stfrancis" style={{ fontSize: 13, color: "var(--cr-brown-mid)", textDecoration: "none" }}>← Dashboard</a>
      </header>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px" }}>
        {/* Stats + filter */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: "var(--cr-brown-mid)" }}>
            <span style={{ fontWeight: 600, color: "var(--cr-brown-dark)" }}>{categorized}</span> categorized ·{" "}
            <span style={{ fontWeight: 600, color: uncategorized > 0 ? "#c2410c" : "var(--cr-brown-dark)" }}>{uncategorized}</span> remaining
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {(["all", "uncategorized"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: "5px 14px", fontSize: 12, fontWeight: 600, borderRadius: 20, border: "1.5px solid", cursor: "pointer", fontFamily: "inherit", borderColor: filter === f ? "var(--cr-brown)" : "rgba(139,69,19,0.2)", background: filter === f ? "var(--cr-brown)" : "#fff", color: filter === f ? "#fff" : "var(--cr-brown-mid)" }}>
                {f === "all" ? "All" : "Uncategorized"}
              </button>
            ))}
          </div>
        </div>

        {/* Location rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((loc) => {
            const state = getState(loc);
            const isSaving = saving[loc.id];
            const sub = [loc.neighborhood, loc.borough].filter(Boolean).join(" · ");

            return (
              <div
                key={loc.id}
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  padding: "14px 18px",
                  border: "1px solid rgba(139,69,19,0.1)",
                  opacity: isSaving ? 0.65 : 1,
                  transition: "opacity 0.15s",
                }}
              >
                {/* Name row */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--cr-brown-dark)" }}>
                      {loc.display_name || loc.name}
                    </div>
                    {sub && <div style={{ fontSize: 12, color: "var(--cr-brown-mid)", marginTop: 2 }}>{sub}</div>}
                  </div>
                  {state.roll_style && (
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 20, background: "#f0fdf4", color: "#15803d", flexShrink: 0 }}>
                      ✓ Categorized
                    </span>
                  )}
                </div>

                {/* Fields */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
                  {/* Roll Style */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 180 }}>
                    <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#9C6B3C" }}>Roll Style</label>
                    <select
                      value={state.roll_style ?? ""}
                      disabled={isSaving}
                      onChange={(e) => {
                        const val = e.target.value || null;
                        setStates((p) => ({ ...p, [loc.id]: { ...getState(loc), ...(p[loc.id] ?? {}), roll_style: val } }));
                        patch(loc.id, { roll_style: val });
                      }}
                      style={{ padding: "6px 10px", fontSize: 13, border: "1.5px solid rgba(139,69,19,0.2)", borderRadius: 6, background: "#fff", fontFamily: "inherit", color: state.roll_style ? "var(--cr-brown-dark)" : "rgba(139,69,19,0.4)", cursor: "pointer", outline: "none" }}
                    >
                      <option value="">— unset —</option>
                      {ROLL_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Frosting Type */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 160 }}>
                    <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#9C6B3C" }}>Frosting</label>
                    <select
                      value={state.frosting_type ?? ""}
                      disabled={isSaving}
                      onChange={(e) => {
                        const val = e.target.value || null;
                        setStates((p) => ({ ...p, [loc.id]: { ...getState(loc), ...(p[loc.id] ?? {}), frosting_type: val } }));
                        patch(loc.id, { frosting_type: val });
                      }}
                      style={{ padding: "6px 10px", fontSize: 13, border: "1.5px solid rgba(139,69,19,0.2)", borderRadius: 6, background: "#fff", fontFamily: "inherit", color: state.frosting_type ? "var(--cr-brown-dark)" : "rgba(139,69,19,0.4)", cursor: "pointer", outline: "none" }}
                    >
                      <option value="">— unset —</option>
                      {FROSTING_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Dietary flags */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#9C6B3C" }}>Dietary</label>
                    <div style={{ display: "flex", gap: 10 }}>
                      {(["gluten_free", "dairy_free", "vegan"] as const).map((flag) => {
                        const labels = { gluten_free: "GF", dairy_free: "DF", vegan: "Vegan" };
                        return (
                          <label key={flag} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 500, color: state[flag] ? "#15803d" : "var(--cr-brown-mid)", cursor: "pointer", userSelect: "none" }}>
                            <input
                              type="checkbox"
                              checked={state[flag]}
                              disabled={isSaving}
                              onChange={(e) => {
                                const val = e.target.checked;
                                setStates((p) => ({ ...p, [loc.id]: { ...getState(loc), ...(p[loc.id] ?? {}), [flag]: val } }));
                                patch(loc.id, { [flag]: val });
                              }}
                              style={{ accentColor: "#15803d", cursor: "pointer" }}
                            />
                            {labels[flag]}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--cr-brown-mid)", fontSize: 14 }}>
            {filter === "uncategorized" ? "All locations are categorized 🎉" : "No locations found"}
          </div>
        )}
      </div>
    </div>
  );
}
