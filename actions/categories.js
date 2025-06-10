// actions/categories.ts
"use server";

import prisma from "@/lib/prisma";
import { generateCategoryCode } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { CreateCategoryData } from "@/stores/category-store";


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
    console.error("Categories fetch error:", error);
    return { success: false, error: "Failed to fetch categories" };
  }
}

// Create a new category
export async function createCategory(data) {
  try {
    const categoryCode = data.categoryCode || generateCategoryCode();
    const category = await prisma.category.create({
      data: {
        categoryName: data.categoryName,
        categoryCode,
        picture: data.picture,
        memo: data.memo,
        updatedAt: new Date(),
      },
    });
    revalidatePath("/categories");
    return { success: true, data: category };
  } catch (error) {
    console.error("Category creation error:", error);
    return { success: false, error: "Failed to create category" };
  }
}

// Update an existing category
export async function updateCategory(categoryId, data) {
  try {
    const category = await prisma.category.update({
      where: { categoryId },
      data: {
        categoryName: data.categoryName,
        categoryCode: data.categoryCode,
        picture: data.picture,
        memo: data.memo,
        updatedAt: new Date(),
      },
    });
    revalidatePath("/categories");
    return { success: true, data: category };
  } catch (error) {
    console.error("Category update error:", error);
    return { success: false, error: "Failed to update category" };
  }
}

// Delete a category
export async function deleteCategory(categoryId) {
  try {
    await prisma.category.update({
      where: { categoryId },
      data: { status: "inactive" },
    });
    revalidatePath("/categories");
    return { success: true };
  } catch (error) {
    console.error("Category deletion error:", error);
    return { success: false, error: "Failed to delete category" };
  }
}