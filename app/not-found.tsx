import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--cr-cream)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-inter), -apple-system, sans-serif",
        padding: "24px",
        textAlign: "center",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icon.png" alt="" style={{ width: 64, height: 64, marginBottom: 24, opacity: 0.7 }} />
      <h1
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: "var(--cr-brown-dark)",
          letterSpacing: "-0.02em",
          margin: "0 0 10px",
        }}
      >
        Page not found
      </h1>
      <p style={{ fontSize: 15, color: "#9C6B3C", margin: "0 0 32px", lineHeight: 1.6 }}>
        This page doesn&apos;t exist — but there are plenty of cinnamon rolls that do.
      </p>
      <Link
        href="/"
        style={{
          display: "inline-block",
          padding: "12px 24px",
          background: "var(--cr-brown)",
          color: "#fff",
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 700,
          textDecoration: "none",
        }}
      >
        ← Back to map
      </Link>
    </div>
  );
}
