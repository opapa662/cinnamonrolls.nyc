import Link from "next/link";

export default function Footer() {
  return (
    <footer
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "36px",
        background: "#f5e6d3",
        borderTop: "1px solid rgba(139,69,19,0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 20,
        paddingRight: 16,
        zIndex: 10,
        fontFamily: "var(--font-inter), -apple-system, sans-serif",
      }}
    >
      <a
        href="https://www.instagram.com/cinnamonrolls.nyc"
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontSize: "12px", fontWeight: 500, color: "#9C6B3C", textDecoration: "none" }}
      >
        @cinnamonrolls.nyc
      </a>
      <Link
        href="/about"
        style={{ fontSize: "12px", fontWeight: 500, color: "#9C6B3C", textDecoration: "none" }}
      >
        About us
      </Link>
    </footer>
  );
}
