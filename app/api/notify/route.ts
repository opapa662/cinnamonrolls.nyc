import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL ?? "papa.olivia@gmail.com";
const WEBHOOK_SECRET = process.env.NOTIFY_WEBHOOK_SECRET;

interface SupabaseWebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: Record<string, unknown>;
  schema: string;
}

export async function POST(req: NextRequest) {
  // Verify shared secret
  const secret = req.nextUrl.searchParams.get("secret");
  if (!WEBHOOK_SECRET || secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: SupabaseWebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (payload.type !== "INSERT") {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const { table, record } = payload;
  let subject: string;
  let body: string;

  if (table === "contact_submissions") {
    subject = "New contact message — cinnamonrolls.nyc";
    body = `
      <p>Someone sent you a message on <strong>cinnamonrolls.nyc</strong>.</p>
      <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">
        <tr><td style="padding:6px 12px 6px 0;color:#666;vertical-align:top">Name</td><td style="padding:6px 0">${record.name ?? "(not provided)"}</td></tr>
        <tr><td style="padding:6px 12px 6px 0;color:#666;vertical-align:top">Email</td><td style="padding:6px 0"><a href="mailto:${record.email}">${record.email}</a></td></tr>
        <tr><td style="padding:6px 12px 6px 0;color:#666;vertical-align:top">Message</td><td style="padding:6px 0;white-space:pre-wrap">${record.message}</td></tr>
        <tr><td style="padding:6px 12px 6px 0;color:#666">Received</td><td style="padding:6px 0">${new Date(record.created_at as string).toLocaleString("en-US", { timeZone: "America/New_York" })}</td></tr>
      </table>
    `;
  } else if (table === "submissions") {
    const typeLabel = record.submission_type === "addition" ? "New spot addition" : "Edit request";
    subject = `${typeLabel} — cinnamonrolls.nyc`;
    body = `
      <p>A <strong>${typeLabel.toLowerCase()}</strong> was submitted on <strong>cinnamonrolls.nyc</strong>.</p>
      <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">
        <tr><td style="padding:6px 12px 6px 0;color:#666;vertical-align:top">Type</td><td style="padding:6px 0">${record.submission_type}</td></tr>
        ${record.name ? `<tr><td style="padding:6px 12px 6px 0;color:#666">Name</td><td style="padding:6px 0">${record.name}</td></tr>` : ""}
        ${record.address ? `<tr><td style="padding:6px 12px 6px 0;color:#666">Address</td><td style="padding:6px 0">${record.address}</td></tr>` : ""}
        ${record.website ? `<tr><td style="padding:6px 12px 6px 0;color:#666">Website</td><td style="padding:6px 0"><a href="${record.website}">${record.website}</a></td></tr>` : ""}
        ${record.comments ? `<tr><td style="padding:6px 12px 6px 0;color:#666;vertical-align:top">Comments</td><td style="padding:6px 0;white-space:pre-wrap">${record.comments}</td></tr>` : ""}
        <tr><td style="padding:6px 12px 6px 0;color:#666">Received</td><td style="padding:6px 0">${new Date(record.created_at as string).toLocaleString("en-US", { timeZone: "America/New_York" })}</td></tr>
      </table>
    `;
  } else {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const { error } = await resend.emails.send({
    from: "cinnamonrolls.nyc <onboarding@resend.dev>",
    to: NOTIFY_EMAIL,
    subject,
    html: `<div style="font-family:sans-serif;max-width:520px;color:#3d1c02">${body}</div>`,
  });

  if (error) {
    console.error("Resend error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
