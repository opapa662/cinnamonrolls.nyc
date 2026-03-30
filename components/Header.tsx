export default function Header() {
  return (
    <header
      className="flex items-center px-5 shrink-0"
      style={{
        height: "52px",
        background: "var(--cr-cream)",
        borderBottom: "1px solid rgba(139,69,19,0.12)",
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          fontFamily: "var(--font-inter), -apple-system, sans-serif",
          fontSize: "15px",
          fontWeight: 600,
          color: "var(--cr-brown)",
          letterSpacing: "-0.01em",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon.png" alt="" style={{ width: 24, height: 24, objectFit: "contain", marginRight: 8 }} />
        cinnamonroll.nyc
      </span>
    </header>
  );
}
