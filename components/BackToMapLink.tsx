"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

export default function BackToMapLink() {
  return (
    <Link
      href="/"
      onClick={() => trackEvent("location_to_map_nav")}
      style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--cr-brown-mid)", textDecoration: "none", fontWeight: 500, marginBottom: 24 }}
    >
      ← Back to map
    </Link>
  );
}
