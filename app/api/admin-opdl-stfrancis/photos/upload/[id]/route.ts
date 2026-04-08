import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import sharp from "sharp";
import heicConvert from "heic-convert";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (req.cookies.get("cr_admin")?.value !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const raw = Buffer.from(await file.arrayBuffer());
  const isHeic = file.type === "image/heic" || file.type === "image/heif"
    || file.name.toLowerCase().endsWith(".heic")
    || file.name.toLowerCase().endsWith(".heif");

  let jpeg: Buffer;
  if (isHeic) {
    // heic-convert is pure JS/WASM — works on Vercel without native libs
    const converted = await heicConvert({ buffer: raw.buffer, format: "JPEG", quality: 0.9 });
    jpeg = Buffer.from(converted);
  } else {
    // sharp handles JPEG/PNG/WebP; .rotate() auto-corrects EXIF orientation
    jpeg = await sharp(raw).rotate().jpeg({ quality: 90 }).toBuffer();
  }

  const filename = `${id}-${Date.now()}.jpg`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("location-photos")
    .upload(filename, jpeg, { contentType: "image/jpeg", upsert: true });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from("location-photos")
    .getPublicUrl(filename);

  const { error: updateError } = await supabaseAdmin
    .from("locations")
    .update({ photo_url: publicUrl, photo_source: "own", photo_attribution: null })
    .eq("id", id);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  return NextResponse.json({ ok: true, photo_url: publicUrl });
}
