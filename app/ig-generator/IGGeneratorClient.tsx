"use client";

import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";

const LOGO_URL = "/icon.png";

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

export interface Spot {
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

function IGCard({ spot }: { spot: Spot }) {
  const metaParts: React.ReactNode[] = [];

  if (spot.rating) {
    metaParts.push(
      <span key="star" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <span style={{ color: B.accent, fontSize: 26 }}>★</span>
        <span style={{ fontWeight: 600, color: B.darkBrown, marginRight: 4 }}>{spot.rating}</span>
        {spot.review_count && (
          <span style={{ fontSize: 22, color: B.midBrown }}>({spot.review_count.toLocaleString()})</span>
        )}
      </span>
    );
  }

  if (spot.hours) {
    if (metaParts.length > 0) {
      metaParts.push(
        <span key="divider" style={{ margin: "0 18px", color: B.divider, fontWeight: 300 }}>|</span>
      );
    }
    metaParts.push(
      <span key="hours" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <svg viewBox="0 0 20 20" style={{ width: 22, height: 22, flexShrink: 0 }}>
          <circle cx="10" cy="10" r="8" fill="none" stroke={B.midBrown} strokeWidth="1.5" />
          <path d="M10 6V10L13 13" fill="none" stroke={B.midBrown} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span>{spot.hours}</span>
      </span>
    );
  }

  return (
    <div
      style={{
        width: 1080,
        height: 1080,
        background: B.cream,
        fontFamily: "Inter, system-ui, sans-serif",
        color: B.darkBrown,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: B.darkBrown,
          padding: "14px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LOGO_URL}
            alt=""
            crossOrigin="anonymous"
            style={{ width: 46, height: 46, borderRadius: 10, objectFit: "cover" }}
          />
          <div
            style={{ fontWeight: 600, fontSize: 23, color: B.cream, letterSpacing: "0.8px" }}
          >
            cinnamonrolls.nyc
          </div>
        </div>
        <div
          style={{
            fontSize: 20,
            color: B.accent,
            fontStyle: "italic",
            whiteSpace: "nowrap",
            letterSpacing: "0.3px",
          }}
        >
          the ultimate map of the city&apos;s best swirls
        </div>
      </div>

      {/* Photo */}
      <div
        style={{
          width: "100%",
          height: 510,
          background: B.photoBg,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {spot.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={spot.photo_url}
            alt=""
            crossOrigin="anonymous"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              color: B.midBrown,
              fontSize: 22,
              opacity: 0.5,
            }}
          >
            <svg viewBox="0 0 48 48" style={{ width: 80, height: 80 }}>
              <rect x="6" y="10" width="36" height="28" rx="4" fill="none" stroke={B.midBrown} strokeWidth="1.8" />
              <circle cx="18" cy="22" r="4" fill="none" stroke={B.midBrown} strokeWidth="1.5" />
              <path d="M6 34 L18 26 L26 32 L34 24 L42 30 L42 38 L6 38Z" fill={B.midBrown} opacity={0.15} />
            </svg>
            Cinnamon roll photo
          </div>
        )}
        <div
          style={{
            position: "absolute",
            bottom: 18,
            left: 28,
            background: "rgba(61,28,2,0.82)",
            color: B.cream,
            padding: "8px 22px",
            borderRadius: 40,
            fontSize: 26,
            fontWeight: 500,
            letterSpacing: "0.7px",
          }}
        >
          {spot.neighborhood} · {spot.borough}
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          padding: "26px 44px 30px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minHeight: 0,
        }}
      >
        <div>
          <div
            style={{ fontSize: 50, fontWeight: 700, lineHeight: 1.1, marginBottom: 22 }}
          >
            {spot.name}
          </div>
          {metaParts.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: 24,
                color: B.midBrown,
                marginBottom: 32,
              }}
            >
              {metaParts}
            </div>
          )}
          <div
            style={{
              display: "flex",
              gap: 14,
              alignItems: "flex-start",
              marginBottom: spot.review ? 14 : 0,
            }}
          >
            {spot.type && (
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "1.2px",
                  color: B.saddleBrown,
                  background: B.warmTan,
                  padding: "6px 16px",
                  borderRadius: 6,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  marginTop: 3,
                }}
              >
                {spot.type}
              </div>
            )}
            <div style={{ fontSize: 26, lineHeight: 1.45 }}>{spot.notes}</div>
          </div>
          {spot.review && (
            <div
              style={{
                fontSize: 24,
                fontStyle: "italic",
                color: B.midBrown,
                lineHeight: 1.5,
              }}
            >
              &ldquo;{spot.review.replace(/^[""'"]+|[""'"]+$/g, "").trim()}&rdquo;
            </div>
          )}
        </div>

        {spot.featured_by && spot.featured_by.length > 0 && (
          <div>
            <div style={{ height: 1.5, background: B.divider, marginBottom: 18 }} />
            <div
              style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}
            >
              <div
                style={{
                  fontSize: 16,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  color: B.lightBrown,
                  fontWeight: 500,
                }}
              >
                Featured by
              </div>
              {spot.featured_by.map((m) => (
                <div
                  key={m}
                  style={{
                    display: "inline-flex",
                    fontSize: 22,
                    fontWeight: 600,
                    color: B.saddleBrown,
                    background: B.featuredBg,
                    padding: "8px 24px",
                    borderRadius: 40,
                  }}
                >
                  {m}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function IGGeneratorClient({ spots }: { spots: Spot[] }) {
  const [selectedId, setSelectedId] = useState(spots[0]?.id ?? "");
  const [exporting, setExporting] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const selectedSpot = spots.find((s) => s.id === selectedId) ?? spots[0] ?? null;

  // Scale the preview card to fit the container
  useEffect(() => {
    function resize() {
      if (!wrapperRef.current || !previewRef.current) return;
      const w = wrapperRef.current.clientWidth;
      if (w === 0) return;
      const scale = w / 1080;
      previewRef.current.style.transform = `scale(${scale})`;
      previewRef.current.style.transformOrigin = "top left";
      wrapperRef.current.style.height = `${1080 * scale}px`;
    }
    resize();
    // Small delay for initial layout
    const t = setTimeout(resize, 100);
    window.addEventListener("resize", resize);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", resize);
    };
  }, []);

  async function handleExport() {
    if (!selectedSpot || !exportRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(exportRef.current, {
        width: 1080,
        height: 1080,
        pixelRatio: 1,
        skipFonts: false,
      });
      const a = document.createElement("a");
      const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      a.download = `${slug(selectedSpot.name)}-${slug(selectedSpot.neighborhood)}-ig.png`;
      a.href = dataUrl;
      a.click();
    } catch (e) {
      console.error("Export failed:", e);
      alert("Export failed — check the console for details.");
    } finally {
      setExporting(false);
    }
  }

  if (spots.length === 0) {
    return (
      <div style={{ padding: 40, color: B.midBrown, fontFamily: "Inter, sans-serif" }}>
        No spots found.
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: B.cream, fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Top bar */}
      <div
        style={{
          background: B.darkBrown,
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_URL} alt="" style={{ width: 36, height: 36, borderRadius: 8 }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 16, color: B.cream }}>IG Post Generator</div>
            <div style={{ fontSize: 11, color: B.accent, fontStyle: "italic" }}>cinnamonrolls.nyc</div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            color: B.accent,
            background: "rgba(212,144,74,0.12)",
            padding: "5px 12px",
            borderRadius: 20,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
          {spots.length} spots
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 32px 48px" }}>
        {/* Dropdown */}
        <div style={{ marginBottom: 20 }}>
          <label
            htmlFor="spot-select"
            style={{ display: "block", fontSize: 12, fontWeight: 600, color: B.midBrown, marginBottom: 8, textTransform: "uppercase", letterSpacing: "1px" }}
          >
            Select spot
          </label>
          <select
            id="spot-select"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              border: `1.5px solid ${B.divider}`,
              borderRadius: 10,
              background: "#fff",
              fontSize: 15,
              fontFamily: "inherit",
              color: B.darkBrown,
              outline: "none",
              cursor: "pointer",
              appearance: "auto",
            }}
          >
            {spots.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.neighborhood}, {s.borough}
              </option>
            ))}
          </select>
        </div>

        {/* Preview */}
        <div
          ref={wrapperRef}
          style={{
            borderRadius: 16,
            overflow: "hidden",
            border: `1px solid ${B.divider}`,
            marginBottom: 16,
            background: B.cream,
          }}
        >
          <div ref={previewRef} style={{ width: 1080, height: 1080 }}>
            {selectedSpot && <IGCard spot={selectedSpot} />}
          </div>
        </div>

        {/* Export button */}
        <button
          onClick={handleExport}
          disabled={exporting || !selectedSpot}
          style={{
            width: "100%",
            padding: "14px 0",
            background: exporting ? B.midBrown : B.darkBrown,
            color: B.cream,
            border: "none",
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 600,
            cursor: exporting ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            letterSpacing: "0.5px",
            transition: "background 0.2s",
          }}
        >
          {exporting
            ? "Exporting..."
            : `Export "${selectedSpot?.name}" as 1080×1080 PNG`}
        </button>
      </div>

      {/* Hidden full-size card for export — off-screen, not scaled */}
      <div
        style={{
          position: "fixed",
          left: -2000,
          top: 0,
          pointerEvents: "none",
          zIndex: -1,
        }}
      >
        <div ref={exportRef} style={{ width: 1080, height: 1080 }}>
          {selectedSpot && <IGCard spot={selectedSpot} />}
        </div>
      </div>
    </div>
  );
}
