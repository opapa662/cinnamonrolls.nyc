"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

interface Props {
  bakeryId: string;
  bakeryName: string;
}

export default function LocationPageTracker({ bakeryId, bakeryName }: Props) {
  useEffect(() => {
    const referrer = document.referrer;
    let entryPoint: "direct" | "map_popup" | "internal_link" | "search" = "direct";
    if (referrer.includes(window.location.hostname)) {
      entryPoint = referrer.includes("/locations/") ? "internal_link" : "map_popup";
    } else if (referrer.includes("google.") || referrer.includes("bing.") || referrer.includes("search")) {
      entryPoint = "search";
    } else if (referrer) {
      entryPoint = "internal_link";
    }

    trackEvent("location_page_viewed", {
      bakery_id: bakeryId,
      bakery_name: bakeryName,
      page_path: window.location.pathname,
      entry_point: entryPoint,
    });
  }, [bakeryId, bakeryName]);

  return null;
}
