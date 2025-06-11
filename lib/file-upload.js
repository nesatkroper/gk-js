import { uploadFileServerAction } from "@/app/actions/files";

// lib/file-upload.ts
export async function uploadFile(
  file,
  options
) {
  const validationError = validateFile(file, options.maxSizeMB);
  if (validationError) {
    throw new Error(validationError);
  }

  const formData = new FormData();
  formData.append("file", file);

  if (options.aspectRatio) {
    formData.append("aspectRatio", options.aspectRatio);
  }

  const result = await uploadFileServerAction(formData, {
    maxSizeMB: options.maxSizeMB,
    allowedTypes: options.allowedTypes,
    aspectRatio: options.aspectRatio,
  });

  if (!result.success || !result.url) {
    throw new Error(result.error || "Upload failed");
  }

  return result.url;
}

export function validateFile(file, maxSizeMB = 10) {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/bmp",
    "image/tiff",
  ];
  if (!allowedTypes.includes(file.type)) {
    return "Please select a valid image file (JPEG, PNG, GIF, WebP, etc.)";
  }

  const maxSize = maxSizeMB * 1024 * 1024;
  if (file.size > maxSize) {
    return `File size must be less than ${maxSizeMB}MB`;
  }

  return null;
}

export function getFilePreviewUrl(file) {
  if (typeof window === "undefined") return "";
  return URL.createObjectURL(file);
}


