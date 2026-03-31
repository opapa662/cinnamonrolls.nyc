"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push("/admin");
    } else {
      setError("Incorrect password");
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--cr-cream)" }}>
      <div style={{ width: "100%", maxWidth: 360, padding: "40px 32px", background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(139,69,19,0.1)", border: "1px solid rgba(139,69,19,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.png" alt="" style={{ width: 28, height: 28 }} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--cr-brown-dark)" }}>Admin</div>
            <div style={{ fontSize: 11, color: "var(--cr-brown-mid)" }}>cinnamonrolls.nyc</div>
          </div>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            style={{ padding: "10px 14px", fontSize: 14, border: "1px solid rgba(139,69,19,0.2)", borderRadius: 8, outline: "none", background: "#fff", color: "var(--cr-brown-dark)", fontFamily: "inherit" }}
          />
          {error && <p style={{ fontSize: 12, color: "#c0392b", margin: 0 }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{ padding: "10px 0", background: loading ? "#c8a98a" : "var(--cr-brown)", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: loading ? "default" : "pointer", fontFamily: "inherit" }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
