import { ImageResponse } from "next/og";
import { supabase } from "@/lib/supabase";
import { locationSlug } from "@/lib/location-slug";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Location {
  name: string;
  display_name: string | null;
  neighborhood: string | null;
  borough: string | null;
}

async function getLocation(slug: string): Promise<Location | null> {
  const { data } = await supabase
    .from("locations")
    .select("name, display_name, neighborhood, borough")
    .eq("visible", true);
  if (!data) return null;
  const match = data.find((l) => locationSlug(l.name) === slug);
  return match ?? null;
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const loc = await getLocation(slug);

  const name = loc?.display_name ?? loc?.name ?? "cinnamonrolls.nyc";
  const sub = [loc?.neighborhood, loc?.borough].filter(Boolean).join(", ");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#FFF8F0",
          padding: "0",
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        {/* Top brown bar */}
        <div style={{ width: "100%", height: 12, background: "#8B4513", display: "flex", flexShrink: 0 }} />

        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 100px",
          }}
        >
          {/* Site attribution */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 40,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://cinnamonrolls.nyc/icon.png"
              width={44}
              height={44}
              alt=""
              style={{ borderRadius: "50%", background: "#fff" }}
            />
            <div style={{ fontSize: 22, color: "#9C6B3C", fontWeight: 600, display: "flex" }}>
              cinnamonrolls.nyc
            </div>
          </div>

          {/* Bakery name */}
          <div
            style={{
              fontSize: name.length > 24 ? 68 : 84,
              fontWeight: 800,
              color: "#3d1c02",
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              display: "flex",
              marginBottom: 28,
            }}
          >
            {name}
          </div>

          {/* Sub info row */}
          {sub && (
            <div style={{ fontSize: 30, color: "#9C6B3C", fontWeight: 500, display: "flex" }}>
              {sub}
            </div>
          )}
        </div>

        {/* Bottom brown bar */}
        <div style={{ width: "100%", height: 12, background: "#8B4513", display: "flex", flexShrink: 0 }} />
      </div>
    ),
    { ...size },
  );
}
