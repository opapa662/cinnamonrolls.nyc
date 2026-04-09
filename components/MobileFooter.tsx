import Link from "next/link";

export default function MobileFooter() {
  return (
    <div
      className="mobile-only"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 24,
        background: "#f5e6d3",
        borderTop: "1px solid rgba(139,69,19,0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 41,
        fontFamily: "var(--font-inter), -apple-system, sans-serif",
      }}
    >
      <a
        href="https://www.instagram.com/cinnamonrolls.nyc"
        target="_blank"
        rel="noopener noreferrer"
        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 500, color: "#9C6B3C", textDecoration: "none" }}
      >
        @cinnamonrolls.nyc
      </a>
      <span style={{ fontSize: 10, color: "rgba(139,69,19,0.3)", flexShrink: 0 }}>|</span>
      <Link
        href="/about"
        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 500, color: "#9C6B3C", textDecoration: "none" }}
      >
        About
      </Link>
    </div>
  );
}
