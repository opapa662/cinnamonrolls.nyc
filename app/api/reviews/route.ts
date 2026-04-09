import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL ?? "papa.olivia@gmail.com";

// GET /api/reviews?location_id=xxx
// Returns all approved reviews for a location
export async function GET(req: NextRequest) {
  const locationId = req.nextUrl.searchParams.get("location_id");
  if (!locationId) {
    return NextResponse.json({ error: "location_id required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("reviews")
    .select("id, reviewer_name, rating, body, visited_at, roll_style_tried, created_at")
    .eq("location_id", locationId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }

  return NextResponse.json({ reviews: data ?? [] });
}

// POST /api/reviews
// Body: { location_id, reviewer_name, reviewer_email?, rating, body, visited_at?, roll_style_tried? }
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { location_id, reviewer_name, reviewer_email, rating, body: reviewBody, visited_at, roll_style_tried } = body;

  // Validate required fields
  if (!location_id || typeof location_id !== "string") {
    return NextResponse.json({ error: "location_id required" }, { status: 400 });
  }
  if (!reviewer_name || typeof reviewer_name !== "string" || reviewer_name.trim().length < 1) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }
  if (!rating || typeof rating !== "number" || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return NextResponse.json({ error: "Rating must be 1–5" }, { status: 400 });
  }
  if (!reviewBody || typeof reviewBody !== "string" || reviewBody.trim().length < 15) {
    return NextResponse.json({ error: "Review must be at least 15 characters" }, { status: 400 });
  }
  if (reviewer_email && (typeof reviewer_email !== "string" || !reviewer_email.includes("@"))) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  // Verify location exists
  const { data: location } = await supabaseAdmin
    .from("locations")
    .select("id, name")
    .eq("id", location_id)
    .eq("visible", true)
    .single();

  if (!location) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  // Insert review as pending
  const { error: insertError } = await supabaseAdmin.from("reviews").insert({
    location_id,
    reviewer_name: reviewer_name.trim(),
    reviewer_email: reviewer_email ? (reviewer_email as string).trim() : null,
    rating,
    body: (reviewBody as string).trim(),
    visited_at: visited_at || null,
    roll_style_tried: roll_style_tried ? (roll_style_tried as string).trim() : null,
    status: "pending",
  });

  if (insertError) {
    console.error("Review insert error:", insertError);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }

  // Notify via email
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
  await resend.emails.send({
    from: "cinnamonrolls.nyc <onboarding@resend.dev>",
    to: NOTIFY_EMAIL,
    subject: `New review pending — ${location.name}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;color:#3d1c02">
        <p>A new review needs approval on <strong>cinnamonrolls.nyc</strong>.</p>
        <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">
          <tr><td style="padding:6px 12px 6px 0;color:#666;vertical-align:top">Location</td><td style="padding:6px 0">${location.name}</td></tr>
          <tr><td style="padding:6px 12px 6px 0;color:#666">Reviewer</td><td style="padding:6px 0">${reviewer_name.toString().trim()}${reviewer_email ? ` &lt;${reviewer_email}&gt;` : ""}</td></tr>
          <tr><td style="padding:6px 12px 6px 0;color:#666">Rating</td><td style="padding:6px 0">${stars} (${rating}/5)</td></tr>
          <tr><td style="padding:6px 12px 6px 0;color:#666;vertical-align:top">Review</td><td style="padding:6px 0;white-space:pre-wrap">${(reviewBody as string).trim()}</td></tr>
          ${visited_at ? `<tr><td style="padding:6px 12px 6px 0;color:#666">Visited</td><td style="padding:6px 0">${visited_at}</td></tr>` : ""}
          ${roll_style_tried ? `<tr><td style="padding:6px 12px 6px 0;color:#666">Roll tried</td><td style="padding:6px 0">${roll_style_tried}</td></tr>` : ""}
        </table>
        <p><a href="https://cinnamonrolls.nyc/admin-opdl-stfrancis" style="color:#8b4513">Review in admin →</a></p>
      </div>
    `,
  }).catch((err) => console.error("Resend error:", err));

  return NextResponse.json({ ok: true });
}
