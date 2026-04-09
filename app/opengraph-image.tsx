import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 280 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 48,
          background: "#FFF8F0",
          padding: "0 80px",
          boxSizing: "border-box",
        }}
      >
        {/* Left brown stripe */}
        <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 8, background: "#8B4513", display: "flex" }} />

        {/* Icon */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://cinnamonrolls.nyc/icon.png"
          width={120}
          height={114}
          alt=""
        />

        {/* Text */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 64, fontWeight: 700, color: "#8B4513", letterSpacing: "-0.02em", display: "flex" }}>
            cinnamonrolls.nyc
          </div>
          <div style={{ fontSize: 26, color: "#9C6B3C", fontWeight: 400, display: "flex" }}>
            the ultimate map of the city&apos;s best swirls
          </div>
        </div>

        {/* Right brown stripe */}
        <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 8, background: "#8B4513", display: "flex" }} />
      </div>
    ),
    { ...size },
  );
}
