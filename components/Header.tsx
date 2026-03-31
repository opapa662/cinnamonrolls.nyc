import Link from "next/link";

export default function Header({ count, backLink }: { count: number; backLink?: boolean }) {
  return (
    <header
      className="flex items-center justify-between px-5 shrink-0"
      style={{
        height: "60px",
        background: "var(--cr-cream)",
        borderBottom: "1px solid rgba(139,69,19,0.12)",
        boxShadow: "0 2px 10px rgba(139,69,19,0.08)",
        zIndex: 20,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
      }}
    >
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon.png" alt="" style={{ width: 24, height: 24, objectFit: "contain", flexShrink: 0 }} />
        <div style={{ fontFamily: "var(--font-inter), -apple-system, sans-serif" }}>
          <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--cr-brown)", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
            cinnamonrolls.nyc
          </div>
          <div style={{ fontSize: "11px", fontWeight: 400, color: "#9C6B3C", letterSpacing: "0.01em", lineHeight: 1.2, marginTop: 2 }}>
            the ultimate map of the city&apos;s best swirls
          </div>
        </div>
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: 24, fontFamily: "var(--font-inter), -apple-system, sans-serif" }}>
        {backLink && (
          <Link href="/" style={{ fontSize: "13px", color: "#9C6B3C", textDecoration: "none", fontWeight: 500 }}>
            ← Back to map
          </Link>
        )}
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--cr-brown)", letterSpacing: "-0.01em" }}>
            {count} cinnamon rolls
          </div>
          <div style={{ fontSize: "11px", color: "#9C6B3C", marginTop: 1 }}>
            Updated today
          </div>
        </div>
      </div>
    </header>
  );
}
