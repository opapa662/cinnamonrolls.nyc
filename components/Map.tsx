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
  notes: string | null;
  // Future columns (not in DB yet — will be null until schema is updated)
  website: string | null;
  instagram: string | null;
}

function createPinElement(): HTMLElement {
  const el = document.createElement("div");
  el.style.cssText =
    "width:44px;height:44px;cursor:pointer;display:flex;align-items:center;justify-content:center;";
  const img = document.createElement("img");
  img.src = "/icon.png";
  img.style.cssText = "width:32px;height:32px;object-fit:contain;";
  el.appendChild(img);
  return el;
}

function createPopupHTML(loc: Location): string {
  const displayName = loc.display_name || loc.name;
  const sub = [loc.neighborhood, loc.borough].filter(Boolean).join(" · ");

  const linksHTML = (loc.website || loc.instagram) ? `
    <div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(139,69,19,0.1);display:flex;gap:12px;flex-wrap:wrap;">
      ${loc.website ? `<a href="${loc.website}" target="_blank" rel="noopener" style="font-size:12px;color:#8B4513;text-decoration:none;font-weight:500;">🌐 Website</a>` : ""}
      ${loc.instagram ? `<a href="https://instagram.com/${loc.instagram.replace(/^@/, "")}" target="_blank" rel="noopener" style="font-size:12px;color:#8B4513;text-decoration:none;font-weight:500;">📸 @${loc.instagram.replace(/^@/, "")}</a>` : ""}
    </div>` : "";

  return `<div style="padding:14px 16px;min-width:200px;max-width:260px;font-family:-apple-system,sans-serif;">
    <div style="font-size:15px;font-weight:700;color:#3D1C02;line-height:1.3;">${displayName}</div>
    ${sub ? `<div style="margin-top:3px;font-size:12px;color:#9C6B3C;">${sub}</div>` : ""}
    ${loc.notes ? `<div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(139,69,19,0.1);font-size:12px;color:#7A4010;line-height:1.5;">${loc.notes}</div>` : ""}
    ${linksHTML}
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
        .select("id, name, display_name, latitude, longitude, neighborhood, borough, notes")
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

        locations.forEach((loc: Omit<Location, "website" | "instagram"> & { website?: string | null; instagram?: string | null }) => {
          const fullLoc: Location = { ...loc, website: loc.website ?? null, instagram: loc.instagram ?? null };
          bounds.extend([fullLoc.longitude, fullLoc.latitude]);

          const popup = new mapboxgl.Popup({
            offset: 25,
            closeButton: false,
            maxWidth: "280px",
            className: "cr-popup",
          }).setHTML(createPopupHTML(fullLoc));

          new mapboxgl.Marker({ element: createPinElement() })
            .setLngLat([fullLoc.longitude, fullLoc.latitude])
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
      style={{ position: "fixed", top: 60, left: 0, right: 0, bottom: 0 }}
    />
  );
}
