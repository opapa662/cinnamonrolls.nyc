"use client";

import { type AnchorHTMLAttributes } from "react";
import { trackEvent } from "@/lib/analytics";

interface Props extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  linkType: "bakery_website" | "google_maps_directions" | "instagram" | "other";
  bakeryId?: string;
  linkLocation?: "popup" | "location_page" | "footer" | "other";
}

export default function OutboundLink({
  href,
  linkType,
  bakeryId,
  linkLocation = "other",
  children,
  onClick,
  ...rest
}: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        trackEvent("outbound_click", {
          destination_url: href,
          link_type: linkType,
          bakery_id: bakeryId ?? null,
          link_location: linkLocation,
        });
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
