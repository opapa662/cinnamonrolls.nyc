import Link from "next/link";

export default function Header({ count, backLink }: { count: number; backLink?: boolean }) {
  return (
    <header
      className="flex items-center justify-between px-5 shrink-0"
      style={{
        height: "60px",
        background: "var(--cr-brown)",
        borderBottom: "none",
        boxShadow: "0 2px 12px rgba(61,28,2,0.18)",
        zIndex: 20,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
      }}
    >
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <img src="/icon.png" alt="" style={{ width: 22, height: 22, objectFit: "contain" }} />
        </div>
        <div style={{ fontFamily: "var(--font-inter), -apple-system, sans-serif" }}>
          <div className="header-title" style={{ fontWeight: 600, color: "var(--cr-cream)", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
            cinnamonrolls.nyc
          </div>
          <div className="header-tagline" style={{ fontWeight: 400, color: "rgba(255,248,240,0.72)", letterSpacing: "0.01em", lineHeight: 1.2, marginTop: 2 }}>
            the ultimate map of the city&apos;s best swirls
          </div>
        </div>
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: 24, fontFamily: "var(--font-inter), -apple-system, sans-serif" }}>
        {backLink && (
          <Link href="/" className="back-to-map" style={{ fontSize: "13px", color: "rgba(255,248,240,0.72)", textDecoration: "none", fontWeight: 500 }}>
            ← Back to map
          </Link>
        )}
        <div style={{ textAlign: "right" }}>
          <div className="header-count" style={{ fontWeight: 600, color: "var(--cr-cream)", letterSpacing: "-0.01em", lineHeight: 1.2, whiteSpace: "nowrap" }}>
            {count} cinnamon rolls
          </div>
          <div className="header-sub" style={{ color: "rgba(255,248,240,0.72)", marginTop: 2, lineHeight: 1.2, whiteSpace: "nowrap" }}>
            Updated today
          </div>
        </div>
      </div>
    </header>
  );
}
