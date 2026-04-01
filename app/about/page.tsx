import Link from "next/link";
import Header from "@/components/Header";
import AboutClient from "./AboutClient";
import { supabase } from "@/lib/supabase";

export default async function AboutPage() {
  const { count } = await supabase
    .from("locations")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  return (
    <div style={{ minHeight: "100vh", background: "var(--cr-cream)", fontFamily: "var(--font-inter), -apple-system, sans-serif" }}>
      <Header count={count ?? 0} backLink />
      <div style={{ paddingTop: "60px", paddingBottom: "72px" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "48px 24px" }}>

          {/* About section */}
          <div style={{ marginBottom: 48 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.png" alt="" style={{ width: 48, height: 48, objectFit: "contain", display: "block", marginBottom: 20 }} />
            <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--cr-brown-dark)", letterSpacing: "-0.02em", marginBottom: 16, lineHeight: 1.2 }}>
              Welcome!
            </h1>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 15, color: "#7A4010", lineHeight: 1.7 }}>
              <p style={{ margin: 0 }}>
                NYC has a budding cinnamon roll scene - from classic bakeries to park kiosks to pop-ups - but there was no single map where you could see them all. So we built one!
              </p>
              <p style={{ margin: 0 }}>
                cinnamonrolls.nyc is an independent, curated map of the city&apos;s best swirls – and a love letter to our favorite pastry. Whether you&apos;re a fellow cinnamon roll obsessive or just craving something sweet, we hope this map helps you find it.
              </p>
              <p style={{ margin: 0 }}>
                We&apos;re always adding new spots - we know there are more to be discovered. Know a place we&apos;re missing? Something out of date? We&apos;d love to hear about it.
              </p>
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid rgba(139,69,19,0.15)", marginBottom: 40 }} />

          {/* Contact form */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--cr-brown-dark)", letterSpacing: "-0.01em", margin: 0 }}>
              Get in touch
            </h2>
            <Link href="/submit" style={{
              display: "inline-block",
              padding: "9px 16px",
              background: "#fff8ed",
              border: "1px solid rgba(139,69,19,0.25)",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: "var(--cr-brown)",
              textDecoration: "none",
              letterSpacing: "0.01em",
            }}>
              Request an addition or edit to the map →
            </Link>
          </div>
          <AboutClient />
        </div>
      </div>
    </div>
  );
}
