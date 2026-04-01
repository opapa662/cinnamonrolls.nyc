"use client";

import dynamic from "next/dynamic";
import { useRef, useCallback, useState, useEffect } from "react";
import Sidebar, { type SidebarLocation } from "@/components/Sidebar";
import MobileBottomSheet, { type MobileSheetHandle } from "@/components/MobileBottomSheet";
import MobileActionBar from "@/components/MobileActionBar";
import SearchPanel, { type Filters, EMPTY_FILTERS, hasActiveFilters } from "@/components/SearchPanel";
import type { Location as MapLocation } from "@/components/Map";
import type { Map as MapboxMap } from "mapbox-gl";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

// ── Haversine distance (miles) ────────────────────────────────────────────────
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

const RADII = [1, 2, 5]; // expanding search radii in miles

function getNearby(
  locations: SidebarLocation[],
  lat: number,
  lng: number,
): { results: { loc: SidebarLocation; dist: number }[]; radius: number | null } {
  const withDist = locations
    .map((loc) => ({ loc, dist: haversine(lat, lng, loc.latitude, loc.longitude) }))
    .sort((a, b) => a.dist - b.dist);

  for (const radius of RADII) {
    const results = withDist.filter(({ dist }) => dist <= radius);
    if (results.length > 0) return { results, radius };
  }

  // Fallback: 5 closest regardless of distance
  return { results: withDist.slice(0, 5), radius: null };
}

// ── Days filter ───────────────────────────────────────────────────────────────
const DAYS_ORDERED = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function expandDaysOpen(daysOpen: string | null): Set<string> {
  if (!daysOpen) return new Set(DAYS_ORDERED);
  const text = daysOpen.toLowerCase();
  if (text.includes("daily") || text.includes("everyday") || text.includes("every day") || text.includes("7 day")) {
    return new Set(DAYS_ORDERED);
  }
  const result = new Set<string>();
  const rangeMatch = daysOpen.match(/(\w+)\s*[-–]\s*(\w+)/);
  if (rangeMatch) {
    const start = DAYS_ORDERED.findIndex((d) => d.toLowerCase().startsWith(rangeMatch[1].toLowerCase().slice(0, 3)));
    const end = DAYS_ORDERED.findIndex((d) => d.toLowerCase().startsWith(rangeMatch[2].toLowerCase().slice(0, 3)));
    if (start !== -1 && end !== -1) {
      if (end >= start) {
        for (let i = start; i <= end; i++) result.add(DAYS_ORDERED[i]);
      } else {
        // wrap-around range (e.g. Wed–Mon = Wed, Thu, Fri, Sat, Sun, Mon)
        for (let i = start; i < 7; i++) result.add(DAYS_ORDERED[i]);
        for (let i = 0; i <= end; i++) result.add(DAYS_ORDERED[i]);
      }
    }
  }
  DAYS_ORDERED.forEach((day) => {
    if (text.includes(day.toLowerCase().slice(0, 3))) result.add(day);
  });
  return result.size > 0 ? result : new Set(DAYS_ORDERED);
}

function applyFilters(locations: SidebarLocation[], filters: Filters): SidebarLocation[] {
  return locations.filter((loc) => {
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const name = (loc.display_name || loc.name).toLowerCase();
      if (!name.includes(q)) return false;
    }
    if (filters.boroughs.length && !filters.boroughs.includes(loc.borough ?? "")) return false;
    if (filters.types.length && !filters.types.includes(loc.location_type ?? "")) return false;
    if (filters.neighborhoods.length && !filters.neighborhoods.includes(loc.neighborhood ?? "")) return false;
    if (filters.days.length) {
      const open = expandDaysOpen(loc.days_open);
      if (!filters.days.some((d) => open.has(d))) return false;
    }
    return true;
  });
}

// ── Component ─────────────────────────────────────────────────────────────────
interface MapPageClientProps {
  locations: MapLocation[];
}

