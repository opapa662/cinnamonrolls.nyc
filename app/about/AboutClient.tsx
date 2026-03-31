"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AboutClient() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.from("contact_submissions").insert({
      name: name.trim() || null,
      email: email.trim(),
      message: message.trim(),
    });

    if (error) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) {
    return (
      <div style={{ padding: "24px", background: "#fff", borderRadius: 10, border: "1px solid rgba(139,69,19,0.15)", textAlign: "center" }}>
        <div style={{ fontSize: 22, marginBottom: 10 }}>🍥</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--cr-brown-dark)", marginBottom: 6 }}>Message received!</div>
        <div style={{ fontSize: 13, color: "#9C6B3C" }}>Thanks for reaching out — we&apos;ll be in touch.</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <label style={labelStyle}>
          Name <span style={{ color: "#9C6B3C", fontWeight: 400 }}>(optional)</span>
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>
          Email <span style={{ color: "var(--cr-brown)" }}>*</span>
        </label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>
          Message <span style={{ color: "var(--cr-brown)" }}>*</span>
        </label>
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What's on your mind?"
          rows={5}
          style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
        />
      </div>

      {error && <p style={{ fontSize: 13, color: "#c0392b", margin: 0 }}>{error}</p>}

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "12px 24px",
          background: loading ? "#c8a98a" : "var(--cr-brown)",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          fontSize: 15,
          fontWeight: 600,
          cursor: loading ? "default" : "pointer",
          letterSpacing: "-0.01em",
          fontFamily: "inherit",
        }}
      >
        {loading ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "var(--cr-brown-dark)",
  marginBottom: 6,
  letterSpacing: "0.01em",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  fontSize: 14,
  color: "var(--cr-brown-dark)",
  background: "#fff",
  border: "1px solid rgba(139,69,19,0.2)",
  borderRadius: 8,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};
