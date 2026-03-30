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

function createPinElement(): HTMLElement {
  const el = document.createElement("div");
  el.style.cssText =
    "width:44px;height:44px;cursor:pointer;";
  const img = document.createElement("img");
  img.src = "/icon.png";
  img.style.cssText = "width:44px;height:44px;object-fit:contain;";
  el.appendChild(img);
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
