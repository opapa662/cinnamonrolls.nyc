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
        background: "var(--cr-cream)",
        borderTop: "1px solid rgba(139,69,19,0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 35,
        fontFamily: "var(--font-inter), -apple-system, sans-serif",
      }}
    >
      <a
        href="https://www.instagram.com/cinnamonrolls.nyc"
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontSize: 10, fontWeight: 500, color: "#9C6B3C", textDecoration: "none" }}
      >
        follow us @cinnamonrolls.nyc
      </a>
    </div>
  );
}
