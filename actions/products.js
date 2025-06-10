
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadFileServerAction } from "@/actions/files";



export async function fetchProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { status: "active" },
      include: {
        Category: { select: { categoryName: true } },
        Brand: { select: { brandName: true } },
        Stock: { select: { quantity: true } },
      },
      orderBy: { productName: "asc" },
    });

    const serializedProducts = products.map((product) => ({
      ...product,
      capacity: product.capacity ? product.capacity.toNumber() : null,
      sellPrice: product.sellPrice.toNumber(),
      costPrice: product.costPrice.toNumber(),
    }));

    return { success: true, data: serializedProducts };
  } catch (error) {
    console.error("Products fetch error:", error.message);
    return { success: false, error: "Failed to fetch products" };
  }
}

export async function createProduct(data, file) {
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

    const product = await prisma.product.create({
      data: {
        productName: data.productName,
        productCode: data.productCode,
        picture: pictureUrl,
        unit: data.unit,
        capacity: data.capacity ? parseFloat(data.capacity) : null,
        sellPrice: parseFloat(data.sellPrice),
        costPrice: parseFloat(data.costPrice),
        discountRate: data.discountRate,
        desc: data.desc,
        categoryId: data.categoryId,
        brandId: data.brandId,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/products");
    return {
      success: true, data: {
        ...product,
        capacity: product.capacity ? product.capacity.toNumber() : null,
        sellPrice: product.sellPrice.toNumber(),
        costPrice: product.costPrice.toNumber(),
      }
    };
  } catch (error) {
    console.error("Product creation error:", error.message);
    return { success: false, error: error.message || "Failed to create product" };
  }
}

export async function updateProduct(productId, data, file) {
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

    const product = await prisma.product.update({
      where: { productId },
      data: {
        productName: data.productName,
        productCode: data.productCode,
        picture: pictureUrl,
        unit: data.unit,
        capacity: data.capacity ? parseFloat(data.capacity) : null,
        sellPrice: parseFloat(data.sellPrice),
        costPrice: parseFloat(data.costPrice),
        discountRate: data.discountRate,
        desc: data.desc,
        categoryId: data.categoryId,
        brandId: data.brandId,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/products");
    return {
      success: true, data: {
        ...product,
        capacity: product.capacity ? product.capacity.toNumber() : null,
        sellPrice: product.sellPrice.toNumber(),
        costPrice: product.costPrice.toNumber(),
      }
    };
  } catch (error) {
    console.error("Product update error:", error.message);
    return { success: false, error: error.message || "Failed to update product" };
  }
}

export async function deleteProduct(productId) {
  try {
    await prisma.product.update({
      where: { productId },
      data: { status: "inactive" },
    });
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    console.error("Product deletion error:", error.message);
    return { success: false, error: "Failed to delete product" };
  }
}


// // actions/products.ts
// "use server";

// import { prisma } from "@/lib/prisma";
// import { revalidatePath } from "next/cache";
// import { uploadFileServerAction } from "@/actions/files";

// export interface CreateProductData {
//   productName;
//   productCode? | null;
//   picture? | null;
//   unit? | null;
//   capacity? | null;
//   sellPrice;
//   costPrice: string;
//   discountRate: number;
//   desc?: string | null;
//   categoryId: string;
//   brandId?: string | null;
// }

// export async function fetchProducts() {
//   try {
//     const products = await prisma.product.findMany({
//       where: { status: "active" },
//       include: {
//         Category: { select: { categoryName: true } },
//         Brand: { select: { brandName: true } },
//         Stock: { select: { quantity: true } },
//       },
//       orderBy: { productName: "asc" },
//     });
//     return { success: true, data: products };
//   } catch (error) {
//     console.error("Products fetch error:", error.message);
//     return { success: false, error: "Failed to fetch products" };
//   }
// }

// export async function createProduct(data: CreateProductData, file?: File | null) {
//   try {
//     let pictureUrl: string | null = data.picture || null;
//     if (file) {
//       const formData = new FormData();
//       formData.append("file", file);
//       formData.append("aspectRatio", "original"); // Match ProductsPage usage
//       const uploadResult = await uploadFileServerAction(formData, { maxSizeMB: 5 });
//       if (!uploadResult.success || !uploadResult.url) {
//         throw new Error(uploadResult.error || "File upload failed");
//       }
//       pictureUrl = uploadResult.url;
//     }

//     const product = await prisma.product.create({
//       data: {
//         productName: data.productName,
//         productCode: data.productCode,
//         picture: pictureUrl,
//         unit: data.unit,
//         capacity: data.capacity ? parseFloat(data.capacity) : null,
//         sellPrice: parseFloat(data.sellPrice),
//         costPrice: parseFloat(data.costPrice),
//         discountRate: data.discountRate,
//         desc: data.desc,
//         categoryId: data.categoryId,
//         brandId: data.brandId,
//         updatedAt: new Date(),
//       },
//     });

//     revalidatePath("/products");
//     return { success: true, data: product };
//   } catch (error) {
//     console.error("Product creation error:", error.message);
//     return { success: false, error: error.message || "Failed to create product" };
//   }
// }

// export async function updateProduct(productId: string, data: CreateProductData, file?: File | null) {
//   try {
//     let pictureUrl: string | null = data.picture || null;
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

//     const product = await prisma.product.update({
//       where: { productId },
//       data: {
//         productName: data.productName,
//         productCode: data.productCode,
//         picture: pictureUrl,
//         unit: data.unit,
//         capacity: data.capacity ? parseFloat(data.capacity) : null,
//         sellPrice: parseFloat(data.sellPrice),
//         costPrice: parseFloat(data.costPrice),
//         discountRate: data.discountRate,
//         desc: data.desc,
//         categoryId: data.categoryId,
//         brandId: data.brandId,
//         updatedAt: new Date(),
//       },
//     });

//     revalidatePath("/products");
//     return { success: true, data: product };
//   } catch (error) {
//     console.error("Product update error:", error.message);
//     return { success: false, error: error.message || "Failed to update product" };
//   }
// }

// export async function deleteProduct(productId: string) {
//   try {
//     await prisma.product.update({
//       where: { productId },
//       data: { status: "inactive" },
//     });
//     revalidatePath("/products");
//     return { success: true };
//   } catch (error: any) {
//     console.error("Product deletion error:", error.message);
//     return { success: false, error: "Failed to delete product" };
//   }
// }