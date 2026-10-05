import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided in upload request." },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
      return NextResponse.json(
        {
          error: `Unsupported file format (${file.type}). Allowed formats: JPEG, PNG, and WebP.`,
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: `File size exceeds the 10MB limit. Current size: ${(
            file.size / (1024 * 1024)
          ).toFixed(2)} MB.`,
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Determine safe extension
    let ext = "jpg";
    if (file.type === "image/png") ext = "png";
    else if (file.type === "image/webp") ext = "webp";
    else if (file.type === "image/jpeg" || file.type === "image/jpg") ext = "jpg";

    const uniqueId = crypto.randomBytes(12).toString("hex");
    const sanitizedOriginalName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .slice(0, 30);
    const fileName = `squad_${Date.now()}_${uniqueId}_${sanitizedOriginalName}.${ext}`;
    const filePath = path.join(uploadsDir, fileName);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${fileName}`;

    return NextResponse.json(
      {
        success: true,
        url: publicUrl,
        fileName,
        size: file.size,
        mimeType: file.type,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Image upload processing error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error during image upload" },
      { status: 500 }
    );
  }
}
