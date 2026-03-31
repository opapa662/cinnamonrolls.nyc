"use client";

import { useEffect, useRef, useState } from "react";

const SUPABASE_URL = "https://zlzlnkjjdlhuyvplidpc.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsemxua2pqZGxodXl2cGxpZHBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4ODkxODcsImV4cCI6MjA5MDQ2NTE4N30.Ppm1q13yWgWq5mmZRvTr799njy3t02wWp01YCOb0_t8";
const LOGO_URL = "https://cinnamonrolls-nyc.vercel.app/icon.png";

// ── Colour tokens (mirrors the HTML file) ──────────────────────────────────
const B = {
  cream: "#fff8f0",
  darkBrown: "#3d1c02",
  saddleBrown: "#8b4513",
  midBrown: "#9c6b3c",
  lightBrown: "#b08060",
  accent: "#d4904a",
  warmTan: "#f5e6d3",
  featuredBg: "#fdf0e0",
  photoBg: "#f0dcc8",
  divider: "#e8d5c0",
};

// ── Styles injected into <head> when the generator is visible ──────────────
const GENERATOR_STYLES = `
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; background: ${B.cream}; color: ${B.darkBrown}; min-height: 100vh; }

.ig-page-header {
  background: ${B.darkBrown};
  padding: 16px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.ig-page-header .logo-group { display: flex; align-items: center; gap: 12px; }
.ig-page-header img { width: 36px; height: 36px; border-radius: 8px; }
.ig-page-header .title { font-weight: 600; font-size: 16px; color: #fff8f0; }
.ig-page-header .subtitle { font-size: 11px; color: ${B.accent}; font-style: italic; }
.ig-page-header .badge {
  display: flex; align-items: center; gap: 6px;
  font-size: 11px; color: ${B.accent};
  background: rgba(212,144,74,0.12);
  padding: 5px 12px; border-radius: 20px;
}
.ig-page-header .badge .dot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; }

.ig-container { max-width: 1200px; margin: 0 auto; padding: 28px 32px; display: flex; gap: 32px; }

.ig-sidebar { width: 280px; flex-shrink: 0; }
.search-input {
  width: 100%; padding: 10px 14px; border-radius: 10px;
  border: 1.5px solid ${B.divider}; background: #fff;
  font-size: 13px; font-family: 'Inter', sans-serif;
  color: ${B.darkBrown}; outline: none; margin-bottom: 12px;
}
.search-input:focus { border-color: ${B.accent}; }
.spot-list {
  display: flex; flex-direction: column; gap: 4px;
  max-height: calc(100vh - 200px); overflow-y: auto;
}
.spot-item {
  padding: 10px 14px; border-radius: 10px; border: none;
  background: transparent; text-align: left; cursor: pointer;
  font-family: 'Inter', sans-serif; font-size: 13px;
  color: ${B.midBrown}; transition: all 0.12s; line-height: 1.4;
}
.spot-item:hover { background: ${B.warmTan}; color: ${B.darkBrown}; }
.spot-item.active { background: ${B.warmTan}; color: ${B.darkBrown}; font-weight: 600; }
.spot-item .spot-meta { font-size: 11px; color: ${B.midBrown}; font-weight: 400; margin-top: 1px; }

.ig-main { flex: 1; min-width: 0; }
.preview-wrapper {
  border-radius: 16px; overflow: hidden;
  border: 1px solid ${B.divider}; margin-bottom: 16px; background: ${B.cream};
}
.preview-scaler { transform-origin: top left; width: 1080px; height: 1080px; }
.export-btn {
  width: 100%; padding: 14px 0;
  background: ${B.darkBrown}; color: ${B.cream};
  border: none; border-radius: 12px;
  font-size: 14px; font-weight: 600; cursor: pointer;
  font-family: 'Inter', sans-serif; letter-spacing: 0.5px;
  transition: opacity 0.15s;
}
.export-btn:hover { opacity: 0.9; }
.export-btn:disabled { opacity: 0.6; cursor: wait; }

.ig-loading {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; height: 60vh;
  color: ${B.midBrown}; font-size: 15px; gap: 12px;
}
.ig-loading .spinner {
  width: 40px; height: 40px;
  border: 3px solid ${B.divider}; border-top-color: ${B.accent};
  border-radius: 50%; animation: ig-spin 0.8s linear infinite;
}
@keyframes ig-spin { to { transform: rotate(360deg); } }

@media (max-width: 900px) {
  .ig-container { flex-direction: column; }
  .ig-sidebar { width: 100%; }
  .spot-list { max-height: 200px; flex-direction: row; flex-wrap: wrap; }
  .spot-item { white-space: nowrap; }
}
`;

