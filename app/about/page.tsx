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
              About cinnamonrolls.nyc
            </h1>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 15, color: "#7A4010", lineHeight: 1.7 }}>
              <p style={{ margin: 0 }}>
                This map started as a personal obsession. NYC has an incredible cinnamon roll scene — from classic bakeries to tiny pop-ups — but finding the good ones meant digging through articles, scrolling Instagram, and asking friends. There was no single place to see it all.
              </p>
              <p style={{ margin: 0 }}>
                So we built one. cinnamonrolls.nyc is an independent, curated map of the city&apos;s best swirls. Every spot is hand-picked — no algorithms, no ads, no sponsored listings. Just rolls worth eating.
              </p>
              <p style={{ margin: 0 }}>
                Know a spot we&apos;re missing? Something out of date? We want to hear from you.
              </p>
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid rgba(139,69,19,0.15)", marginBottom: 40 }} />

          {/* Contact form */}
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--cr-brown-dark)", letterSpacing: "-0.01em", marginBottom: 6 }}>
            Get in touch
          </h2>
          <p style={{ fontSize: 14, color: "#9C6B3C", marginBottom: 28, lineHeight: 1.6 }}>
            Feedback, suggestions, or just want to say hi — we read everything.
          </p>
          <AboutClient />
        </div>
      </div>
    </div>
  );
}
