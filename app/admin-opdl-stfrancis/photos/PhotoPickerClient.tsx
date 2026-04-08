"use client";

import { useState } from "react";

interface LocationWithPhotos {
  id: string;
  name: string;
  display_name: string | null;
  neighborhood: string | null;
  borough: string | null;
  google_place_id: string | null;
  google_photos: string[] | null;
  photo_url: string | null;
  photo_source: string | null;
}

interface LocationState {
  google_photos: string[] | null;
  photo_url: string | null;
  photo_source: string | null;
}

export default function PhotoPickerClient({ locations }: { locations: LocationWithPhotos[] }) {
  const [filter, setFilter] = useState<"all" | "needs_photo">("all");
  const [locationStates, setLocationStates] = useState<Record<string, LocationState>>({});
  const [loadingRefresh, setLoadingRefresh] = useState<Record<string, boolean>>({});
  const [loadingSelect, setLoadingSelect] = useState<Record<string, boolean>>({});
  const [refreshAllProgress, setRefreshAllProgress] = useState<{ current: number; total: number } | null>(null);

  function getState(loc: LocationWithPhotos): LocationState {
    return locationStates[loc.id] ?? {
      google_photos: loc.google_photos,
      photo_url: loc.photo_url,
      photo_source: loc.photo_source,
    };
  }

  const withPhoto = locations.filter((l) => getState(l).photo_url !== null).length;
  const withoutPhoto = locations.length - withPhoto;

  const filtered = filter === "needs_photo"
    ? locations.filter((l) => getState(l).photo_url === null)
    : locations;

  async function refreshPhotos(id: string) {
    setLoadingRefresh((p) => ({ ...p, [id]: true }));
    try {
      const res = await fetch(`/api/admin-opdl-stfrancis/photos/refresh/${id}`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setLocationStates((p) => ({
          ...p,
          [id]: { ...(p[id] ?? {}), google_photos: data.photos } as LocationState,
        }));
      } else {
        const data = await res.json().catch(() => ({}));
        // Silently skip spots with no google_place_id (e.g. pop-ups)
        if (data.error !== "Location has no google_place_id") {
          alert(`Error refreshing photos: ${data.error ?? res.status}`);
        }
      }
    } catch {
      alert("Network error refreshing photos");
    }
    setLoadingRefresh((p) => ({ ...p, [id]: false }));
  }

  async function selectPhoto(loc: LocationWithPhotos, url: string) {
    const current = getState(loc);
    const isSelected = current.photo_url === url;
    const body = isSelected
      ? { photo_url: null, photo_source: null, photo_attribution: null }
      : { photo_url: url, photo_source: "google", photo_attribution: "Google Maps" };

    setLoadingSelect((p) => ({ ...p, [loc.id]: true }));
    try {
      const res = await fetch(`/api/admin-opdl-stfrancis/locations/${loc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setLocationStates((p) => ({
          ...p,
          [loc.id]: {
            ...(p[loc.id] ?? { google_photos: loc.google_photos }),
            photo_url: isSelected ? null : url,
            photo_source: isSelected ? null : "google",
          } as LocationState,
        }));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(`Error updating photo: ${data.error ?? res.status}`);
      }
    } catch {
      alert("Network error updating photo");
    }
    setLoadingSelect((p) => ({ ...p, [loc.id]: false }));
  }

  async function refreshAll() {
    const targets = filtered.filter((l) => l.google_place_id);
    setRefreshAllProgress({ current: 0, total: targets.length });
    for (let i = 0; i < targets.length; i++) {
      setRefreshAllProgress({ current: i + 1, total: targets.length });
      await refreshPhotos(targets[i].id);
      if (i < targets.length - 1) {
        await new Promise((r) => setTimeout(r, 300));
      }
    }
    setRefreshAllProgress(null);
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--cr-cream)", fontFamily: "var(--font-inter), -apple-system, sans-serif" }}>
      {/* Header */}
      <header style={{ background: "#fff", borderBottom: "1px solid rgba(139,69,19,0.1)", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.png" alt="" style={{ width: 24, height: 24 }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--cr-brown-dark)" }}>Photos</span>
          <span style={{ fontSize: 12, color: "var(--cr-brown-mid)", marginLeft: 4 }}>cinnamonrolls.nyc</span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <a href="/admin-opdl-stfrancis" style={{ fontSize: 13, color: "var(--cr-brown-mid)", textDecoration: "none" }}>← Dashboard</a>
          <button
            onClick={refreshAll}
            disabled={refreshAllProgress !== null}
            style={{ padding: "6px 14px", fontSize: 12, fontWeight: 600, background: refreshAllProgress ? "rgba(139,69,19,0.1)" : "var(--cr-brown)", color: refreshAllProgress ? "var(--cr-brown-mid)" : "#fff", border: "none", borderRadius: 6, cursor: refreshAllProgress ? "not-allowed" : "pointer", fontFamily: "inherit" }}
          >
            {refreshAllProgress
              ? `Refreshing ${refreshAllProgress.current}/${refreshAllProgress.total}…`
              : "Refresh all"}
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px" }}>
        {/* Stats + filter */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: "var(--cr-brown-mid)" }}>
            <span style={{ fontWeight: 600, color: "var(--cr-brown-dark)" }}>{withPhoto}</span> with photo ·{" "}
            <span style={{ fontWeight: 600, color: withoutPhoto > 0 ? "#c2410c" : "var(--cr-brown-dark)" }}>{withoutPhoto}</span> without
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {(["all", "needs_photo"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{ padding: "5px 14px", fontSize: 12, fontWeight: 600, borderRadius: 20, border: "1.5px solid", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", borderColor: filter === f ? "var(--cr-brown)" : "rgba(139,69,19,0.2)", background: filter === f ? "var(--cr-brown)" : "#fff", color: filter === f ? "#fff" : "var(--cr-brown-mid)" }}
              >
                {f === "all" ? "All" : "Needs photo"}
              </button>
            ))}
          </div>
        </div>

        {/* Location cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((loc) => {
            const state = getState(loc);
            const isRefreshing = loadingRefresh[loc.id];
            const isSelecting = loadingSelect[loc.id];
            const isLoading = isRefreshing || isSelecting;
            const photos = state.google_photos;
            const hasPhotos = photos && photos.length > 0;

            return (
              <div
                key={loc.id}
                style={{ background: "#fff", borderRadius: 12, padding: 16, border: "1px solid rgba(139,69,19,0.1)", opacity: isLoading ? 0.7 : 1, transition: "opacity 0.15s" }}
              >
                {/* Top row */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: hasPhotos ? 12 : 0 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--cr-brown-dark)" }}>
                        {loc.display_name || loc.name}
                      </div>
                      {state.photo_url && (
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "#f0fdf4", color: "#15803d" }}>
                          Photo set ✓
                        </span>
                      )}
                    </div>
                    {(loc.neighborhood || loc.borough) && (
                      <div style={{ fontSize: 12, color: "var(--cr-brown-mid)", marginTop: 2 }}>
                        {[loc.neighborhood, loc.borough].filter(Boolean).join(" · ")}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => refreshPhotos(loc.id)}
                    disabled={isLoading || !loc.google_place_id}
                    title={!loc.google_place_id ? "No google_place_id set" : undefined}
                    style={{ flexShrink: 0, padding: "5px 12px", fontSize: 11, fontWeight: 600, background: "#fff", color: "var(--cr-brown)", border: "1.5px solid rgba(139,69,19,0.3)", borderRadius: 6, cursor: isLoading || !loc.google_place_id ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: !loc.google_place_id ? 0.4 : 1 }}
                  >
                    {isRefreshing ? "Refreshing…" : "Refresh from Google"}
                  </button>
                </div>

                {/* Photos area */}
                {!hasPhotos ? (
                  <div style={{ fontSize: 12, color: "var(--cr-brown-mid)", fontStyle: "italic", marginTop: 8 }}>
                    No Google photos fetched yet — click Refresh
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {photos.map((url, i) => {
                      const isSelected = state.photo_url === url;
                      return (
                        <div
                          key={i}
                          onClick={() => !isLoading && selectPhoto(loc, url)}
                          style={{ position: "relative", cursor: isLoading ? "not-allowed" : "pointer", borderRadius: 6, overflow: "hidden", border: isSelected ? "2.5px solid #d4904a" : "2.5px solid transparent", transition: "border-color 0.15s", flexShrink: 0 }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt={`Photo ${i + 1}`}
                            style={{ width: 140, height: 95, objectFit: "cover", display: "block" }}
                          />
                          {isSelected && (
                            <div style={{ position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: "50%", background: "#d4904a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 700, lineHeight: 1 }}>
                              ✓
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--cr-brown-mid)", fontSize: 14 }}>
            {filter === "needs_photo" ? "All locations have a photo set" : "No locations found"}
          </div>
        )}
      </div>
    </div>
  );
}
