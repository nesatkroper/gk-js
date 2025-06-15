"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadFileServerAction } from "@/app/actions/files";
import { generateBranchCode } from "@/lib/utils";

export async function getBranches() {
  try {
    const branches = await prisma.branch.findMany({
      where: { status: "active" },
      orderBy: { branchName: "asc" },
    });
    return { success: true, data: branches };
  } catch (error) {
    console.error("Branches fetch error:", error?.message);
    return { success: false, error: "Failed to fetch branches" };
  }
}

export async function getBranchById(branchId) {
  try {
    if (!branchId) throw new Error("Branch ID is required");
    const branch = await prisma.branch.findUnique({ where: { branchId } });
    if (!branch) throw new Error("Branch not found");
    return { success: true, data: branch };
  } catch (error) {
    console.error("Branch fetch error:", error?.message);
    return { success: false, error: "Failed to fetch branch" };
  }
}

export async function createBranch(data, file) {
  try {
    console.log("Creating branch with:", {
      data,
      hasFile: !!file,
      fileType: file?.type,
      fileName: file?.name,
    });

    if (!data.branchName) throw new Error("Branch name is required");

    let pictureUrl = null;
    const branchCode = generateBranchCode();

    if (file && file instanceof File) {
      console.log("Uploading file:", file.name);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("aspectRatio", "original");

      const uploadResult = await uploadFileServerAction(formData, { maxSizeMB: 5 });

      console.log("Upload result:", uploadResult);

      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || "File upload failed");
      }
      pictureUrl = uploadResult.url;
    }

    console.log("Creating branch with picture URL:", pictureUrl);

    const branch = await prisma.branch.create({
      data: {
        branchName: data.branchName,
        branchCode,
        picture: pictureUrl,
        tel: data.tel || null,
        memo: data.memo || null,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    revalidatePath("/branches");
    return { success: true, data: branch };
  } catch (error) {
    console.error("Branch creation error:", error?.message);
    if (error.code === "P2002") {
      return { success: false, error: `Duplicate ${error.meta?.target?.join(", ") || "field"}` };
    }
    return { success: false, error: error?.message || "Failed to create branch" };
  }
}

export async function updateBranch(branchId, data, file) {
  try {
    console.log("Updating branch with:", {
      branchId,
      data,
      hasFile: !!file,
      fileType: file?.type,
      fileName: file?.name,
    });

    if (!branchId) throw new Error("Branch ID is required");

    const currentBranch = await prisma.branch.findUnique({
      where: { branchId },
      select: { picture: true },
    });

    let pictureUrl = currentBranch?.picture || data.picture || null;

    if (file && file instanceof File) {
      console.log("Uploading new file:", file.name);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("aspectRatio", "original");

      const uploadResult = await uploadFileServerAction(formData, { maxSizeMB: 5 });

      console.log("Upload result:", uploadResult);

      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || "File upload failed");
      }
      pictureUrl = uploadResult.url;
    }

    console.log("Updating branch with picture URL:", pictureUrl);

    const branch = await prisma.branch.update({
      where: { branchId },
      data: {
        branchName: data.branchName,
        picture: pictureUrl,
        tel: data.tel || null,
        memo: data.memo || null,
        status: data.status || "active",
        updatedAt: new Date(),
      },
    });

    revalidatePath("/branches");
    return { success: true, data: branch };
  } catch (error) {
    console.error("Branch update error:", error?.message);
    if (error.code === "P2025") {
      return { success: false, error: "Branch not found" };
    }
    return { success: false, error: error?.message || "Failed to update branch" };
  }
}

export async function deleteBranch(branchId) {
  try {
    if (!branchId) throw new Error("Branch ID is required");
    await prisma.branch.update({
      where: { branchId },
      data: { status: "inactive" },
    });
    revalidatePath("/branches");
    return { success: true };
  } catch (error) {
    console.error("Branch deletion error:", error?.message);
    if (error.code === "P2025") {
      return { success: false, error: "Branch not found" };
    }
    return { success: false, error: error?.message || "Failed to delete branch" };
  }
}


