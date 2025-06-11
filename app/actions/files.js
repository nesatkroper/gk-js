// actions/files.ts
"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import sharp from "sharp";

export async function uploadFileServerAction(
  formData,
  options
) {
  try {
    const file = formData.get("file");
    const aspectRatio = (formData.get("aspectRatio")) || options.aspectRatio || "original";

    if (!file) {
      return { success: false, error: "No file uploaded" };
    }

    const allowedTypes =
      options.allowedTypes || [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/bmp",
        "image/tiff",
      ];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: "Invalid file type" };
    }

    const maxSizeMB = options.maxSizeMB || 10;
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      return { success: false, error: `File size must be less than ${maxSizeMB}MB` };
    }

    const uploadsDir = join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_").replace(/\.[^/.]+$/, "");
    const filename = `${timestamp}_${originalName}.webp`;
    const filepath = join(uploadsDir, filename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let sharpInstance = sharp(buffer);
    const metadata = await sharpInstance.metadata();

    if (aspectRatio === "1:1") {
      sharpInstance = sharpInstance.resize({
        width: 800,
        height: 800,
        fit: sharp.fit.cover,
        position: sharp.strategy.attention,
      });
    } else if (aspectRatio === "3:4") {
      sharpInstance = sharpInstance.resize({
        width: 600,
        height: 800,
        fit: sharp.fit.cover,
        position: sharp.strategy.attention,
      });
    } else {
      sharpInstance = sharpInstance.resize({
        width: 800,
        height: 800,
        fit: sharp.fit.inside,
        withoutEnlargement: true,
      });
    }

    const processedImageBuffer = await sharpInstance.webp({ quality: 80 }).toBuffer();
    await writeFile(filepath, processedImageBuffer);

    const fileUrl = `/uploads/${filename}`;
    return { success: true, url: fileUrl };
  } catch (error) {
    console.error("Upload error:", error.message);
    return { success: false, error: error.message || "Upload failed" };
  }
}