// ── Static HTML structure for the generator ────────────────────────────────
const GENERATOR_HTML = `
<div class="ig-page-header">
  <div class="logo-group">
    <img src="${LOGO_URL}" alt="">
    <div>
      <div class="title">IG Post Generator</div>
      <div class="subtitle">cinnamonrolls.nyc</div>
    </div>
  </div>
  <div class="badge" id="ig-status-badge">
    <span class="dot"></span>
    <span id="ig-status-text">Connecting...</span>
  </div>
</div>

<div class="ig-container">
  <div class="ig-sidebar">
    <input type="text" class="search-input" id="ig-search" placeholder="Search spots...">
    <div class="spot-list" id="ig-spot-list"></div>
  </div>
  <div class="ig-main">
    <div class="ig-loading" id="ig-loading">
      <div class="spinner"></div>
      Loading spots from Supabase...
    </div>
    <div id="ig-main-content" style="display:none">
      <div class="preview-wrapper">
        <div class="preview-scaler" id="ig-preview-scaler">
          <div id="ig-card-root"></div>
        </div>
      </div>
      <button class="export-btn" id="ig-export-btn" onclick="igHandleExport()">Export as 1080×1080 PNG</button>
    </div>
  </div>
</div>
`;

// ── Generator logic (runs after DOM is ready + html2canvas is loaded) ───────
function initGenerator() {
  let spots: Spot[] = [];
  let selectedId: string | null = null;

  interface Spot {
    id: string;
    name: string;
    neighborhood: string;
    borough: string;
    type: string;
    rating: number | null;
    review_count: number | null;
    notes: string;
    review: string;
    hours: string;
    featured_by: string[] | null;
    instagram: string;
    photo_url: string | null;
  }

  async function fetchSpots(): Promise<Spot[]> {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/locations?status=eq.active&select=id,name,neighborhood,borough,location_type,google_rating,google_review_count,notes,review,days_open,mentions,instagram,photo_url&order=name.asc`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function mapSpot(r: any): Spot {
    let mentions: string[] = [];
    try {
      mentions = typeof r.mentions === "string" ? JSON.parse(r.mentions) : r.mentions || [];
    } catch {
      mentions = [];
    }
    return {
      id: r.id,
      name: r.name,
      neighborhood: r.neighborhood || "",
      borough: r.borough || "",
      type: r.location_type || "",
      rating: r.google_rating || null,
      review_count: r.google_review_count || null,
      notes: r.notes || "",
      review: r.review || "",
      hours: r.days_open || "",
      featured_by: mentions.length > 0 ? mentions : null,
      instagram: r.instagram || "",
      photo_url: r.photo_url || null,
    };
  }

  function renderList(filter = "") {
    const list = document.getElementById("ig-spot-list");
    if (!list) return;
    const filtered = spots.filter((s) =>
      `${s.name} ${s.neighborhood} ${s.borough}`.toLowerCase().includes(filter.toLowerCase())
    );
    list.innerHTML = filtered
      .map(
        (s) => `
      <button class="spot-item ${s.id === selectedId ? "active" : ""}" onclick="igSelectSpot('${s.id}')">
        ${s.name}
        <div class="spot-meta">${s.neighborhood} · ${s.borough}</div>
      </button>
    `
      )
      .join("");
  }

  function selectSpot(id: string) {
    selectedId = id;
    renderList((document.getElementById("ig-search") as HTMLInputElement)?.value ?? "");
    renderCard();
  }

  function renderCard() {
    const s = spots.find((x) => x.id === selectedId);
    if (!s) return;

    let metaParts: string[] = [];
    if (s.rating) {
      metaParts.push(
        `<span style="color:${B.accent};font-size:26px;margin-right:6px">★</span><span style="font-weight:600;color:${B.darkBrown};margin-right:4px">${s.rating}</span>`
      );
      if (s.review_count)
        metaParts.push(`<span style="font-size:22px">(${s.review_count.toLocaleString()})</span>`);
    }
    if (s.hours) {
      if (metaParts.length)
        metaParts.push(`<span style="margin:0 18px;color:${B.divider};font-weight:300">|</span>`);
      metaParts.push(
        `<svg viewBox="0 0 20 20" style="width:22px;height:22px;flex-shrink:0;margin-right:8px"><circle cx="10" cy="10" r="8" fill="none" stroke="${B.midBrown}" stroke-width="1.5"/><path d="M10 6V10L13 13" fill="none" stroke="${B.midBrown}" stroke-width="1.5" stroke-linecap="round"/></svg><span>${s.hours}</span>`
      );
    }

    let featuredHTML = "";
    if (s.featured_by && s.featured_by.length > 0) {
      const pills = s.featured_by
        .map(
          (m) =>
            `<div style="display:inline-flex;font-size:22px;font-weight:600;color:${B.saddleBrown};background:${B.featuredBg};padding:8px 24px;border-radius:40px">${m}</div>`
        )
        .join("");
      featuredHTML = `
        <div style="height:1.5px;background:${B.divider};margin-bottom:18px"></div>
        <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">
          <div style="font-size:16px;text-transform:uppercase;letter-spacing:2px;color:${B.lightBrown};font-weight:500">Featured by</div>
          ${pills}
        </div>`;
    }

    const cardRoot = document.getElementById("ig-card-root");
    if (!cardRoot) return;
    cardRoot.innerHTML = `
    <div style="width:1080px;height:1080px;background:${B.cream};font-family:'Inter',sans-serif;color:${B.darkBrown};position:relative;overflow:hidden;display:flex;flex-direction:column">
      <svg viewBox="0 0 120 120" style="position:absolute;bottom:-20px;left:-20px;width:220px;height:220px;opacity:0.04;pointer-events:none"><path d="M60 60 C60 36,84 24,96 36 C108 48,96 72,72 66 C54 63,48 48,60 42 C66 39,75 42,72 51 C70 56,63 57,62 53" fill="none" stroke="${B.saddleBrown}" stroke-width="4" stroke-linecap="round"/></svg>
      <svg viewBox="0 0 120 120" style="position:absolute;top:120px;right:-40px;width:180px;height:180px;opacity:0.04;pointer-events:none;transform:rotate(130deg)"><path d="M60 60 C60 36,84 24,96 36 C108 48,96 72,72 66 C54 63,48 48,60 42 C66 39,75 42,72 51 C70 56,63 57,62 53" fill="none" stroke="${B.saddleBrown}" stroke-width="4" stroke-linecap="round"/></svg>

      <div style="background:${B.darkBrown};padding:14px 40px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0">
        <div style="display:flex;align-items:center;gap:14px">
          <img src="${LOGO_URL}" crossorigin="anonymous" style="width:46px;height:46px;border-radius:10px;object-fit:cover">
          <div style="font-weight:600;font-size:23px;color:${B.cream};letter-spacing:0.8px">cinnamonrolls.nyc</div>
        </div>
        <div style="font-size:15px;color:${B.accent};font-style:italic;white-space:nowrap;letter-spacing:0.3px">the ultimate map of the city's best swirls</div>
      </div>

      <div style="width:100%;height:510px;background:${B.photoBg};position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0">
        ${
          s.photo_url
            ? `<img src="${s.photo_url}" crossorigin="anonymous" style="width:100%;height:100%;object-fit:cover">`
            : `<div style="display:flex;flex-direction:column;align-items:center;gap:12px;color:${B.midBrown};font-size:22px;opacity:0.5">
                <svg viewBox="0 0 48 48" style="width:80px;height:80px"><rect x="6" y="10" width="36" height="28" rx="4" fill="none" stroke="${B.midBrown}" stroke-width="1.8"/><circle cx="18" cy="22" r="4" fill="none" stroke="${B.midBrown}" stroke-width="1.5"/><path d="M6 34 L18 26 L26 32 L34 24 L42 30 L42 38 L6 38Z" fill="${B.midBrown}" opacity="0.15"/></svg>
                Cinnamon roll photo
              </div>`
        }
        <div style="position:absolute;bottom:18px;left:28px;background:rgba(61,28,2,0.82);color:${B.cream};padding:8px 22px;border-radius:40px;font-size:18px;font-weight:500;letter-spacing:0.7px">${s.neighborhood} · ${s.borough}</div>
      </div>

      <div style="padding:26px 44px 30px;flex:1;display:flex;flex-direction:column;justify-content:space-between">
        <div>
          <div style="font-size:50px;font-weight:700;line-height:1.1;margin-bottom:14px">${s.name}</div>
          <div style="display:flex;align-items:center;font-size:24px;color:${B.midBrown};margin-bottom:22px">${metaParts.join("")}</div>
          <div style="display:flex;gap:14px;align-items:flex-start;margin-bottom:14px">
            ${s.type ? `<div style="font-size:17px;font-weight:600;text-transform:uppercase;letter-spacing:1.2px;color:${B.saddleBrown};background:${B.warmTan};padding:6px 16px;border-radius:6px;white-space:nowrap;flex-shrink:0;margin-top:3px">${s.type}</div>` : ""}
            <div style="font-size:26px;line-height:1.45">${s.notes}</div>
          </div>
          ${s.review ? `<div style="font-size:24px;font-style:italic;color:${B.midBrown};line-height:1.5">"${s.review}"</div>` : ""}
        </div>
        ${featuredHTML}
      </div>
    </div>`;

    const exportBtn = document.getElementById("ig-export-btn");
    if (exportBtn) exportBtn.textContent = `Export "${s.name}" as 1080×1080 PNG`;
    resizePreview();
  }

  function resizePreview() {
    const wrapper = document.querySelector(".preview-wrapper") as HTMLElement | null;
    if (!wrapper) return;
    const available = wrapper.clientWidth || 600;
    const scale = Math.min(available / 1080, 1);
    const scaler = document.getElementById("ig-preview-scaler");
    if (scaler) {
      scaler.style.transform = `scale(${scale})`;
      wrapper.style.height = `${1080 * scale}px`;
    }
  }

  async function handleExport() {
    const btn = document.getElementById("ig-export-btn") as HTMLButtonElement | null;
    if (!btn) return;
    btn.disabled = true;
    btn.textContent = "Exporting...";
    try {
      const el = document.getElementById("ig-card-root")?.firstElementChild as HTMLElement;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const canvas = await (window as any).html2canvas(el, {
        scale: 1,
        useCORS: true,
        backgroundColor: B.cream,
        width: 1080,
        height: 1080,
      });
      const link = document.createElement("a");
      const s = spots.find((x) => x.id === selectedId);
      link.download = `cinnamonrolls-nyc-${s!.name.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("Export failed:", e);
    }
    const s = spots.find((x) => x.id === selectedId);
    if (btn && s) {
      btn.disabled = false;
      btn.textContent = `Export "${s.name}" as 1080×1080 PNG`;
    }
  }

  // Expose to global scope for inline onclick handlers
  (window as unknown as Record<string, unknown>).igSelectSpot = selectSpot;
  (window as unknown as Record<string, unknown>).igHandleExport = handleExport;

  // Wire up search + resize
  document.getElementById("ig-search")?.addEventListener("input", (e) =>
    renderList((e.target as HTMLInputElement).value)
  );
  window.addEventListener("resize", resizePreview);

  // Fetch and render
  fetchSpots()
    .then((rows) => {
      spots = rows.map(mapSpot);
      selectedId = spots.length > 0 ? spots[0].id : null;
      const loading = document.getElementById("ig-loading");
      const content = document.getElementById("ig-main-content");
      if (loading) loading.style.display = "none";
      if (content) content.style.display = "block";
      const statusText = document.getElementById("ig-status-text");
      if (statusText) statusText.textContent = `${spots.length} spots`;
      renderList();
      renderCard();
    })
    .catch((err) => {
      const loading = document.getElementById("ig-loading");
      if (loading)
        loading.innerHTML = `<div style="color:#a32d2d;font-size:15px;font-weight:600">Connection error</div><div style="color:${B.midBrown};font-size:13px">${err.message}</div>`;
    });
}

