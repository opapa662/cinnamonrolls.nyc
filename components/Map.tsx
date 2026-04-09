"use client";

import { useEffect, useRef } from "react";
import type { Map as MapboxMap } from "mapbox-gl";
import type { SidebarLocation } from "@/components/Sidebar";
import { locationSlug } from "@/lib/location-slug";
import { trackEvent, debounce } from "@/lib/analytics";
import { cleanAddress } from "@/lib/address";

const HEART_FILLED = `<svg width="20" height="20" viewBox="0 0 16 16" fill="#c0392b"><path d="M8 13.5S2 9.5 2 5.5C2 3.567 3.567 2 5.5 2c1 0 1.9.45 2.5 1.15C8.6 2.45 9.5 2 10.5 2 12.433 2 14 3.567 14 5.5c0 4-6 8-6 8Z"/></svg>`;
const HEART_OUTLINE = `<svg width="20" height="20" viewBox="0 0 16 16" fill="none"><path d="M8 13.5S2 9.5 2 5.5C2 3.567 3.567 2 5.5 2c1 0 1.9.45 2.5 1.15C8.6 2.45 9.5 2 10.5 2 12.433 2 14 3.567 14 5.5c0 4-6 8-6 8Z" stroke="rgba(139,69,19,0.4)" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
const SHARE_ICON = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 1v9M5 4l3-3 3 3" stroke="#8b4513" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 8v5a1 1 0 001 1h8a1 1 0 001-1V8" stroke="#8b4513" stroke-width="1.5" stroke-linecap="round"/></svg>`;

