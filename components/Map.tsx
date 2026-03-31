"use client";

import { useEffect, useRef } from "react";
import type { Map as MapboxMap } from "mapbox-gl";
import type { SidebarLocation } from "@/components/Sidebar";

export interface Location extends SidebarLocation {
  notes: string | null;
  website: string | null;
  instagram: string | null;
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
  const sub = [loc.neighborhood, loc.borough].filter(Boolean).join(" · ");

  const linksHTML =
    loc.website || loc.instagram
      ? `<div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(139,69,19,0.1);display:flex;gap:12px;flex-wrap:wrap;">
          ${loc.website ? `<a href="${loc.website}" target="_blank" rel="noopener" style="font-size:12px;color:#8B4513;text-decoration:none;font-weight:500;outline:none;">🌐 Website</a>` : ""}
          ${loc.instagram ? `<a href="https://instagram.com/${loc.instagram.replace(/^@/, "")}" target="_blank" rel="noopener" style="font-size:12px;color:#8B4513;text-decoration:none;font-weight:500;outline:none;">📸 @${loc.instagram.replace(/^@/, "")}</a>` : ""}
        </div>`
      : "";

  return `<div style="padding:14px 16px;min-width:200px;max-width:260px;font-family:-apple-system,sans-serif;">
    <div style="font-size:15px;font-weight:700;color:#3D1C02;line-height:1.3;">${displayName}</div>
    ${sub ? `<div style="margin-top:3px;font-size:12px;color:#9C6B3C;">${sub}</div>` : ""}
    ${loc.notes ? `<div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(139,69,19,0.1);font-size:12px;color:#7A4010;line-height:1.5;">${loc.notes}</div>` : ""}
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

          const marker = new mapboxgl.Marker({ element: createPinElement() })
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
