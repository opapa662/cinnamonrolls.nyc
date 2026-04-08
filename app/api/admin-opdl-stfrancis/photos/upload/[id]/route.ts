import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import sharp from "sharp";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (req.cookies.get("cr_admin")?.value !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const raw = Buffer.from(await file.arrayBuffer());

  // Convert everything to JPEG — handles HEIC, PNG, WebP, TIFF, etc.
  const converted = await sharp(raw).rotate().jpeg({ quality: 90 }).toBuffer();

  const filename = `${id}-${Date.now()}.jpg`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("location-photos")
    .upload(filename, converted, { contentType: "image/jpeg", upsert: true });

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
