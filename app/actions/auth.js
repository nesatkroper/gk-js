"use server";

import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

function convertDecimalsToNumbers(obj) {
  if (!obj) return obj;
  const newObj = { ...obj };
  for (const key in newObj) {
    if (newObj[key] instanceof Prisma.Decimal) {
      newObj[key] = newObj[key].toNumber();
    } else if (newObj[key] instanceof Date) {
      newObj[key] = newObj[key].toISOString();
    } else if (typeof newObj[key] === "object") {
      newObj[key] = convertDecimalsToNumbers(newObj[key]);
    }
  }
  return newObj;
}

export async function getAuthRecords() {
  try {
    const auths = await prisma.auth.findMany({
      include: {
        Role: true,
        Employee: {
          include: {
            Branch: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const convertedAuths = auths.map((auth) => convertDecimalsToNumbers(auth));
    return { data: convertedAuths };
  } catch (error) {
    console.error("Error fetching auth records:", error);
    return { error: "Failed to fetch auth records" };
  }
}

export async function createAuthRecord(formData) {
  try {
    const email = formData.get("email");
    const password = formData.get("password");
    const roleId = formData.get("roleId");
    const employeeId = formData.get("employeeId");

    if (!email || !password || !roleId) {
      return { error: "Email, password, and role are required" };
    }

    const existingAuth = await prisma.auth.findUnique({ where: { email } });
    if (existingAuth) {
      return { error: "Email already exists" };
    }

    const roleExists = await prisma.role.findUnique({
      where: { roleId: roleId },
    });
    if (!roleExists) {
      return { error: "Invalid role ID" };
    }

    if (employeeId && employeeId !== "none") {
      const employeeExists = await prisma.employee.findUnique({
        where: { employeeId: employeeId },
      });
      if (!employeeExists) {
        return { error: "Invalid employee ID" };
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const auth = await prisma.auth.create({
      data: {
        email,
        password: hashedPassword,
        roleId: roleId,
        employeeId: employeeId && employeeId !== "none" ? employeeId : null,
        status: "active",
      },
      include: { Role: true, Employee: true },
    });

    const convertedAuth = convertDecimalsToNumbers(auth);
    revalidatePath("/");
    return { data: convertedAuth };
  } catch (error) {
    console.error("Error creating auth record:", error);
    if (error.code === "P2002") {
      return { error: "Unique constraint violation: email or employeeId already exists" };
    }
    if (error.code === "P2003") {
      return { error: "Foreign key constraint violation: invalid roleId or employeeId" };
    }
    return { error: "Failed to create auth record" };
  }
}

export async function updateAuthRecord(id, formData) {
  try {
    const email = formData.get("email");
    const password = formData.get("password");
    const roleId = formData.get("roleId");
    const employeeId = formData.get("employeeId");
    const status = formData.get("status");

    if (roleId) {
      const roleExists = await prisma.role.findUnique({
        where: { roleId: roleId },
      });
      if (!roleExists) {
        return { error: "Invalid role ID" };
      }
    }

    if (employeeId && employeeId !== "none") {
      const employeeExists = await prisma.employee.findUnique({
        where: { employeeId: employeeId },
      });
      if (!employeeExists) {
        return { error: "Invalid employee ID" };
      }
    }

    const updateData = {};
    if (email) updateData.email = email;
    if (password) updateData.password = await bcrypt.hash(password, 12);
    if (roleId) updateData.roleId = roleId;
    if (employeeId && employeeId !== "none") updateData.employeeId = employeeId;
    else if (employeeId === "none") updateData.employeeId = null;
    if (status) updateData.status = status;

    const auth = await prisma.auth.update({
      where: { authId: id },
      data: updateData,
      include: { Role: true, Employee: true },
    });

    const convertedAuth = convertDecimalsToNumbers(auth);
    revalidatePath("/");
    return { data: convertedAuth };
  } catch (error) {
    console.error("Error updating auth record:", error);
    return { error: "Failed to update auth record" };
  }
}

export async function deleteAuthRecord(id) {
  try {
    await prisma.auth.delete({
      where: { authId: id },
    });

    revalidatePath("/");
    return { data: true };
  } catch (error) {
    console.error("Error deleting auth record:", error);
    return { error: "Failed to delete auth record" };
  }
}