export default function MapPageClient({ locations }: MapPageClientProps) {
  const mapRef = useRef<MapboxMap | null>(null);
  const fitAllRef = useRef<(() => void) | null>(null);
  const showPopupRef = useRef<((id: string) => void) | null>(null);
  const setUserMarkerRef = useRef<((lat: number, lng: number) => void) | null>(null);
  const clearUserMarkerRef = useRef<(() => void) | null>(null);
  const mobileSheetRef = useRef<MobileSheetHandle>(null);

  const [searchOpen, setSearchOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savedMode, setSavedMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [nearbyMode, setNearbyMode] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyError, setNearbyError] = useState<string | null>(null);
  const [nearbyRadius, setNearbyRadius] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("cr-saved-locations");
    if (stored) setSavedIds(new Set(JSON.parse(stored) as string[]));
  }, []);

  useEffect(() => {
    if (searchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [searchOpen]);

  const toggleSave = useCallback((id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem("cr-saved-locations", JSON.stringify([...next]));
      return next;
    });
  }, []);

  // ── Derived: filtered list + distances ──────────────────────────────────────
  let filteredLocations: SidebarLocation[];
  let distances: globalThis.Map<string, number> | null = null;

  if (nearbyMode && userCoords) {
    const { results, radius } = getNearby(locations, userCoords.lat, userCoords.lng);
    filteredLocations = results.map(({ loc }) => loc);
    distances = new globalThis.Map(results.map(({ loc, dist }) => [loc.id, dist]));
    // sync radius (avoid calling setState during render — done in handler)
    void radius; // radius is set in handleNearbyClick
  } else if (savedMode) {
    filteredLocations = locations.filter((l) => savedIds.has(l.id));
  } else {
    filteredLocations = applyFilters(locations, filters);
  }

  const isFiltered = nearbyMode || savedMode || hasActiveFilters(filters);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleMapReady = useCallback(
    (map: MapboxMap, fitAll: () => void, showPopup: (id: string) => void, setUserMarker: (lat: number, lng: number) => void, clearUserMarker: () => void) => {
      mapRef.current = map;
      fitAllRef.current = fitAll;
      showPopupRef.current = showPopup;
      setUserMarkerRef.current = setUserMarker;
      clearUserMarkerRef.current = clearUserMarker;
    },
    [],
  );

  const handleShowAll = useCallback(() => fitAllRef.current?.(), []);

  // On mobile, push the pin below the true center so the popup card
  // clears the header (60px) and has breathing room above.
  const flyOffset = (): [number, number] | undefined =>
    typeof window !== "undefined" && window.innerWidth < 768 ? [0, 110] : undefined;

  const handleSelectLocation = useCallback((loc: SidebarLocation) => {
    setSelectedId(loc.id);
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({ center: [loc.longitude, loc.latitude], zoom: 14, duration: 600, offset: flyOffset() });
    setTimeout(() => showPopupRef.current?.(loc.id), 700);
    mobileSheetRef.current?.collapse();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSurpriseMe = useCallback(() => {
    if (!locations.length) return;
    const loc = locations[Math.floor(Math.random() * locations.length)];
    setSelectedId(loc.id);
    mapRef.current?.flyTo({ center: [loc.longitude, loc.latitude], zoom: 14, duration: 800, offset: flyOffset() });
    setTimeout(() => showPopupRef.current?.(loc.id), 850);
    mobileSheetRef.current?.collapse();
  }, [locations]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNearbyClick = useCallback(() => {
    if (nearbyMode) {
      setNearbyMode(false);
      setUserCoords(null);
      setNearbyRadius(null);
      setNearbyError(null);
      clearUserMarkerRef.current?.();
      mobileSheetRef.current?.peek();
      return;
    }

    if (!navigator.geolocation) {
      setNearbyError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const { results, radius } = getNearby(locations, lat, lng);
        setUserCoords({ lat, lng });
        setNearbyMode(true);
        setNearbyRadius(radius);
        setNearbyError(null);
        setSavedMode(false);                    // ADD: clear saved when nearby activates
        mobileSheetRef.current?.expand();       // ADD: open sheet to show results
        // Pre-select distances for render (already computed above via nearbyMode)
        void results;
        mapRef.current?.flyTo({ center: [lng, lat], zoom: 14, duration: 800 });
        setUserMarkerRef.current?.(lat, lng);
      },
      () => {
        setNearbyError("Location access denied. Please enable location services and try again.");
      },
      { timeout: 8000 },
    );
  }, [nearbyMode, locations]);

  const handleNearbyRefresh = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const { results, radius } = getNearby(locations, lat, lng);
        setUserCoords({ lat, lng });
        setNearbyRadius(radius);
        setNearbyError(null);
        void results;
        mapRef.current?.flyTo({ center: [lng, lat], zoom: 14, duration: 800 });
        setUserMarkerRef.current?.(lat, lng);
      },
      () => {
        setNearbyError("Location access denied. Please enable location services and try again.");
      },
      { timeout: 8000 },
    );
  }, [locations]);

  const toggleSavedMode = () => {
    const willBeActive = !savedMode;
    setSavedMode(willBeActive);
    if (nearbyMode) { setNearbyMode(false); setUserCoords(null); clearUserMarkerRef.current?.(); }
    if (willBeActive) mobileSheetRef.current?.expand();
    else mobileSheetRef.current?.peek();
  };

  const handleClearAll = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setSavedMode(false);
    setNearbyMode(false);
    setUserCoords(null);
    setNearbyRadius(null);
    setNearbyError(null);
    clearUserMarkerRef.current?.();
    fitAllRef.current?.();
    mobileSheetRef.current?.peek();
  }, []);

  const sharedSidebarProps = {
    locations,
    filteredLocations,
    isFiltered,
    onShowAll: handleShowAll,
    onSelectLocation: handleSelectLocation,
    savedIds,
    onToggleSave: toggleSave,
    savedMode,
    onToggleSavedMode: toggleSavedMode,
    selectedId,
    nearbyMode,
    nearbyRadius,
    nearbyError,
    onNearbyClick: handleNearbyClick,
    onNearbyRefresh: handleNearbyRefresh,
    distances,
  };

  return (
    <div style={{ display: "flex", position: "absolute", inset: 0 }}>
      {/* Desktop sidebar */}
      <div className="desktop-sidebar">
        <Sidebar
          {...sharedSidebarProps}
          onSearchOpen={() => setSearchOpen((o) => !o)}
          onSurpriseMe={handleSurpriseMe}
          onToggleSavedMode={toggleSavedMode}
          onNearbyClick={handleNearbyClick}
          onClearAll={handleClearAll}
        />
      </div>

      <div style={{ flex: 1, position: "relative" }}>
        <Map
          locations={locations}
          onMapReady={handleMapReady}
          onPinClick={() => mobileSheetRef.current?.collapse()}
          savedIds={savedIds}
          onToggleSave={toggleSave}
        />
      </div>

      {/* Mobile bottom sheet + action bar */}
      <div className="mobile-only">
        <MobileBottomSheet
          ref={mobileSheetRef}
          {...sharedSidebarProps}
          onClearAll={handleClearAll}
        />
        <MobileActionBar
          savedMode={savedMode}
          nearbyMode={nearbyMode}
          savedCount={savedIds.size}
          nearbyRadius={nearbyRadius}
          onNearbyClick={handleNearbyClick}
          onSearchOpen={() => {
            const opening = !searchOpen;
            setSearchOpen((o) => !o);
            if (opening) {
              setSavedMode(false);
              mobileSheetRef.current?.collapse();
            } else {
              mobileSheetRef.current?.peek();
            }
          }}
          onSurpriseMe={handleSurpriseMe}
          onToggleSavedMode={toggleSavedMode}
        />
      </div>

      {searchOpen && (
        <SearchPanel
          filters={filters}
          onChange={setFilters}
          onClose={() => { setSearchOpen(false); mobileSheetRef.current?.peek(); }}
          locations={locations}
          filteredCount={filteredLocations.length}
        />
      )}
    </div>
  );
}
