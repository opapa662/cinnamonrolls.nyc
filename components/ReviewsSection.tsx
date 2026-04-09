"use client";

import { useState, useEffect, useCallback } from "react";

interface Review {
  id: string;
  reviewer_name: string;
  rating: number;
  body: string;
  visited_at: string | null;
  roll_style_tried: string | null;
  created_at: string;
}

interface Props {
  locationId: string;
  locationName: string;
}

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span aria-label={`${rating} out of 5 stars`} style={{ display: "inline-flex", gap: 1 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ fontSize: size, color: s <= rating ? "#e8a020" : "rgba(139,69,19,0.18)", lineHeight: 1 }}>★</span>
      ))}
    </span>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (r: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: 4 }} role="group" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${s} star${s !== 1 ? "s" : ""}`}
          style={{
            background: "none", border: "none", cursor: "pointer", padding: 2,
            fontSize: 28, lineHeight: 1,
            color: s <= (hovered || value) ? "#e8a020" : "rgba(139,69,19,0.2)",
            transition: "color 0.1s",
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;
  return `${Math.floor(months / 12)} year${Math.floor(months / 12) !== 1 ? "s" : ""} ago`;
}

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box",
  padding: "10px 14px", fontSize: 14,
  border: "1px solid rgba(139,69,19,0.2)", borderRadius: 8,
  background: "#fff", color: "var(--cr-brown-dark)",
  fontFamily: "var(--font-inter), -apple-system, sans-serif",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 13, fontWeight: 600,
  color: "#5a3a1a", marginBottom: 6,
};

export default function ReviewsSection({ locationId, locationName }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [visitMonth, setVisitMonth] = useState("");
  const [visitYear, setVisitYear] = useState("");
  const [rollStyleTried, setRollStyleTried] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews?location_id=${locationId}`);
      const data = await res.json();
      setReviews(data.reviews ?? []);
    } catch {
      // fail silently — reviews are additive content
    } finally {
      setLoading(false);
    }
  }, [locationId]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Please enter your name.");
    if (rating === 0) return setError("Please select a rating.");
    if (body.trim().length < 15) return setError("Review must be at least 15 characters.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location_id: locationId,
          reviewer_name: name.trim(),
          reviewer_email: email.trim() || undefined,
          rating,
          body: body.trim(),
          visited_at: visitMonth && visitYear ? `${visitYear}-${visitMonth}-01` : undefined,
          roll_style_tried: rollStyleTried.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setSubmitted(true);
        setShowForm(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const avgRating = reviews.length
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
    : null;

  return (
    <div style={{ marginTop: 40 }}>
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", color: "#9C6B3C", margin: 0, textTransform: "uppercase" }}>
            Visitor Reviews
          </h2>
          {avgRating !== null && reviews.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
              <Stars rating={Math.round(avgRating)} size={14} />
              <span style={{ fontSize: 13, color: "#5a3a1a" }}>
                {avgRating} · {reviews.length} review{reviews.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
        {!submitted && (
          <button
            onClick={() => setShowForm((v) => !v)}
            style={{
              padding: "7px 16px", fontSize: 13, fontWeight: 600,
              background: showForm ? "rgba(139,69,19,0.08)" : "var(--cr-brown)",
              color: showForm ? "var(--cr-brown)" : "#fff",
              border: showForm ? "1.5px solid rgba(139,69,19,0.2)" : "none",
              borderRadius: 8, cursor: "pointer",
              fontFamily: "var(--font-inter), -apple-system, sans-serif",
            }}
          >
            {showForm ? "Cancel" : "Write a review"}
          </button>
        )}
      </div>

      {/* Submitted confirmation */}
      {submitted && (
        <div style={{ padding: "16px 20px", background: "#fff8f0", border: "1px solid rgba(139,69,19,0.2)", borderRadius: 10, marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--cr-brown-dark)", marginBottom: 4 }}>Review submitted!</div>
          <div style={{ fontSize: 13, color: "#7A4010", lineHeight: 1.5 }}>
            Thanks for sharing. Your review will appear here after a quick check.
          </div>
        </div>
      )}

      {/* Review form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: "#fff", border: "1px solid rgba(139,69,19,0.12)", borderRadius: 12, padding: "20px", marginBottom: 20 }}>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Your rating <span style={{ color: "#c0392b" }}>*</span></label>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Your name <span style={{ color: "#c0392b" }}>*</span></label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane D."
              maxLength={80}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>
              Your review <span style={{ color: "#c0392b" }}>*</span>
              <span style={{ fontWeight: 400, color: "#9C6B3C", marginLeft: 6 }}>min 15 characters</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={`What was your experience at ${locationName}? How was the cinnamon roll?`}
              rows={4}
              maxLength={1000}
              style={{ ...inputStyle, resize: "none", lineHeight: 1.6 }}
            />
            <div style={{ fontSize: 11, color: "rgba(139,69,19,0.5)", textAlign: "right", marginTop: 3 }}>
              {body.length}/1000
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>When did you visit? <span style={{ fontWeight: 400, color: "#9C6B3C" }}>(optional)</span></label>
              <div style={{ display: "flex", gap: 8 }}>
                <select
                  value={visitMonth}
                  onChange={(e) => setVisitMonth(e.target.value)}
                  style={{ ...inputStyle, flex: 1, paddingRight: 44 }}
                >
                  <option value="">Month</option>
                  {["01","02","03","04","05","06","07","08","09","10","11","12"].map((m, i) => (
                    <option key={m} value={m}>{["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i]}</option>
                  ))}
                </select>
                <select
                  value={visitYear}
                  onChange={(e) => setVisitYear(e.target.value)}
                  style={{ ...inputStyle, flex: 1, paddingRight: 44 }}
                >
                  <option value="">Year</option>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Roll you tried <span style={{ fontWeight: 400, color: "#9C6B3C" }}>(optional)</span></label>
              <input
                type="text"
                value={rollStyleTried}
                onChange={(e) => setRollStyleTried(e.target.value)}
                placeholder="e.g. classic, cardamom"
                maxLength={60}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Email <span style={{ fontWeight: 400, color: "#9C6B3C" }}>(optional, never shown)</span></label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{ fontSize: 13, color: "#c0392b", marginBottom: 14 }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%", padding: "12px 24px", fontSize: 14, fontWeight: 700,
              background: "var(--cr-brown)", color: "#fff", border: "none", borderRadius: 8,
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.6 : 1,
              fontFamily: "var(--font-inter), -apple-system, sans-serif",
            }}
          >
            {submitting ? "Submitting…" : "Submit review"}
          </button>
        </form>
      )}

      {/* Reviews list */}
      {loading ? (
        <div style={{ padding: "24px 0", textAlign: "center", color: "rgba(139,69,19,0.4)", fontSize: 13 }}>Loading reviews…</div>
      ) : reviews.length === 0 ? (
        <div style={{ padding: "24px 20px", background: "#fff", border: "1px solid rgba(139,69,19,0.1)", borderRadius: 10, textAlign: "center" }}>
          <div style={{ fontSize: 14, color: "#9C6B3C", marginBottom: 6 }}>No reviews yet</div>
          <div style={{ fontSize: 13, color: "rgba(139,69,19,0.5)" }}>Be the first to review {locationName}.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {reviews.map((review) => (
            <div key={review.id} style={{ background: "#fff", border: "1px solid rgba(139,69,19,0.1)", borderRadius: 10, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--cr-brown-dark)", marginBottom: 4 }}>
                    {review.reviewer_name}
                  </div>
                  <Stars rating={review.rating} size={14} />
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 12, color: "rgba(139,69,19,0.5)" }}>{timeAgo(review.created_at)}</div>
                  {review.visited_at && (
                    <div style={{ fontSize: 11, color: "rgba(139,69,19,0.4)", marginTop: 2 }}>
                      Visited {review.visited_at.slice(0, 7)}
                    </div>
                  )}
                </div>
              </div>

              {review.roll_style_tried && (
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20, background: "#fff8ed", color: "#8B4513", border: "1px solid rgba(139,69,19,0.2)" }}>
                    {review.roll_style_tried}
                  </span>
                </div>
              )}

              <p style={{ fontSize: 14, color: "#5a3a1a", lineHeight: 1.65, margin: 0 }}>
                {review.body}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
