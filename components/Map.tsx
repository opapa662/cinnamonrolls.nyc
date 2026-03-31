"use client";

import { useEffect, useRef } from "react";
import type { Map as MapboxMap } from "mapbox-gl";
import type { SidebarLocation } from "@/components/Sidebar";

export interface Location extends SidebarLocation {
  notes: string | null;
  website: string | null;
  instagram: string | null;
  source: string | null;
  google_place_id: string | null;
  google_rating: number | null;
  google_hours: { weekday_text: string[] } | null;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_SHORT: Record<string, string> = {
  Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu",
  Friday: "Fri", Saturday: "Sat", Sunday: "Sun",
};

function formatOpenDays(weekdayText: string[]): string | null {
  const openDays = DAYS.filter((day) => {
    const entry = weekdayText.find((t) => t.startsWith(day));
    return entry && !entry.includes("Closed");
  });
  if (openDays.length === 0) return null;
  if (openDays.length === 7) return "Open daily";

  // Check if it's a single consecutive range
  const indices = openDays.map((d) => DAYS.indexOf(d));
  const isConsecutive = indices.every((idx, i) => i === 0 || idx === indices[i - 1] + 1);
  if (isConsecutive) {
    return openDays.length === 1
      ? `${DAY_SHORT[openDays[0]]}s only`
      : `${DAY_SHORT[openDays[0]]} – ${DAY_SHORT[openDays[openDays.length - 1]]}`;
  }

  // Non-consecutive: list abbreviated
  return openDays.map((d) => DAY_SHORT[d]).join(", ");
}

function createPinElement(): HTMLElement {
  const el = document.createElement("div");
  el.style.cssText =
    "width:42px;height:42px;cursor:pointer;display:flex;align-items:center;justify-content:center;";
  const img = document.createElement("img");
  img.src = "/icon.png";
  img.style.cssText = "width:32px;height:32px;object-fit:contain;";
  el.appendChild(img);
  return el;
}

function createPopupHTML(loc: Location): string {
  const displayName = loc.name;
  const sub = [loc.neighborhood, loc.borough].filter(Boolean).join(" · ").toUpperCase();
  const openDays = loc.google_hours?.weekday_text ? formatOpenDays(loc.google_hours.weekday_text) : null;

  const metaParts: string[] = [];
  if (loc.location_type) metaParts.push(`<span>${loc.location_type}</span>`);
  if (loc.google_rating) {
    const ratingStr = loc.google_rating.toFixed(1);
    const mapsUrl = loc.google_place_id
      ? `https://www.google.com/maps/place/?q=place_id:${loc.google_place_id}`
      : null;
    const ratingHTML = mapsUrl
      ? `<a href="${mapsUrl}" target="_blank" rel="noopener" style="color:inherit;text-decoration:none;outline:none;">⭐ ${ratingStr}</a>`
      : `⭐ ${ratingStr}`;
    metaParts.push(`<span style="color:rgba(100,60,20,0.3);">|</span><span>${ratingHTML}</span>`);
  }
  if (openDays) metaParts.push(`<span style="color:rgba(100,60,20,0.3);">|</span><span>${openDays}</span>`);
  const metaHTML = metaParts.length
    ? `<div style="display:flex;align-items:center;gap:6px;margin-top:6px;font-size:13px;color:#5a3a1a;">${metaParts.join("")}</div>`
    : "";

  const sources = (loc.source ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const featuredHTML = sources.length
    ? `<div style="margin-top:12px;">
        <div style="font-size:11px;color:#9C6B3C;margin-bottom:5px;">Featured by</div>
        <div style="display:flex;gap:5px;flex-wrap:wrap;">
          ${sources.map((s) => `<span style="font-size:12px;font-weight:600;padding:3px 10px;border-radius:20px;background:#fff8ed;color:#8B4513;border:1px solid rgba(139,69,19,0.25);">${s}</span>`).join("")}
        </div>
      </div>`
    : "";

  const globeIcon = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" style="flex-shrink:0" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="6.5" stroke="#3b6fc4" stroke-width="1.3"/><ellipse cx="8" cy="8" rx="2.5" ry="6.5" stroke="#3b6fc4" stroke-width="1.3"/><line x1="1.5" y1="6" x2="14.5" y2="6" stroke="#3b6fc4" stroke-width="1.3"/><line x1="1.5" y1="10" x2="14.5" y2="10" stroke="#3b6fc4" stroke-width="1.3"/></svg>`;
  const igIcon = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" style="flex-shrink:0" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="12" height="12" rx="3.5" stroke="#3b6fc4" stroke-width="1.3"/><circle cx="8" cy="8" r="2.8" stroke="#3b6fc4" stroke-width="1.3"/><circle cx="11.5" cy="4.5" r="0.7" fill="#3b6fc4"/></svg>`;

  const linksHTML = loc.website || loc.instagram
    ? `<div style="margin-top:12px;padding-top:12px;border-top:1px solid rgba(139,69,19,0.12);display:flex;gap:16px;flex-wrap:wrap;align-items:center;">
        ${loc.website ? `<a href="${loc.website}" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:5px;font-size:13px;color:#3b6fc4;text-decoration:none;font-weight:500;outline:none;">${globeIcon}Website</a>` : ""}
        ${loc.instagram ? `<a href="https://instagram.com/${loc.instagram.replace(/^@/, "")}" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:5px;font-size:13px;color:#3b6fc4;text-decoration:none;font-weight:500;outline:none;">@${loc.instagram.replace(/^@/, "")}</a>` : ""}
      </div>`
    : "";

  return `<div style="padding:16px 18px;min-width:220px;max-width:280px;font-family:'Inter',sans-serif;">
    ${sub ? `<div style="font-size:10px;font-weight:600;color:#9C6B3C;letter-spacing:0.06em;margin-bottom:4px;">${sub}</div>` : ""}
    <div style="font-size:20px;font-weight:700;color:#1a0a00;line-height:1.2;">${displayName}</div>
    ${metaHTML}
    ${loc.notes ? `<div style="margin-top:10px;font-size:13px;color:#5a3a1a;line-height:1.6;">${loc.notes}</div>` : ""}
    ${featuredHTML}
    ${linksHTML}
  </div>`;
}

interface MapProps {
  locations: Location[];
  onMapReady?: (
    map: MapboxMap,
    fitAll: () => void,
    showPopup: (id: string) => void,
    setUserMarker: (lat: number, lng: number) => void,
    clearUserMarker: () => void,
  ) => void;
}

export default function Map({ locations, onMapReady }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const initializedRef = useRef(false);
  const markersRef = useRef<globalThis.Map<string, import("mapbox-gl").Marker>>(new globalThis.Map());
  const userMarkerRef = useRef<import("mapbox-gl").Marker | null>(null);

  useEffect(() => {
    if (initializedRef.current || !containerRef.current) return;
    initializedRef.current = true;

    async function init() {
      const mapboxgl = (await import("mapbox-gl")).default;
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

      if (!containerRef.current) return;

      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [-73.97, 40.73],
        zoom: 11,
        attributionControl: false,
      });

      map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");
      mapRef.current = map;

      map.on("load", () => {
        if (!locations?.length) return;

        const bounds = new mapboxgl.LngLatBounds();

        locations.forEach((loc) => {
          bounds.extend([loc.longitude, loc.latitude]);

          const popup = new mapboxgl.Popup({
            offset: 25,
            closeButton: false,
            maxWidth: "280px",
            className: "cr-popup",
          }).setHTML(createPopupHTML(loc));

          const el = createPinElement();
          el.addEventListener("click", () => {
            map.flyTo({ center: [loc.longitude, loc.latitude], zoom: 14, duration: 600 });
          });

          const marker = new mapboxgl.Marker({ element: el })
            .setLngLat([loc.longitude, loc.latitude])
            .setPopup(popup)
            .addTo(map);

          markersRef.current.set(loc.id, marker);
        });

        const fitAll = () => {
          map.resize();
          map.fitBounds(bounds, { padding: 80, maxZoom: 14, duration: 600 });
        };

        map.resize();
        map.fitBounds(bounds, { padding: 80, maxZoom: 14, duration: 0 });

        const showPopup = (id: string) => {
          // Close any currently open popup first
          markersRef.current.forEach((m) => {
            if (m.getPopup()?.isOpen()) m.togglePopup();
          });
          const marker = markersRef.current.get(id);
          if (marker) marker.togglePopup();
        };

        const setUserMarker = (lat: number, lng: number) => {
          userMarkerRef.current?.remove();
          const el = document.createElement("div");
          el.style.cssText = [
            "width:18px;height:18px;border-radius:50%",
            "background:#4a8fe2;border:3px solid #fff",
            "box-shadow:0 0 0 3px rgba(74,143,226,0.35),0 2px 6px rgba(0,0,0,0.2)",
          ].join(";");
          userMarkerRef.current = new mapboxgl.Marker({ element: el })
            .setLngLat([lng, lat])
            .addTo(map);
        };

        const clearUserMarker = () => {
          userMarkerRef.current?.remove();
          userMarkerRef.current = null;
        };

        onMapReady?.(map, fitAll, showPopup, setUserMarker, clearUserMarker);
      });
    }

    init();

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />;
}
