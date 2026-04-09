"use client";

import { useRef, useState } from "react";

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
  object_position: string | null;
}

interface LocationState {
  google_photos: string[] | null;
  photo_url: string | null;
  photo_source: string | null;
  object_position: string;
}

export default function PhotoPickerClient({ locations }: { locations: LocationWithPhotos[] }) {
  const [filter, setFilter] = useState<"all" | "needs_photo">("all");
  const [locationStates, setLocationStates] = useState<Record<string, LocationState>>({});
  const [loadingRefresh, setLoadingRefresh] = useState<Record<string, boolean>>({});
  const [loadingSelect, setLoadingSelect] = useState<Record<string, boolean>>({});
  const [loadingUpload, setLoadingUpload] = useState<Record<string, boolean>>({});
  const [loadingCrop, setLoadingCrop] = useState<Record<string, boolean>>({});
  const [pendingCrop, setPendingCrop] = useState<Record<string, string>>({});
  const [refreshAllProgress, setRefreshAllProgress] = useState<{ current: number; total: number } | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function getState(loc: LocationWithPhotos): LocationState {
    return locationStates[loc.id] ?? {
      google_photos: loc.google_photos,
      photo_url: loc.photo_url,
      photo_source: loc.photo_source,
      object_position: loc.object_position ?? "center center",
    };
  }

  async function saveCrop(loc: LocationWithPhotos) {
    const pos = pendingCrop[loc.id];
    if (!pos) return;
    setLoadingCrop((p) => ({ ...p, [loc.id]: true }));
    try {
      const res = await fetch(`/api/admin-opdl-stfrancis/locations/${loc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ object_position: pos }),
      });
      if (res.ok) {
        setLocationStates((p) => ({ ...p, [loc.id]: { ...getState(loc), object_position: pos } }));
        setPendingCrop((p) => { const n = { ...p }; delete n[loc.id]; return n; });
      } else {
        const d = await res.json().catch(() => ({}));
        alert(`Save failed: ${d.error ?? res.status}`);
      }
    } catch {
      alert("Network error");
    }
    setLoadingCrop((p) => ({ ...p, [loc.id]: false }));
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
        if (data.error !== "Location has no google_place_id") {
          alert(`Error refreshing photos: ${data.error ?? res.status}`);
        }
      }
    } catch {
      alert("Network error refreshing photos");
    }
    setLoadingRefresh((p) => ({ ...p, [id]: false }));
  }

  async function selectPhoto(loc: LocationWithPhotos, url: string, source: "google" | "own") {
    const current = getState(loc);
    const isSelected = current.photo_url === url;
    const body = isSelected
      ? { photo_url: null, photo_source: null, photo_attribution: null }
      : { photo_url: url, photo_source: source, photo_attribution: source === "google" ? "Google Maps" : null };

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
            photo_source: isSelected ? null : source,
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

  async function uploadPhoto(loc: LocationWithPhotos, file: File) {
    setLoadingUpload((p) => ({ ...p, [loc.id]: true }));
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/admin-opdl-stfrancis/photos/upload/${loc.id}`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setLocationStates((p) => ({
          ...p,
          [loc.id]: {
            ...(p[loc.id] ?? { google_photos: loc.google_photos }),
            photo_url: data.photo_url,
            photo_source: "own",
          } as LocationState,
        }));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(`Upload failed: ${data.error ?? res.status}`);
      }
    } catch {
      alert("Network error uploading photo");
    }
    setLoadingUpload((p) => ({ ...p, [loc.id]: false }));
  }

  async function refreshAll() {
    const targets = filtered.filter((l) => l.google_place_id);
    setRefreshAllProgress({ current: 0, total: targets.length });
    for (let i = 0; i < targets.length; i++) {
      setRefreshAllProgress({ current: i + 1, total: targets.length });
      await refreshPhotos(targets[i].id);
      if (i < targets.length - 1) await new Promise((r) => setTimeout(r, 300));
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
            {refreshAllProgress ? `Refreshing ${refreshAllProgress.current}/${refreshAllProgress.total}…` : "Refresh all"}
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
              <button key={f} onClick={() => setFilter(f)} style={{ padding: "5px 14px", fontSize: 12, fontWeight: 600, borderRadius: 20, border: "1.5px solid", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", borderColor: filter === f ? "var(--cr-brown)" : "rgba(139,69,19,0.2)", background: filter === f ? "var(--cr-brown)" : "#fff", color: filter === f ? "#fff" : "var(--cr-brown-mid)" }}>
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
            const isUploading = loadingUpload[loc.id];
            const isSelecting = loadingSelect[loc.id];
            const isCropping = loadingCrop[loc.id];
            const isLoading = isRefreshing || isSelecting || isUploading || isCropping;
            const currentPos = pendingCrop[loc.id] ?? state.object_position;
            const hasPendingCrop = loc.id in pendingCrop;
            const googlePhotos = state.google_photos ?? [];
            const ownPhoto = state.photo_source === "own" ? state.photo_url : null;

            // Own photo shown first if it exists and isn't also in google_photos
            const allPhotos: { url: string; source: "google" | "own" }[] = [
              ...(ownPhoto ? [{ url: ownPhoto, source: "own" as const }] : []),
              ...googlePhotos
                .filter((u) => u !== ownPhoto)
                .map((u) => ({ url: u, source: "google" as const })),
            ];

            return (
              <div key={loc.id} style={{ background: "#fff", borderRadius: 12, padding: 16, border: "1px solid rgba(139,69,19,0.1)", opacity: isLoading ? 0.7 : 1, transition: "opacity 0.15s" }}>
                {/* Top row */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: allPhotos.length > 0 ? 12 : 8 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--cr-brown-dark)" }}>
                        {loc.display_name || loc.name}
                      </div>
                      {state.photo_url && (
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: state.photo_source === "own" ? "#eff6ff" : "#f0fdf4", color: state.photo_source === "own" ? "#1d4ed8" : "#15803d" }}>
                          {state.photo_source === "own" ? "Your photo ✓" : "Photo set ✓"}
                        </span>
                      )}
                    </div>
                    {(loc.neighborhood || loc.borough) && (
                      <div style={{ fontSize: 12, color: "var(--cr-brown-mid)", marginTop: 2 }}>
                        {[loc.neighborhood, loc.borough].filter(Boolean).join(" · ")}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    {/* Upload button */}
                    <button
                      onClick={() => fileInputRefs.current[loc.id]?.click()}
                      disabled={isLoading}
                      style={{ padding: "5px 12px", fontSize: 11, fontWeight: 600, background: "#fff", color: "#1d4ed8", border: "1.5px solid rgba(29,78,216,0.3)", borderRadius: 6, cursor: isLoading ? "not-allowed" : "pointer", fontFamily: "inherit" }}
                    >
                      {isUploading ? "Uploading…" : "↑ Upload"}
                    </button>
                    <input
                      ref={(el) => { fileInputRefs.current[loc.id] = el; }}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadPhoto(loc, file);
                        e.target.value = "";
                      }}
                    />
                    {/* Refresh button */}
                    <button
                      onClick={() => refreshPhotos(loc.id)}
                      disabled={isLoading || !loc.google_place_id}
                      title={!loc.google_place_id ? "No Google ID" : undefined}
                      style={{ padding: "5px 12px", fontSize: 11, fontWeight: 600, background: "#fff", color: "var(--cr-brown)", border: "1.5px solid rgba(139,69,19,0.3)", borderRadius: 6, cursor: isLoading || !loc.google_place_id ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: !loc.google_place_id ? 0.4 : 1 }}
                    >
                      {isRefreshing ? "Refreshing…" : "Refresh from Google"}
                    </button>
                  </div>
                </div>

                {/* Photos */}
                {allPhotos.length === 0 ? (
                  <div style={{ fontSize: 12, color: "var(--cr-brown-mid)", fontStyle: "italic" }}>
                    {!loc.google_place_id ? "No Google ID — upload your own photo" : "No Google photos fetched yet — click Refresh or upload your own"}
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {allPhotos.map(({ url, source }, i) => {
                      const isSelected = state.photo_url === url;
                      return (
                        <div
                          key={i}
                          onClick={() => !isLoading && selectPhoto(loc, url, source)}
                          style={{ position: "relative", cursor: isLoading ? "not-allowed" : "pointer", borderRadius: 6, overflow: "hidden", border: isSelected ? "2.5px solid #d4904a" : "2.5px solid transparent", transition: "border-color 0.15s", flexShrink: 0 }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={`Photo ${i + 1}`} style={{ width: 140, height: 95, objectFit: "cover", display: "block" }} />
                          {/* Source badge */}
                          {source === "own" && (
                            <div style={{ position: "absolute", bottom: 4, left: 4, fontSize: 9, fontWeight: 700, padding: "2px 5px", borderRadius: 4, background: "rgba(29,78,216,0.85)", color: "#fff", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                              Yours
                            </div>
                          )}
                          {isSelected && (
                            <div style={{ position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: "50%", background: "#d4904a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 700 }}>
                              ✓
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Focal point picker — shown when a photo is selected */}
                {state.photo_url && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(139,69,19,0.08)" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#9C6B3C", marginBottom: 8 }}>
                      Crop position
                    </div>
                    <div style={{ fontSize: 11, color: "var(--cr-brown-mid)", marginBottom: 10 }}>
                      Click anywhere to set the focal point. Previews match the exact crop on the site.
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {[{ label: "Guide card & Bakery page", height: 220 }].map(({ label, height }) => (
                        <div key={label}>
                          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#9C6B3C", marginBottom: 4 }}>{label}</div>
                          <div
                            style={{ position: "relative", cursor: "crosshair", borderRadius: 6, overflow: "hidden", border: "1px solid rgba(139,69,19,0.15)", width: "100%" }}
                            onClick={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                              const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
                              setPendingCrop((p) => ({ ...p, [loc.id]: `${x}% ${y}%` }));
                            }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={state.photo_url!} alt="" style={{ width: "100%", height, objectFit: "cover", display: "block", objectPosition: currentPos }} />
                            {(() => {
                              const parts = currentPos.split(" ");
                              const px = parseFloat(parts[0]) || 50;
                              const py = parseFloat(parts[1]) || 50;
                              return (
                                <div style={{ position: "absolute", left: `${px}%`, top: `${py}%`, transform: "translate(-50%, -50%)", width: 18, height: 18, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "2.5px solid #8B4513", boxShadow: "0 1px 4px rgba(0,0,0,0.5)", pointerEvents: "none" }} />
                              );
                            })()}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Controls row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--cr-brown-dark)", fontFamily: "monospace" }}>{currentPos}</span>
                      {hasPendingCrop && (
                        <>
                          <button
                            onClick={() => saveCrop(loc)}
                            disabled={isCropping}
                            style={{ padding: "5px 16px", fontSize: 12, fontWeight: 700, background: "var(--cr-brown)", color: "#fff", border: "none", borderRadius: 6, cursor: isCropping ? "not-allowed" : "pointer", fontFamily: "inherit" }}
                          >
                            {isCropping ? "Saving…" : "Save crop"}
                          </button>
                          <button
                            onClick={() => setPendingCrop((p) => { const n = { ...p }; delete n[loc.id]; return n; })}
                            disabled={isCropping}
                            style={{ padding: "5px 12px", fontSize: 12, fontWeight: 600, background: "#fff", color: "var(--cr-brown-mid)", border: "1.5px solid rgba(139,69,19,0.2)", borderRadius: 6, cursor: "pointer", fontFamily: "inherit" }}
                          >
                            Reset
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--cr-brown-mid)", fontSize: 14 }}>
            {filter === "needs_photo" ? "All locations have a photo set 🎉" : "No locations found"}
          </div>
        )}
      </div>
    </div>
  );
}