export interface Location extends SidebarLocation {
  notes: string | null;
  website: string | null;
  instagram: string | null;
  mentions: string[] | null; // drives "Featured by" tags — publications/media only
  google_place_id: string | null;
  google_rating: number | null;
  google_hours: { weekday_text: string[] } | null;
  formatted_address: string | null;
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

function ensurePopupVisible(popup: import("mapbox-gl").Popup, map: MapboxMap) {
  // Use setTimeout so the popup is fully rendered and sized before we measure.
  setTimeout(() => {
    const popupEl = popup.getElement();
    if (!popupEl || !popup.isOpen()) return;
    const rect = popupEl.getBoundingClientRect();
    const isMobile = window.innerWidth < 768;
    const margin = 12;
    // Safe zone: below header (68px), above collapsed tray+action bar (116px) on mobile
    const safeTop    = 68 + margin;
    const safeBottom = isMobile ? window.innerHeight - 148 - margin : window.innerHeight - 36 - margin;
    const safeLeft   = margin;
    const safeRight  = window.innerWidth - margin;
    let panX = 0;
    let panY = 0;
    if (rect.bottom > safeBottom) panY = rect.bottom - safeBottom;
    else if (rect.top < safeTop)  panY = rect.top - safeTop;
    if (rect.right > safeRight)   panX = rect.right - safeRight;
    else if (rect.left < safeLeft) panX = rect.left - safeLeft;
    if (panX !== 0 || panY !== 0) map.panBy([panX, panY], { duration: 200 });
  }, 80);
}

function createPinElement(): HTMLElement {
  const el = document.createElement("div");
  el.style.cssText =
    "width:42px;height:42px;cursor:pointer;display:flex;align-items:center;justify-content:center;";
  const img = document.createElement("img");
  img.src = "/icon.png";
  img.alt = "";
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

  const mapsUrlForAddress = loc.google_place_id
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.name)}&query_place_id=${loc.google_place_id}`
    : null;
  const cleanedAddress = loc.formatted_address ? cleanAddress(loc.formatted_address) : null;
  const addressHTML = cleanedAddress
    ? `<div style="margin-top:8px;font-size:12px;color:#7a5230;">${
        mapsUrlForAddress
          ? `<a href="${mapsUrlForAddress}" target="_blank" rel="noopener" style="color:inherit;text-decoration:none;outline:none;">📍 ${cleanedAddress}</a>`
          : `📍 ${cleanedAddress}`
      }</div>`
    : "";

  // Roll style + dietary badges
  const dietaryBadges: string[] = [];
  if (loc.gluten_free) dietaryBadges.push("GF");
  if (loc.dairy_free) dietaryBadges.push("DF");
  if (loc.vegan) dietaryBadges.push("Vegan");
  const rollBadgesHTML = (loc.roll_style || dietaryBadges.length > 0)
    ? `<div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:8px;">
        ${loc.roll_style ? `<span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px;background:#fff8ed;color:#8B4513;border:1px solid rgba(139,69,19,0.2);">${loc.roll_style}</span>` : ""}
        ${dietaryBadges.map((b) => `<span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px;background:#f0fdf4;color:#15803d;border:1px solid rgba(21,128,61,0.2);">${b}</span>`).join("")}
      </div>`
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

  const saveBtn = `<button class="cr-popup-save" data-id="${loc.id}" aria-label="${saved ? "Remove from saved" : "Save"}" style="background:none;border:none;cursor:pointer;padding:4px;flex-shrink:0;line-height:1;margin-top:-2px;outline:none;">${saved ? HEART_FILLED : HEART_OUTLINE}</button>`;

  return `<div style="padding:16px 18px;min-width:240px;max-width:300px;font-family:'Inter',sans-serif;">
    ${sub ? `<div style="font-size:10px;font-weight:600;color:#9C6B3C;letter-spacing:0.06em;margin-bottom:4px;">${sub}</div>` : ""}
    <div style="display:flex;align-items:flex-start;gap:6px;">
      <div style="font-size:20px;font-weight:700;color:#1a0a00;line-height:1.2;flex:1;">${displayName}</div>
      ${saveBtn}
    </div>
    ${metaHTML}
    ${rollBadgesHTML}
    ${addressHTML}
    ${loc.notes ? `<div style="margin-top:10px;font-size:13px;color:#5a3a1a;line-height:1.6;">${loc.notes}</div>` : ""}
    ${featuredHTML}
    ${linksHTML}
    <div style="margin-top:12px;padding-top:10px;border-top:1px solid rgba(139,69,19,0.1);display:flex;align-items:center;justify-content:space-between;">
      <a href="/locations/${locationSlug(loc.name)}" style="font-size:12px;font-weight:600;color:#8B4513;text-decoration:none;">View details →</a>
      <button class="cr-popup-share" data-url="https://cinnamonrolls.nyc/locations/${locationSlug(loc.name)}" data-title="${displayName} - cinnamonrolls.nyc" aria-label="Share" style="background:none;border:none;cursor:pointer;padding:4px;line-height:1;display:flex;align-items:center;gap:5px;font-size:12px;color:#8B4513;font-weight:600;outline:none;">${SHARE_ICON} Share</button>
    </div>
  </div>`;
}

interface MapProps {
  locations: Location[];
  filteredIds?: Set<string> | null;
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

export default function Map({ locations, filteredIds, onMapReady, onPinClick, savedIds, onToggleSave }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const initializedRef = useRef(false);
  const markersRef = useRef<globalThis.Map<string, import("mapbox-gl").Marker>>(new globalThis.Map());
  const popupsRef = useRef<globalThis.Map<string, import("mapbox-gl").Popup>>(new globalThis.Map());
  const userMarkerRef = useRef<import("mapbox-gl").Marker | null>(null);
  const locationsMapRef = useRef<globalThis.Map<string, Location>>(new globalThis.Map());
  const popupOpenTimesRef = useRef<globalThis.Map<string, number>>(new globalThis.Map());
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

      const mapLoadStart = Date.now();

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

      // Delegated click handler for popup share buttons
      containerRef.current?.addEventListener("click", (e) => {
        const btn = (e.target as Element).closest<HTMLElement>(".cr-popup-share");
        if (!btn) return;
        e.stopPropagation();
        const url = btn.dataset.url ?? "";
        const title = btn.dataset.title ?? "";
        if (navigator.share && navigator.canShare?.({ url, title })) {
          navigator.share({ url, title }).catch(() => {});
        } else {
          navigator.clipboard.writeText(url).then(() => {
            btn.textContent = "Copied!";
            setTimeout(() => { btn.innerHTML = `${SHARE_ICON} Share`; }, 2000);
          }).catch(() => {});
        }
      });

      map.on("error", (e) => {
        trackEvent("map_style_error", { error_message: e.error?.message ?? "unknown map error" });
      });

      map.on("load", () => {
        trackEvent("map_loaded", { load_time_ms: Date.now() - mapLoadStart });

        if (!locations?.length) return;

        // Debounced zoom tracking
        let lastZoom = map.getZoom();
        map.on("zoomend", debounce(() => {
          const newZoom = map.getZoom();
          trackEvent("map_zoomed", {
            zoom_level: Math.round(newZoom * 10) / 10,
            zoom_direction: newZoom > lastZoom ? "in" : "out",
          });
          lastZoom = newZoom;
        }, 500));

        // Debounced pan tracking
        map.on("moveend", debounce(() => {
          const center = map.getCenter();
          trackEvent("map_panned", {
            center_lat: Math.round(center.lat * 10000) / 10000,
            center_lng: Math.round(center.lng * 10000) / 10000,
          });
        }, 1000));

        // Debounced bounds change tracking
        map.on("moveend", debounce(() => {
          const b = map.getBounds();
          if (!b) return;
          const ne = b.getNorthEast();
          const sw = b.getSouthWest();
          const visiblePinCount = locations.filter((loc) => {
            const m = markersRef.current.get(loc.id);
            return m && m.getLngLat && b.contains(m.getLngLat());
          }).length;
          trackEvent("map_bounds_changed", {
            ne_lat: Math.round(ne.lat * 10000) / 10000,
            ne_lng: Math.round(ne.lng * 10000) / 10000,
            sw_lat: Math.round(sw.lat * 10000) / 10000,
            sw_lng: Math.round(sw.lng * 10000) / 10000,
            visible_pin_count: visiblePinCount,
          });
        }, 1000));

        // Delegated popup link clicks
        containerRef.current?.addEventListener("click", (e) => {
          const link = (e.target as Element).closest<HTMLAnchorElement>(".cr-popup a[href]");
          if (!link) return;
          const href = link.href;
          let linkType: "instagram" | "directions" | "website" | "other" = "other";
          if (href.includes("instagram.com")) linkType = "instagram";
          else if (href.includes("google.com/maps")) linkType = "directions";
          else if (!href.includes(window.location.hostname)) linkType = "website";
          let bakeryId = "";
          let bakeryName = "";
          popupsRef.current.forEach((p, id) => {
            if (p.isOpen()) {
              bakeryId = id;
              bakeryName = locationsMapRef.current.get(id)?.name ?? "";
            }
          });
          trackEvent("popup_link_clicked", { bakery_id: bakeryId, bakery_name: bakeryName, link_type: linkType, destination_url: href });
        });

        const bounds = new mapboxgl.LngLatBounds();

        locations.forEach((loc) => {
          locationsMapRef.current.set(loc.id, loc);
          bounds.extend([loc.longitude, loc.latitude]);

          const popup = new mapboxgl.Popup({
            offset: 30,
            closeButton: false,
            maxWidth: "300px",
            className: "cr-popup",
          }).setHTML(createPopupHTML(loc));

          popup.on("open", () => {
            popupOpenTimesRef.current.set(loc.id, Date.now());
            trackEvent("popup_opened", { bakery_id: loc.id, bakery_name: loc.name });
          });
          popup.on("close", () => {
            const openTime = popupOpenTimesRef.current.get(loc.id);
            if (openTime) {
              trackEvent("popup_closed", { bakery_id: loc.id, bakery_name: loc.name, time_open_ms: Date.now() - openTime });
              popupOpenTimesRef.current.delete(loc.id);
            }
          });

          const el = createPinElement();
          const marker = new mapboxgl.Marker({ element: el })
            .setLngLat([loc.longitude, loc.latitude])
            .addTo(map);

          el.addEventListener("click", () => {
            onPinClick?.(loc.id);
            trackEvent("pin_clicked", { bakery_id: loc.id, bakery_name: loc.name, pin_lat: loc.latitude, pin_lng: loc.longitude });
            const isMobile = window.innerWidth < 768;
            map.flyTo({
              center: [loc.longitude, loc.latitude],
              zoom: 14,
              duration: 600,
              offset: isMobile ? [0, 110] : [0, -100],
            });
            setTimeout(() => {
              popupsRef.current.forEach((p) => { if (p.isOpen()) p.remove(); });
              popup.setHTML(createPopupHTML(loc, savedIdsRef.current.has(loc.id)));
              popup.setLngLat([loc.longitude, loc.latitude]).addTo(map);
              ensurePopupVisible(popup, map);
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
            ensurePopupVisible(popup, map);
          }
        };

        // Close any open popup when the user clicks the map background
        map.on("click", () => {
          popupsRef.current.forEach((p) => { if (p.isOpen()) p.remove(); });
        });

        // On mobile, close popup when the user starts panning the map
        map.on("dragstart", () => {
          if (window.innerWidth < 768) {
            popupsRef.current.forEach((p) => { if (p.isOpen()) p.remove(); });
          }
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

  // Show/hide markers when filteredIds changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((marker, id) => {
      if (!filteredIds || filteredIds.has(id)) {
        if (!marker.getLngLat) return; // safety
        marker.addTo(map);
      } else {
        marker.remove();
        // close popup if its pin was hidden
        const popup = popupsRef.current.get(id);
        if (popup?.isOpen()) popup.remove();
      }
    });
  }, [filteredIds]);

  return <div ref={containerRef} role="application" aria-label="Interactive map of NYC cinnamon roll spots" style={{ position: "absolute", inset: 0 }} />;
}
