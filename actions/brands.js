// actions/brands.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadFileServerAction } from "@/actions/files";



export async function fetchBrands() {
  try {
    const brands = await prisma.brand.findMany({
      where: { status: "active" },
      include: {
        _count: {
          select: { Product: true },
        },
      },
      orderBy: { brandName: "asc" },
    });
    return { success: true, data: brands };
  } catch (error) {
    console.error("Brands fetch error:", error.message);
    return { success: false, error: "Failed to fetch brands" };
  }
}

export async function createBrand(data, file) {
  try {
    let pictureUrl = data.picture || null;
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("aspectRatio", "original");
      const uploadResult = await uploadFileServerAction(formData, { maxSizeMB: 5 });
      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || "File upload failed");
      }
      pictureUrl = uploadResult.url;
    }

    const brand = await prisma.brand.create({
      data: {
        brandName: data.brandName,
        brandCode: data.brandCode,
        picture: pictureUrl,
        memo: data.memo,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/brands");
    return { success: true, data: brand };
  } catch (error) {
    console.error("Brand creation error:", error.message);
    return { success: false, error: error.message || "Failed to create brand" };
  }
}

export async function updateBrand(brandId, data, file) {
  try {
    let pictureUrl = data.picture || null;
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("aspectRatio", "original");
      const uploadResult = await uploadFileServerAction(formData, { maxSizeMB: 5 });
      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || "File upload failed");
      }
      pictureUrl = uploadResult.url;
    }

    const brand = await prisma.brand.update({
      where: { brandId },
      data: {
        brandName: data.brandName,
        brandCode: data.brandCode,
        picture: pictureUrl,
        memo: data.memo,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/brands");
    return { success: true, data: brand };
  } catch (error) {
    console.error("Brand update error:", error.message);
    return { success: false, error: error.message || "Failed to update brand" };
  }
}

export async function deleteBrand(brandId) {
  try {
    await prisma.brand.update({
      where: { brandId },
      data: { status: "inactive" },
    });
    revalidatePath("/brands");
    return { success: true };
  } catch (error) {
    console.error("Brand deletion error:", error.message);
    return { success: false, error: "Failed to delete brand" };
  }
}