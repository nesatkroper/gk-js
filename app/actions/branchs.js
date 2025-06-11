"use server";

import prisma from "@/lib/prisma";
import { generateBranchCode } from "@/lib/utils";

function serializeData(obj) {
  if (!obj) return obj;
  const newObj = { ...obj };
  for (const key in newObj) {
    if (newObj[key] instanceof Date) {
      newObj[key] = newObj[key].toISOString();
    } else if (typeof newObj[key] === "object") {
      newObj[key] = serializeData(newObj[key]);
    }
  }
  return newObj;
}

export async function getBranches() {
  try {
    const branches = await prisma.branch.findMany({ where: { status: "active" } });
    const serializedBranches = branches.map(serializeData);
    return { data: serializedBranches };
  } catch (error) {
    console.error("Error fetching branches:", error);
    return { error: error.message || "Failed to fetch branches" };
  }
}

export async function getBranchById(branchId) {
  try {
    if (!branchId) throw new Error("Branch ID is required");
    const branch = await prisma.branch.findUnique({ where: { branchId } });
    if (!branch) throw new Error("Branch not found");
    return { data: serializeData(branch) };
  } catch (error) {
    console.error("Error fetching branch:", error);
    return { error: error.message || "Failed to fetch branch" };
  }
}

export async function createBranch(data) {
  try {
    if (!data.branchName) throw new Error("Branch name is required");
    const branchCode = generateBranchCode();
    const branch = await prisma.branch.create({
      data: {
        branchName: data.branchName,
        branchCode,
        picture: data.picture || null,
        tel: data.tel || null,
        memo: data.memo || null,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return { data: serializeData(branch) };
  } catch (error) {
    console.error("Error creating branch:", error);
    if (error.code === "P2002") {
      return { error: `Duplicate ${error.meta?.target?.join(", ") || "field"}` };
    }
    return { error: error.message || "Failed to create branch" };
  }
}

export async function updateBranch(branchId, data) {
  try {
    if (!branchId) throw new Error("Branch ID is required");
    const branch = await prisma.branch.update({
      where: { branchId },
      data: {
        branchName: data.branchName,
        picture: data.picture || null,
        tel: data.tel || null,
        memo: data.memo || null,
        status: data.status || "active",
        updatedAt: new Date(),
      },
    });
    return { data: serializeData(branch) };
  } catch (error) {
    console.error("Error updating branch:", error);
    if (error.code === "P2025") {
      return { error: "Branch not found" };
    }
    return { error: error.message || "Failed to update branch" };
  }
}

export async function deleteBranch(branchId) {
  try {
    if (!branchId) throw new Error("Branch ID is required");
    await prisma.branch.delete({ where: { branchId } });
    return { data: true };
  } catch (error) {
    console.error("Error deleting branch:", error);
    if (error.code === "P2025") {
      return { error: "Branch not found" };
    }
    return { error: error.message || "Failed to delete branch" };
  }
}


// import prisma from "@/lib/prisma";
// import { generateBranchCode } from "@/lib/utils";

// export async function getBranches() {
//   try {
//     return await prisma.branch.findMany({ where: { status: "active" } });
//   } catch (error) {
//     throw new Error(error.message || "Failed to fetch branches");
//   }
// }

// export async function getBranchById(branchId) {
//   try {
//     const branch = await prisma.branch.findUnique({ where: { branchId } });
//     if (!branch) throw new Error("Branch not found");
//     return branch;
//   } catch (error) {
//     throw new Error(error.message || "Failed to fetch branch");
//   }
// }

// export async function createBranch(data) {
//   if (!data.branchName) throw new Error("Branch name is required");

//   const branchCode = generateBranchCode();

//   try {
//     return await prisma.branch.create({
//       data: {
//         branchName: data.branchName,
//         branchCode,
//         picture: data.picture || null,
//         tel: data.tel || null,
//         memo: data.memo || null,
//         status: "active",
//       },
//     });
//   } catch (error) {
//     if (error.code === "P2002") {
//       throw new Error(`Duplicate ${error.meta?.target?.join(", ") || "field"}`);
//     }
//     throw error;
//   }
// }

// export async function updateBranch(branchId, data) {
//   if (!branchId) throw new Error("Branch ID is required");

//   try {
//     return await prisma.branch.update({
//       where: { branchId },
//       data: {
//         branchName: data.branchName,
//         picture: data.picture || null,
//         tel: data.tel || null,
//         memo: data.memo || null,
//         status: data.status || "active",
//         updatedAt: new Date(),
//       },
//     });
//   } catch (error) {
//     if (error.code === "P2025") {
//       throw new Error("Branch not found");
//     }
//     throw error;
//   }
// }

// export async function deleteBranch(branchId) {
//   if (!branchId) throw new Error("Branch ID is required");

//   try {
//     return await prisma.branch.delete({ where: { branchId } });
//   } catch (error) {
//     if (error.code === "P2025") {
//       throw new Error("Branch not found");
//     }
//     throw error;
//   }
// }
