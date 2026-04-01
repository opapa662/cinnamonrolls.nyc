"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { LocationItem, RecentlyAddedItem, sectionLabel, type SidebarLocation } from "@/components/Sidebar";

const PEEK_VISIBLE = 72; // handle (32) + count row (36) + 4px breathing room

type Snap = "peek" | "full" | "collapsed";

export interface MobileSheetHandle {
  collapse: () => void;
  peek: () => void;
  expand: () => void;
}

interface Props {
  locations: SidebarLocation[];
  filteredLocations: SidebarLocation[];
  isFiltered: boolean;
  onSelectLocation: (loc: SidebarLocation) => void;
  onShowAll: () => void;
  onClearAll: () => void;
  savedIds: Set<string>;
  onToggleSave: (id: string) => void;
  savedMode: boolean;
  onToggleSavedMode: () => void;
  nearbyMode: boolean;
  nearbyRadius: number | null;
  nearbyError: string | null;
  onNearbyClick: () => void;
  onNearbyRefresh: () => void;
  distances: globalThis.Map<string, number> | null;
  selectedId: string | null;
}

function getRecentlyAdded(locations: SidebarLocation[], count = 4) {
  return [...locations]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, count);
}

const MobileBottomSheet = forwardRef<MobileSheetHandle, Props>(function MobileBottomSheet(
  {
    locations, filteredLocations, isFiltered, onSelectLocation, onClearAll, savedIds,
    onToggleSave, savedMode, onToggleSavedMode, nearbyMode, nearbyRadius,
    nearbyError, onNearbyClick, onNearbyRefresh, distances, selectedId,
  },
  ref,
) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [snap, setSnap] = useState<Snap>("peek");
  const [translateY, setTranslateY] = useState(9999);
  const [transitioning, setTransitioning] = useState(false);
  const translateYRef = useRef(9999);
  const dragRef = useRef({ startY: 0, startTranslateY: 0 });

  const snapTo = useCallback((target: Snap) => {
    const h = sheetRef.current?.offsetHeight ?? 500;
    const y = target === "full" ? 0
      : target === "peek" ? Math.max(0, h - PEEK_VISIBLE)
      : Math.max(0, h - 36);
    setSnap(target);
    setTransitioning(true);
    setTranslateY(y);
    translateYRef.current = y;
    setTimeout(() => setTransitioning(false), 340);
  }, []);

  useImperativeHandle(ref, () => ({
    collapse: () => snapTo("collapsed"),
    peek: () => snapTo("peek"),
    expand: () => snapTo("full"),
  }));

  useEffect(() => { snapTo("peek"); }, [snapTo]);

  // Pull-to-close: drag the sheet down from content when scrolled to top
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    let startY = 0;
    let pulling = false;

    function onTouchStart(e: TouchEvent) {
      startY = e.touches[0].clientY;
      pulling = false;
    }

    function onTouchMove(e: TouchEvent) {
      const delta = e.touches[0].clientY - startY;
      if ((el as HTMLDivElement).scrollTop === 0 && delta > 8) {
        pulling = true;
        e.preventDefault();
        setTransitioning(false);
        const h = sheetRef.current?.offsetHeight ?? 500;
        const y = Math.max(0, Math.min(h - 36, delta));
        setTranslateY(y);
        translateYRef.current = y;
      }
    }

    function onTouchEnd(e: TouchEvent) {
      if (!pulling) return;
      pulling = false;
      const delta = e.changedTouches[0].clientY - startY;
      snapTo(delta > 80 ? "peek" : "full");
    }

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [snapTo]);

  function handleTouchStart(e: React.TouchEvent) {
    dragRef.current = { startY: e.touches[0].clientY, startTranslateY: translateYRef.current };
    setTransitioning(false);
  }

  function handleTouchMove(e: React.TouchEvent) {
    const delta = e.touches[0].clientY - dragRef.current.startY;
    const h = sheetRef.current?.offsetHeight ?? 500;
    const y = Math.max(0, Math.min(h - 36, dragRef.current.startTranslateY + delta));
    setTranslateY(y);
    translateYRef.current = y;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const delta = e.changedTouches[0].clientY - dragRef.current.startY;
    const h = sheetRef.current?.offsetHeight ?? 500;
    if (delta < -60) return snapTo("full");
    if (delta > 60) {
      // swipe down: full → peek, peek/collapsed → collapsed
      return snapTo(snap === "full" ? "peek" : "collapsed");
    }
    // small movement: snap to nearest of full / peek / collapsed
    const peekY = h - PEEK_VISIBLE;
    const collY = h - 36;
    const curr = translateYRef.current;
    if (curr < peekY / 2) snapTo("full");
    else if (curr < (peekY + collY) / 2) snapTo("peek");
    else snapTo("collapsed");
  }

  const recentlyAdded = getRecentlyAdded(locations);

  return (
    <div
      ref={sheetRef}
      style={{
        position: "fixed",
        top: 68,
        bottom: 80,
        left: 0,
        right: 0,
        borderRadius: "16px 16px 0 0",
        background: "var(--cr-cream)",
        boxShadow: "0 -4px 20px rgba(139,69,19,0.14)",
        border: "1px solid rgba(139,69,19,0.12)",
        borderBottom: "none",
        transform: `translateY(${translateY}px)`,
        transition: transitioning ? "transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)" : "none",
        zIndex: 30,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "var(--font-inter), -apple-system, sans-serif",
        willChange: "transform",
      }}
    >
      {/* Drag handle */}
      <div
        style={{
          flexShrink: 0,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "grab",
          background: snap === "full" ? "#f5e6d3" : "var(--cr-cream)",
          borderBottom: snap === "full" ? "1px solid rgba(139,69,19,0.1)" : "none",
          touchAction: "none",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          const h = sheetRef.current?.offsetHeight ?? 500;
          const peekY = h - PEEK_VISIBLE;
          if (translateY < peekY / 2) snapTo("peek");          // visually open → go to peek
          else if (translateY <= peekY + 20) snapTo("collapsed"); // at peek → collapse
          else snapTo("peek");                                   // collapsed → show peek
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(139,69,19,0.28)" }} />
      </div>

      {/* Persistent count row — always visible in peek state */}
      <div style={{
        flexShrink: 0,
        height: 36,
        display: "flex",
        alignItems: "center",
        padding: "0 14px",
        borderBottom: "1px solid rgba(139,69,19,0.08)",
      }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#9C6B3C" }}>
          {nearbyMode
            ? (nearbyRadius != null ? `${filteredLocations.length} nearby rolls` : "Nearby rolls")
            : savedMode
            ? `${filteredLocations.length} saved rolls`
            : `${filteredLocations.length} of ${locations.length} rolls`}
        </span>
      </div>

      {/* Scrollable content */}
      <div ref={contentRef} style={{ flex: 1, overflowY: translateY < 20 ? "auto" : "hidden", paddingBottom: 80 }}>
        {/* Recently Added */}
        {!isFiltered && recentlyAdded.length > 0 && (
          <div style={{ padding: "6px 12px 0" }}>
            <div style={sectionLabel}>Recently Added</div>
            <div style={{ borderRadius: 8, border: "1px solid rgba(139,69,19,0.1)", overflow: "hidden", background: "rgba(253,247,242,0.7)" }}>
              {recentlyAdded.map((loc) => (
                <RecentlyAddedItem
                  key={loc.id}
                  loc={loc}
                  onClick={() => onSelectLocation(loc)}
                  selected={selectedId === loc.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* List header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 14px 8px",
          marginTop: isFiltered ? 0 : 10,
          borderTop: isFiltered ? "none" : "2px solid rgba(139,69,19,0.18)",
        }}>
          <span style={sectionLabel}>
            {nearbyMode
              ? (nearbyRadius != null ? `Nearby (within ${nearbyRadius} mi)` : "Nearby")
              : savedMode
              ? (savedIds.size > 0 ? `Saved (${savedIds.size})` : "Saved")
              : "All Locations"}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {nearbyMode && (
              <button
                onClick={onNearbyRefresh}
                style={{ fontSize: 11, color: "#9C6B3C", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
              >
                Refresh ↻
              </button>
            )}
            {(nearbyMode || savedMode) && (
              <button
                onClick={nearbyMode ? onNearbyClick : onToggleSavedMode}
                style={{ fontSize: 11, color: "#9C6B3C", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
              >
                Close ×
              </button>
            )}
            {isFiltered && !nearbyMode && !savedMode && (
              <button
                onClick={onClearAll}
                style={{ fontSize: 11, color: "#9C6B3C", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
              >
                Show all ×
              </button>
            )}
          </div>
        </div>

        {nearbyError && (
          <div style={{ padding: "0 14px 12px", fontSize: 12, color: "#9C6B3C" }}>{nearbyError}</div>
        )}

        {filteredLocations.length === 0 ? (
          <div style={{ padding: "20px 14px", fontSize: 12, color: "#b08060", textAlign: "center" }}>
            {savedMode ? "No saved spots yet — heart a location to save it" : "No spots match your filters"}
          </div>
        ) : (
          filteredLocations.map((loc) => (
            <LocationItem
              key={loc.id}
              loc={loc}
              onClick={() => onSelectLocation(loc)}
              saved={savedIds.has(loc.id)}
              onToggleSave={onToggleSave}
              selected={selectedId === loc.id}
              distanceMiles={distances?.get(loc.id)}
            />
          ))
        )}
      </div>
    </div>
  );
});

export default MobileBottomSheet;
