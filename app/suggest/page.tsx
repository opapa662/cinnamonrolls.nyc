"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SuggestPage() {
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase
      .from("submissions")
      .insert({ name: name.trim(), website: website.trim() || null, address: address.trim() || null });

    if (error) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--cr-cream)", fontFamily: "var(--font-inter), -apple-system, sans-serif" }}>
      {/* Header */}
      <header style={{ height: "60px", background: "var(--cr-cream)", borderBottom: "1px solid rgba(139,69,19,0.12)", display: "flex", alignItems: "center", padding: "0 24px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.png" alt="" style={{ width: 24, height: 24, objectFit: "contain" }} />
          <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--cr-brown)", letterSpacing: "-0.01em" }}>
            cinnamonroll.nyc
          </span>
        </Link>
      </header>

      {/* Form */}
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "56px 24px" }}>
        {submitted ? (
          <div style={{ textAlign: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.png" alt="" style={{ width: 56, height: 56, objectFit: "contain", display: "block", margin: "0 auto 20px" }} />
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--cr-brown-dark)", marginBottom: 10 }}>
              Thanks for the tip!
            </h1>
            <p style={{ fontSize: "15px", color: "#9C6B3C", marginBottom: 32, lineHeight: 1.6 }}>
              We&apos;ll check it out and add it to the map if it makes the cut.
            </p>
            <Link href="/" style={{ display: "inline-block", padding: "10px 24px", background: "var(--cr-brown)", color: "#fff", borderRadius: 8, textDecoration: "none", fontSize: "14px", fontWeight: 600 }}>
              Back to the map
            </Link>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: "var(--cr-brown-dark)", marginBottom: 8, letterSpacing: "-0.02em" }}>
              Suggest a spot
            </h1>
            <p style={{ fontSize: "14px", color: "#9C6B3C", marginBottom: 36, lineHeight: 1.6 }}>
              Know a cinnamon roll in NYC that should be on the map? Tell us about it and we&apos;ll check it out.
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={labelStyle}>Bakery name <span style={{ color: "var(--cr-brown)" }}>*</span></label>
                <input
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Radio Bakery"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Website or social handle <span style={{ color: "var(--cr-brown)" }}>*</span></label>
                <input
                  required
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  placeholder="https://... or @handle"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Address <span style={{ color: "#9C6B3C", fontWeight: 400 }}>(optional)</span></label>
                <input
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="e.g. 226 Nassau Ave, Greenpoint, Brooklyn"
                  style={inputStyle}
                />
              </div>

              {error && <p style={{ fontSize: "13px", color: "#c0392b" }}>{error}</p>}

              <button
                type="submit"
                disabled={loading}
                style={{ marginTop: 8, padding: "12px 24px", background: loading ? "#c8a98a" : "var(--cr-brown)", color: "#fff", border: "none", borderRadius: 8, fontSize: "15px", fontWeight: 600, cursor: loading ? "default" : "pointer", letterSpacing: "-0.01em" }}
              >
                {loading ? "Sending..." : "Submit suggestion"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  fontWeight: 600,
  color: "var(--cr-brown-dark)",
  marginBottom: 6,
  letterSpacing: "0.01em",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  fontSize: "14px",
  color: "var(--cr-brown-dark)",
  background: "#fff",
  border: "1px solid rgba(139,69,19,0.2)",
  borderRadius: 8,
  outline: "none",
  boxSizing: "border-box",
};