// ── Page component ─────────────────────────────────────────────────────────
export default function IGGeneratorPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    setAuthed(sessionStorage.getItem("ig-auth") === "1");
  }, []);

  useEffect(() => {
    if (!authed || initialized.current) return;
    initialized.current = true;

    // Inject Google Fonts
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);

    // Load html2canvas, then init
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    script.onload = () => initGenerator();
    document.head.appendChild(script);
  }, [authed]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/auth-ig", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (res.ok) {
        sessionStorage.setItem("ig-auth", "1");
        setAuthed(true);
      } else {
        setError("Incorrect password.");
      }
    } catch {
      setError("Something went wrong.");
    }
    setSubmitting(false);
  }

  // Still reading sessionStorage
  if (authed === null) return null;

  // Auth gate
  if (!authed) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: B.cream,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div
          style={{
            width: 360,
            padding: "40px 36px",
            background: "#fff",
            borderRadius: 20,
            border: `1px solid ${B.divider}`,
            boxShadow: "0 4px 24px rgba(61,28,2,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LOGO_URL}
              alt=""
              style={{ width: 36, height: 36, borderRadius: 8 }}
            />
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: B.darkBrown }}>
                IG Post Generator
              </div>
              <div style={{ fontSize: 11, color: B.accent, fontStyle: "italic" }}>
                cinnamonrolls.nyc
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: B.midBrown,
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                marginBottom: 8,
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              autoFocus
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 10,
                border: `1.5px solid ${error ? "#a32d2d" : B.divider}`,
                background: B.cream,
                fontSize: 14,
                fontFamily: "inherit",
                color: B.darkBrown,
                outline: "none",
                marginBottom: 12,
              }}
            />
            {error && (
              <div style={{ fontSize: 13, color: "#a32d2d", marginBottom: 12 }}>{error}</div>
            )}
            <button
              type="submit"
              disabled={submitting || !pw}
              style={{
                width: "100%",
                padding: "12px 0",
                background: B.darkBrown,
                color: B.cream,
                border: "none",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: submitting || !pw ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                opacity: submitting || !pw ? 0.6 : 1,
                transition: "opacity 0.15s",
              }}
            >
              {submitting ? "Checking..." : "Enter"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Generator
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GENERATOR_STYLES }} />
      <div dangerouslySetInnerHTML={{ __html: GENERATOR_HTML }} />
    </>
  );
}
