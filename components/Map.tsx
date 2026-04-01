"use client";

import { useEffect, useRef } from "react";
import type { Map as MapboxMap } from "mapbox-gl";
import type { SidebarLocation } from "@/components/Sidebar";

const HEART_FILLED = `<svg width="20" height="20" viewBox="0 0 16 16" fill="#c0392b"><path d="M8 13.5S2 9.5 2 5.5C2 3.567 3.567 2 5.5 2c1 0 1.9.45 2.5 1.15C8.6 2.45 9.5 2 10.5 2 12.433 2 14 3.567 14 5.5c0 4-6 8-6 8Z"/></svg>`;
const HEART_OUTLINE = `<svg width="20" height="20" viewBox="0 0 16 16" fill="none"><path d="M8 13.5S2 9.5 2 5.5C2 3.567 3.567 2 5.5 2c1 0 1.9.45 2.5 1.15C8.6 2.45 9.5 2 10.5 2 12.433 2 14 3.567 14 5.5c0 4-6 8-6 8Z" stroke="rgba(139,69,19,0.4)" stroke-width="1.5" stroke-linejoin="round"/></svg>`;

export interface Location extends SidebarLocation {
  notes: string | null;
  website: string | null;
  instagram: string | null;
  mentions: string[] | null; // drives "Featured by" tags — publications/media only
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

function createPopupHTML(loc: Location, saved = false): string {
  const displayName = loc.name;
  const sub = [loc.neighborhood, loc.borough].filter(Boolean).join(" · ").toUpperCase();
  const openDays = loc.google_hours?.weekday_text ? formatOpenDays(loc.google_hours.weekday_text) : null;

  const metaParts: string[] = [];
  if (loc.location_type) metaParts.push(`<span style="white-space:nowrap;">${loc.location_type}</span>`);
  if (loc.google_rating) {
    const ratingStr = loc.google_rating.toFixed(1);
    const mapsUrl = loc.google_place_id
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.name)}&query_place_id=${loc.google_place_id}`
      : null;
    const ratingHTML = mapsUrl
      ? `<a href="${mapsUrl}" target="_blank" rel="noopener" style="color:inherit;text-decoration:none;outline:none;white-space:nowrap;">⭐ ${ratingStr}</a>`
      : `⭐ ${ratingStr}`;
    metaParts.push(`<span style="color:rgba(100,60,20,0.3);">|</span><span style="white-space:nowrap;">${ratingHTML}</span>`);
  }
  if (openDays) metaParts.push(`<span style="color:rgba(100,60,20,0.3);">|</span><span style="white-space:nowrap;">${openDays}</span>`);
  const metaHTML = metaParts.length
    ? `<div style="display:flex;align-items:center;gap:6px;margin-top:6px;font-size:13px;color:#5a3a1a;flex-wrap:wrap;">${metaParts.join("")}</div>`
    : "";

  const sources = (loc.mentions ?? []).filter(Boolean);
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

  const saveBtn = `<button class="cr-popup-save" data-id="${loc.id}" style="background:none;border:none;cursor:pointer;padding:4px;flex-shrink:0;line-height:1;margin-top:-2px;">${saved ? HEART_FILLED : HEART_OUTLINE}</button>`;

  return `<div style="padding:16px 18px;min-width:240px;max-width:300px;font-family:'Inter',sans-serif;">
    ${sub ? `<div style="font-size:10px;font-weight:600;color:#9C6B3C;letter-spacing:0.06em;margin-bottom:4px;">${sub}</div>` : ""}
    <div style="display:flex;align-items:flex-start;gap:6px;">
      <div style="font-size:20px;font-weight:700;color:#1a0a00;line-height:1.2;flex:1;">${displayName}</div>
      ${saveBtn}
    </div>
    ${metaHTML}
    ${loc.notes ? `<div style="margin-top:10px;font-size:13px;color:#5a3a1a;line-height:1.6;">${loc.notes}</div>` : ""}
    ${featuredHTML}
    ${linksHTML}
  </div>`;
}

interface MapProps {
  locations: Location[];
  onPinClick?: (id: string) => void;
  savedIds?: Set<string>;
  onToggleSave?: (id: string) => void;
  onMapReady?: (
    map: MapboxMap,
    fitAll: () => void,
    showPopup: (id: string) => void,
    setUserMarker: (lat: number, lng: number) => void,
    clearUserMarker: () => void,
  ) => void;
}

export default function Map({ locations, onMapReady, onPinClick, savedIds, onToggleSave }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const initializedRef = useRef(false);
  const markersRef = useRef<globalThis.Map<string, import("mapbox-gl").Marker>>(new globalThis.Map());
  const popupsRef = useRef<globalThis.Map<string, import("mapbox-gl").Popup>>(new globalThis.Map());
  const userMarkerRef = useRef<import("mapbox-gl").Marker | null>(null);
  const locationsMapRef = useRef<globalThis.Map<string, Location>>(new globalThis.Map());
  const savedIdsRef = useRef<Set<string>>(new Set());
  savedIdsRef.current = savedIds ?? new Set();
  const onToggleSaveRef = useRef(onToggleSave);
  onToggleSaveRef.current = onToggleSave;

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

      // Delegated click handler for popup save buttons
      containerRef.current?.addEventListener("click", (e) => {
        const btn = (e.target as Element).closest<HTMLElement>(".cr-popup-save");
        if (!btn) return;
        e.stopPropagation();
        const id = btn.dataset.id;
        if (!id) return;
        const wasSaved = savedIdsRef.current.has(id);
        onToggleSaveRef.current?.(id);
        btn.innerHTML = wasSaved ? HEART_OUTLINE : HEART_FILLED;
      });

      map.on("load", () => {
        if (!locations?.length) return;

        const bounds = new mapboxgl.LngLatBounds();

        locations.forEach((loc) => {
          locationsMapRef.current.set(loc.id, loc);
          bounds.extend([loc.longitude, loc.latitude]);

          const popup = new mapboxgl.Popup({
            offset: 50,
            closeButton: false,
            maxWidth: "300px",
            className: "cr-popup",
          }).setHTML(createPopupHTML(loc));

          const el = createPinElement();
          const marker = new mapboxgl.Marker({ element: el })
            .setLngLat([loc.longitude, loc.latitude])
            .addTo(map);

          el.addEventListener("click", () => {
            onPinClick?.(loc.id);
            map.flyTo({ center: [loc.longitude, loc.latitude], zoom: 14, duration: 600 });
            setTimeout(() => {
              popupsRef.current.forEach((p) => { if (p.isOpen()) p.remove(); });
              popup.setHTML(createPopupHTML(loc, savedIdsRef.current.has(loc.id)));
              popup.setLngLat([loc.longitude, loc.latitude]).addTo(map);
            }, 650);
          });

          markersRef.current.set(loc.id, marker);
          popupsRef.current.set(loc.id, popup);
        });

        const isMobile = window.innerWidth < 768;
        const mobilePadding = isMobile
          ? { top: 80, bottom: 240, left: 40, right: 40 }
          : { top: 80, bottom: 80, left: 80, right: 80 };

        const fitAll = () => {
          map.resize();
          map.fitBounds(bounds, { padding: mobilePadding, maxZoom: 14, duration: 600 });
        };

        map.resize();
        map.fitBounds(bounds, { padding: mobilePadding, maxZoom: 14, duration: 0 });

        const showPopup = (id: string) => {
          popupsRef.current.forEach((p) => { if (p.isOpen()) p.remove(); });
          const popup = popupsRef.current.get(id);
          const marker = markersRef.current.get(id);
          const loc = locationsMapRef.current.get(id);
          if (popup && marker) {
            if (loc) popup.setHTML(createPopupHTML(loc, savedIdsRef.current.has(id)));
            popup.setLngLat(marker.getLngLat()).addTo(map);
          }
        };

        // Close any open popup when the user clicks the map background
        map.on("click", () => {
          popupsRef.current.forEach((p) => { if (p.isOpen()) p.remove(); });
        });

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
