"use client";

import { useEffect, useRef } from "react";
import type { Map as MapboxMap } from "mapbox-gl";
import { supabase } from "@/lib/supabase";

interface Location {
  id: string;
  name: string;
  display_name: string | null;
  latitude: number;
  longitude: number;
  neighborhood: string | null;
  borough: string | null;
}

// Custom cinnamon roll SVG pin icon (44×44px tap target)
const ROLL_SVG = `<svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="22" cy="41" rx="9" ry="3" fill="rgba(0,0,0,0.15)"/>
  <circle cx="22" cy="20" r="18" fill="#C97B3A"/>
  <circle cx="22" cy="20" r="13.5" fill="#8B3A0F"/>
  <circle cx="22" cy="20" r="9" fill="#D4904A"/>
  <circle cx="22" cy="20" r="5" fill="#8B3A0F"/>
  <circle cx="22" cy="20" r="2.5" fill="#D4904A"/>
  <circle cx="22" cy="20" r="18" fill="none" stroke="#7A3000" stroke-width="1"/>
  <path d="M8 15 C11 11, 16 9, 22 9 C28 9, 33 11, 36 15" stroke="#FFF8F0" stroke-width="2.5" stroke-linecap="round" fill="none"/>
  <path d="M12 20 C14.5 17, 18 15.5, 22 15.5 C26 15.5, 29.5 17, 32 20" stroke="#FFF8F0" stroke-width="1.8" stroke-linecap="round" fill="none" opacity="0.8"/>
</svg>`;

function createPinElement(): HTMLElement {
  const el = document.createElement("div");
  el.style.cssText =
    "width:44px;height:44px;cursor:pointer;display:flex;align-items:center;justify-content:center;";
  el.innerHTML = ROLL_SVG;
  return el;
}

function createPopupHTML(loc: Location): string {
  const displayName = loc.display_name || loc.name;
  const sub = [loc.neighborhood, loc.borough].filter(Boolean).join(" · ");
  return `<div style="padding:12px 16px;min-width:180px;">
    <div style="font-size:15px;font-weight:600;color:#3D1C02;line-height:1.3;">${displayName}</div>
    ${sub ? `<div style="margin-top:4px;font-size:12px;color:#9C6B3C;">${sub}</div>` : ""}
  </div>`;
}

export default function Map() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current || !containerRef.current) return;
    initializedRef.current = true;

    async function init() {
      const mapboxgl = (await import("mapbox-gl")).default;

      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

      const { data: locations, error } = await supabase
        .from("locations")
        .select("id, name, display_name, latitude, longitude, neighborhood, borough")
        .eq("status", "active")
        .order("name");

      if (error) {
        console.error("Failed to fetch locations:", error.message);
      }

      if (!containerRef.current) return;

      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [-73.97, 40.73],
        zoom: 11,
        attributionControl: false,
      });

      map.addControl(
        new mapboxgl.AttributionControl({ compact: true }),
        "bottom-right"
      );

      mapRef.current = map;

      map.on("load", () => {
        if (!locations?.length) return;

        const bounds = new mapboxgl.LngLatBounds();

        locations.forEach((loc: Location) => {
          bounds.extend([loc.longitude, loc.latitude]);

          const popup = new mapboxgl.Popup({
            offset: 25,
            closeButton: false,
            maxWidth: "280px",
            className: "cr-popup",
          }).setHTML(createPopupHTML(loc));

          new mapboxgl.Marker({ element: createPinElement() })
            .setLngLat([loc.longitude, loc.latitude])
            .setPopup(popup)
            .addTo(map);
        });

        map.resize();
        map.fitBounds(bounds, { padding: 80, maxZoom: 14, duration: 0 });
      });
    }

    init();

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: "fixed", top: 52, left: 0, right: 0, bottom: 0 }}
    />
  );
}
