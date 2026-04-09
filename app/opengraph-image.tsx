import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#FFF8F0",
          boxSizing: "border-box",
        }}
      >
        {/* Top brown bar */}
        <div style={{ width: "100%", height: 24, background: "#8B4513", display: "flex", flexShrink: 0 }} />

        {/* Left + right bars */}
        <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 24, background: "#8B4513", display: "flex" }} />
        <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 24, background: "#8B4513", display: "flex" }} />

        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://cinnamonrolls.nyc/icon.png"
            width={120}
            height={114}
            alt=""
          />
          <div style={{ fontSize: 72, fontWeight: 800, color: "#8B4513", letterSpacing: "-0.03em", display: "flex" }}>
            cinnamonrolls.nyc
          </div>
          <div style={{ fontSize: 28, color: "#9C6B3C", fontWeight: 400, display: "flex" }}>
            the ultimate map of the city&apos;s best swirls
          </div>
        </div>

        {/* Bottom brown bar */}
        <div style={{ width: "100%", height: 24, background: "#8B4513", display: "flex", flexShrink: 0 }} />
      </div>
    ),
    { ...size },
  );
}
