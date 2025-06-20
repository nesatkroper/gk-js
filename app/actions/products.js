"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadFileServerAction } from "@/app/actions/files";
import { generateProductCode } from "@/lib/utils";

function serializeProduct(product) {
  return {
    productId: product.productId,
    productName: product.productName,
    productCode: product.productCode,
    picture: product.picture,
    unit: product.unit,
    capacity: product.capacity ? product.capacity.toNumber() : null,
    sellPrice: product.sellPrice.toNumber(),
    costPrice: product.costPrice.toNumber(),
    discountRate: product.discountRate ? product.discountRate.toNumber() : 0,
    desc: product.desc,
    categoryId: product.categoryId,
    brandId: product.brandId,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}


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
    console.error("Products fetch error:", error?.message);
    return { success: false, error: error?.message || "Failed to fetch products" };
  }
}

export async function fetchProduct(options = {}) {
  const {
    getAllData = false,
    getById = null,
    getBasicInfo = false,
  } = options;

  try {
    let query = {
      where: { status: "active" },
      include: {
        Category: { select: { categoryName: true } },
        Brand: { select: { brandName: true } },
      },
      orderBy: { productName: "asc" },
    };

    if (getById) {
      query.where.productId = getById;
      query.include.Stock = { select: { quantity: true } };
    }

    if (getBasicInfo) {
      query.select = {
        productId: true,
        productName: true,
        sellPrice: true,
        Category: { select: { categoryName: true } },
        Brand: { select: { brandName: true } },
        Stock: { select: { quantity: true, branchId: true } },
      };
      delete query.include; 
    } 
    else if (getAllData) {
      query.include.Stock = { select: { quantity: true } };
    }

    const products = await prisma.product.findMany(query);
    const serializedProducts = products.map((product) => {
      const baseProduct = {
        ...product,
        sellPrice: product.sellPrice?.toNumber() || 0,
      };

      if (!getBasicInfo) {
        return {
          ...baseProduct,
          capacity: product.capacity?.toNumber() || null,
          costPrice: product.costPrice?.toNumber() || 0,
          ...(product.Stock ? { stock: product.Stock.quantity } : {}),
        };
      }

      return baseProduct;
    });

    if (getById) {
      return { 
        success: true, 
        data: serializedProducts[0] || null 
      };
    }

    return { success: true, data: serializedProducts };
  } catch (error) {
    console.error("Products fetch error:", error?.message);
    return { 
      success: false, 
      error: error?.message || "Failed to fetch products" 
    };
  }
}

export async function createProduct(data, file) {
  try {
    console.log("Creating product with:", {
      data,
      hasFile: !!file,
      fileType: file?.type,
      fileName: file?.name,
    });

    // Validation
    if (!data.productName) {
      throw new Error("Product name is required");
    }
    if (!data.categoryId) {
      throw new Error("Category is required");
    }
    if (data.sellPrice < 0) {
      throw new Error("Sell price must be non-negative");
    }
    if (data.costPrice < 0) {
      throw new Error("Cost price must be non-negative");
    }

    let pictureUrl = null;
    const productCode = data.productCode || generateProductCode();

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

    console.log("Creating product with picture URL:", pictureUrl);

    const product = await prisma.product.create({
      data: {
        productName: data.productName,
        productCode,
        picture: pictureUrl,
        unit: data.unit || null,
        capacity: data.capacity ? parseFloat(data.capacity) : null,
        sellPrice: parseFloat(data.sellPrice),
        costPrice: parseFloat(data.costPrice),
        discountRate: data.discountRate ? parseFloat(data.discountRate) : 0,
        desc: data.desc || null,
        categoryId: data.categoryId || null,
        brandId: data.brandId || null,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/products");
    return {
      success: true,
      data: serializeProduct(product),
    };    
  } catch (error) {
    console.error("Product creation error:", error?.message);
    return { success: false, error: error?.message || "Failed to create product" };
  }
}

export async function updateProduct(productId, data, file) {
  try {
    console.log("Updating product with:", {
      productId,
      data,
      hasFile: !!file,
      fileType: file?.type,
      fileName: file?.name,
    });

    // Validation
    if (!data.productName) {
      throw new Error("Product name is required");
    }
    if (!data.categoryId) {
      throw new Error("Category is required");
    }
    if (data.sellPrice < 0) {
      throw new Error("Sell price must be non-negative");
    }
    if (data.costPrice < 0) {
      throw new Error("Cost price must be non-negative");
    }

    const currentProduct = await prisma.product.findUnique({
      where: { productId },
      select: { picture: true },
    });

    let pictureUrl = currentProduct?.picture || null;

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

    console.log("Updating product with picture URL:", pictureUrl);

    const product = await prisma.product.update({
      where: { productId },
      data: {
        productName: data.productName,
        productCode: data.productCode || null,
        picture: pictureUrl,
        unit: data.unit || null,
        capacity: data.capacity ? parseFloat(data.capacity) : null,
        sellPrice: parseFloat(data.sellPrice),
        costPrice: parseFloat(data.costPrice),
        discountRate: data.discountRate ? parseFloat(data.discountRate) : 0,
        desc: data.desc || null,
        categoryId: data.categoryId || null,
        brandId: data.brandId || null,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/products");
    return {
      success: true,
      data: serializeProduct(product),
    };    
  } catch (error) {
    console.error("Product update error:", error?.message);
    return { success: false, error: error?.message || "Failed to update product" };
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
    console.error("Product deletion error:", error?.message);
    return { success: false, error: error?.message || "Failed to delete product" };
  }
}


