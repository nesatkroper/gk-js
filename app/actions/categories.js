"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadFileServerAction } from "./files";
import { generateCategoryCode } from "@/lib/utils";

export async function fetchCategories() {
  try {
    const categories = await prisma.category.findMany({
      where: { status: "active" },
      include: {
        _count: {
          select: { Product: true },
        },
      },
      orderBy: { categoryName: "asc" },
    });
    return { success: true, data: categories };
  } catch (error) {
    console.error("Categories fetch error:", error?.message);
    return { success: false, error: error?.message || "Failed to fetch categories" };
  }
}

export async function createCategory(data, file) {
  try {
    console.log("Creating category with:", {
      data,
      hasFile: !!file,
      fileType: file?.type,
      fileName: file?.name,
    });

    let pictureUrl = null;
    const categoryCode = generateCategoryCode();

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

    console.log("Creating category with picture URL:", pictureUrl);

    const category = await prisma.category.create({
      data: {
        categoryName: data.categoryName,
        categoryCode,
        picture: pictureUrl,
        memo: data.memo || null,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/categories");
    return { success: true, data: category };
  } catch (error) {
    console.error("Category creation error:", error?.message);
    return { success: false, error: error?.message || "Failed to create category" };
  }
}

export async function updateCategory(categoryId, data, file) {
  try {
    console.log("Updating category with:", {
      categoryId,
      data,
      hasFile: !!file,
      fileType: file?.type,
      fileName: file?.name,
    });

    const currentCategory = await prisma.category.findUnique({
      where: { categoryId },
      select: { picture: true },
    });

    let pictureUrl = currentCategory?.picture || data.picture || null;

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

    console.log("Updating category with picture URL:", pictureUrl);

    const category = await prisma.category.update({
      where: { categoryId },
      data: {
        categoryName: data.categoryName,
        categoryCode: data.categoryCode,
        picture: pictureUrl,
        memo: data.memo || null,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/categories");
    return { success: true, data: category };
  } catch (error) {
    console.error("Category update error:", error?.message);
    return { success: false, error: error?.message || "Failed to update category" };
  }
}

export async function deleteCategory(categoryId) {
  try {
    await prisma.category.update({
      where: { categoryId },
      data: { status: "inactive" },
    });
    revalidatePath("/categories");
    return { success: true };
  } catch (error) {
    console.error("Category deletion error:", error?.message);
    return { success: false, error: error?.message || "Failed to delete category" };
  }
}




// // actions/categories.ts
// "use server";

// import prisma from "@/lib/prisma";
// import { generateCategoryCode } from "@/lib/utils";
// import { revalidatePath } from "next/cache";
// import { uploadFileServerAction } from "./files";

// export async function fetchCategories() {
//   try {
//     const categories = await prisma.category.findMany({
//       where: { status: "active" },
//       include: {
//         _count: {
//           select: { Product: true },
//         },
//       },
//       orderBy: { categoryName: "asc" },
//     });
//     return { success: true, data: categories };
//   } catch (error) {
//     console.error("Categories fetch error:", error);
//     return { success: false, error: "Failed to fetch categories" };
//   }
// }

// // Create a new category
// export async function createCategory(data, file) {
//   let pictureUrl = data.picture || null;
//   try {
//     const categoryCode = generateCategoryCode();
//     if (file) {
//       const formData = new FormData();
//       formData.append("file", file);
//       formData.append("aspectRatio", "original");
//       const uploadResult = await uploadFileServerAction(formData, { maxSizeMB: 5 });
//       if (!uploadResult.success || !uploadResult.url) {
//         throw new Error(uploadResult.error || "File upload failed");
//       }
//       pictureUrl = uploadResult.url;
//     }
//     const category = await prisma.category.create({
//       data: {
//         categoryName: data.categoryName,
//         categoryCode,
//         picture: pictureUrl,
//         picture: data.picture,
//         memo: data.memo,
//         updatedAt: new Date(),
//       },
//     });
//     revalidatePath("/categories");
//     return { success: true, data: category };
//   } catch (error) {
//     console.error("Category creation error:", error);
//     return { success: false, error: "Failed to create category" };
//   }
// }

// // Update an existing category
// export async function updateCategory(categoryId, data) {
//   try {
//     const category = await prisma.category.update({
//       where: { categoryId },
//       data: {
//         categoryName: data.categoryName,
//         categoryCode: data.categoryCode,
//         picture: data.picture,
//         memo: data.memo,
//         updatedAt: new Date(),
//       },
//     });
//     revalidatePath("/categories");
//     return { success: true, data: category };
//   } catch (error) {
//     console.error("Category update error:", error);
//     return { success: false, error: "Failed to update category" };
//   }
// }

// // Delete a category
// export async function deleteCategory(categoryId) {
//   try {
//     await prisma.category.update({
//       where: { categoryId },
//       data: { status: "inactive" },
//     });
//     revalidatePath("/categories");
//     return { success: true };
//   } catch (error) {
//     console.error("Category deletion error:", error);
//     return { success: false, error: "Failed to delete category" };
//   }
// }