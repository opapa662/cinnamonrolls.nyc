import Link from "next/link";

export default function Header({ count }: { count: number }) {
  return (
    <header
      className="flex items-center justify-between px-5 shrink-0"
      style={{
        height: "60px",
        background: "var(--cr-cream)",
        borderBottom: "1px solid rgba(139,69,19,0.12)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon.png" alt="" style={{ width: 24, height: 24, objectFit: "contain", flexShrink: 0 }} />
        <div style={{ fontFamily: "var(--font-inter), -apple-system, sans-serif" }}>
          <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--cr-brown)", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
            cinnamonroll.nyc
          </div>
          <div style={{ fontSize: "11px", fontWeight: 400, color: "#9C6B3C", letterSpacing: "0.01em", lineHeight: 1.2, marginTop: 2 }}>
            the ultimate map of the city&apos;s best treats
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 24, fontFamily: "var(--font-inter), -apple-system, sans-serif" }}>
        <Link href="/suggest" style={{ fontSize: "13px", fontWeight: 500, color: "#9C6B3C", textDecoration: "none", borderBottom: "1px solid rgba(156,107,60,0.35)", paddingBottom: 1, whiteSpace: "nowrap" }}>
          + suggest a spot
        </Link>
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
