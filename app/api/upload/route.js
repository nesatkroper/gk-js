import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import sharp from "sharp"

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")
    const aspectRatio = (formData.get("aspectRatio")) || "original"

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/bmp", "image/tiff"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    const uploadsDir = join(process.cwd(), "public", "uploads")
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_").replace(/\.[^/.]+$/, "")
    const filename = `${timestamp}_${originalName}.webp`
    const filepath = join(uploadsDir, filename)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)


    let sharpInstance = sharp(buffer)


    const metadata = await sharpInstance.metadata()

    if (aspectRatio === "1:1") {
      sharpInstance = sharpInstance.resize({
        width: 800,
        height: 800,
        fit: sharp.fit.cover,
        position: sharp.strategy.attention,
      })
    } else if (aspectRatio === "3:4") {
      sharpInstance = sharpInstance.resize({
        width: 600,
        height: 800,
        fit: sharp.fit.cover,
        position: sharp.strategy.attention,
      })
    } else {
      sharpInstance = sharpInstance.resize({
        width: 800,
        height: 800,
        fit: sharp.fit.inside,
        withoutEnlargement: true,
      })
    }

    const processedImageBuffer = await sharpInstance.webp({ quality: 80 }).toBuffer()

    await writeFile(filepath, processedImageBuffer)

    const fileUrl = `/uploads/${filename}`

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: filename,
      originalSize: buffer.length,
      processedSize: processedImageBuffer.length,
      compressionRatio: Math.round((1 - processedImageBuffer.length / buffer.length) * 100),
      format: "webp",
      width: aspectRatio === "1:1" ? 800 : aspectRatio === "3:4" ? 600 : Math.min(metadata.width || 800, 800),
      height: aspectRatio === "1:1" || aspectRatio === "3:4" ? 800 : Math.min(metadata.height || 800, 800),
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

