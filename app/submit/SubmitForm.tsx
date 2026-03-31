"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type SubmissionType = "addition" | "edit";

interface Location {
  id: string;
  name: string;
  display_name: string | null;
  neighborhood: string | null;
  borough: string | null;
}

export default function SubmitForm() {
  const [type, setType] = useState<SubmissionType>("addition");
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationId, setLocationId] = useState("");
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [comments, setComments] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase
      .from("locations")
      .select("id, name, display_name, neighborhood, borough")
      .eq("status", "active")
      .order("name")
      .then(({ data }) => setLocations(data ?? []));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.from("submissions").insert({
      submission_type: type,
      name: name.trim() || null,
      website: website.trim() || null,
      address: address.trim() || null,
      comments: comments.trim() || null,
      location_id: type === "edit" && locationId ? locationId : null,
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
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "56px 24px", textAlign: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon.png" alt="" style={{ width: 56, height: 56, objectFit: "contain", display: "block", margin: "0 auto 20px" }} />
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--cr-brown-dark)", marginBottom: 10 }}>
          Thanks for the tip!
        </h1>
        <p style={{ fontSize: "15px", color: "#9C6B3C", marginBottom: 32, lineHeight: 1.6 }}>
          {type === "addition"
            ? "We'll check it out and add it to the map if it makes the cut."
            : "We'll review your suggested edit and update the map accordingly."}
        </p>
        <Link href="/" style={ctaStyle}>
          Back to the map
        </Link>
      </div>
    );
  }

  const isEdit = type === "edit";

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "48px 24px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: 700, color: "var(--cr-brown-dark)", marginBottom: 8, letterSpacing: "-0.02em" }}>
        Add or edit a spot
      </h1>
      <p style={{ fontSize: "14px", color: "#9C6B3C", marginBottom: 28, lineHeight: 1.6 }}>
        Found a missing cinnamon roll? Spotted something out of date? We want to hear from you.
      </p>

      {/* Toggle */}
      <div style={{ display: "flex", background: "rgba(139,69,19,0.07)", borderRadius: 8, padding: 3, marginBottom: 28, gap: 2 }}>
        {(["addition", "edit"] as SubmissionType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            style={{
              flex: 1,
              padding: "8px 0",
              fontSize: "13px",
              fontWeight: 600,
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              background: type === t ? "#fff" : "transparent",
              color: type === t ? "var(--cr-brown-dark)" : "#9C6B3C",
              boxShadow: type === t ? "0 1px 4px rgba(139,69,19,0.12)" : "none",
              transition: "all 0.15s",
              fontFamily: "inherit",
            }}
          >
            {t === "addition" ? "Add a new spot" : "Suggest an edit"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Location picker — edit mode only */}
        {isEdit && (
          <div>
            <label style={labelStyle}>
              Which spot needs updating? <span style={{ color: "var(--cr-brown)" }}>*</span>
            </label>
            <select
              required
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              style={{ ...inputStyle, appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238B4513' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", paddingRight: 36, cursor: "pointer" }}
            >
              <option value="">Select a location…</option>
              {locations.map((loc) => {
                const label = loc.display_name || loc.name;
                const sub = [loc.neighborhood, loc.borough].filter(Boolean).join(", ");
                return (
                  <option key={loc.id} value={loc.id}>
                    {label}{sub ? ` - ${sub}` : ""}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {/* Name */}
        <div>
          <label style={labelStyle}>
            Bakery name
            {!isEdit && <span style={{ color: "var(--cr-brown)" }}> *</span>}
            {isEdit && <span style={{ color: "#9C6B3C", fontWeight: 400 }}> (optional)</span>}
          </label>
          <input
            required={!isEdit}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Radio Bakery"
            style={inputStyle}
          />
        </div>

        {/* Website */}
        <div>
          <label style={labelStyle}>
            Website or social handle
            {!isEdit && <span style={{ color: "var(--cr-brown)" }}> *</span>}
            {isEdit && <span style={{ color: "#9C6B3C", fontWeight: 400 }}> (optional)</span>}
          </label>
          <input
            required={!isEdit}
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://... or @handle"
            style={inputStyle}
          />
        </div>

        {/* Address */}
        <div>
          <label style={labelStyle}>
            Address <span style={{ color: "#9C6B3C", fontWeight: 400 }}>(optional)</span>
          </label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. 226 Nassau Ave, Greenpoint, Brooklyn"
            style={inputStyle}
          />
        </div>

        {/* Comments */}
        <div>
          <label style={labelStyle}>
            {isEdit ? "What needs to change?" : "Anything else we should know?"}
            {isEdit && <span style={{ color: "var(--cr-brown)" }}> *</span>}
            {!isEdit && <span style={{ color: "#9C6B3C", fontWeight: 400 }}> (optional)</span>}
          </label>
          <textarea
            required={isEdit}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder={isEdit ? "Describe what's out of date or incorrect…" : "Hours, seasonal availability, what makes it special…"}
            rows={4}
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
          />
        </div>

        {error && <p style={{ fontSize: "13px", color: "#c0392b", margin: 0 }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 4,
            padding: "12px 24px",
            background: loading ? "#c8a98a" : "var(--cr-brown)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: "15px",
            fontWeight: 600,
            cursor: loading ? "default" : "pointer",
            letterSpacing: "-0.01em",
            fontFamily: "inherit",
          }}
        >
          {loading ? "Sending…" : isEdit ? "Submit edit" : "Submit spot"}
        </button>
      </form>
    </div>
  );
}

const ctaStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "10px 24px",
  background: "var(--cr-brown)",
  color: "#fff",
  borderRadius: 8,
  textDecoration: "none",
  fontSize: "14px",
  fontWeight: 600,
};

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
  fontFamily: "inherit",
};
