"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function serializeData(obj) {
  if (!obj) return obj;
  const newObj = Array.isArray(obj) ? [...obj] : { ...obj };
  for (const key in newObj) {
    if (newObj[key] instanceof Date) {
      newObj[key] = newObj[key].toISOString();
    } else if (typeof newObj[key] === "object" && newObj[key] !== null) {
      newObj[key] = serializeData(newObj[key]);
    }
  }
  return newObj;
}

export async function getAllProvinces() {
  try {
    const provinces = await prisma.province.findMany({
      orderBy: { name: "asc" },
    });
    return { data: serializeData(provinces) };
  } catch (error) {
    console.error("Error fetching provinces:", error);
    return { error: error.message || "Failed to fetch provinces" };
  }
}

export async function getAllDistricts() {
  try {
    const districts = await prisma.district.findMany({
      orderBy: { name: "asc" },
    });
    return { data: serializeData(districts) };
  } catch (error) {
    console.error("Error fetching districts:", error);
    return { error: error.message || "Failed to fetch districts" };
  }
}

export async function getDistrictsByProvinceId(provinceId) {
  try {
    if (!provinceId || isNaN(Number(provinceId))) {
      throw new Error("Valid Province ID is required");
    }
    const districts = await prisma.district.findMany({
      where: { provinceId: Number(provinceId) },
      orderBy: { name: "asc" },
    });
    return { data: serializeData(districts) };
  } catch (error) {
    console.error("Error fetching districts by provinceId:", error);
    return { error: error.message || "Failed to fetch districts" };
  }
}

export async function getAllCommunes() {
  try {
    const communes = await prisma.commune.findMany({
      orderBy: { name: "asc" },
    });
    return { data: serializeData(communes) };
  } catch (error) {
    console.error("Error fetching communes:", error);
    return { error: error.message || "Failed to fetch communes" };
  }
}

export async function getCommunesByDistrictId(districtId) {
  try {
    if (!districtId || isNaN(Number(districtId))) {
      throw new Error("Valid District ID is required");
    }
    const communes = await prisma.commune.findMany({
      where: { districtId: Number(districtId) },
      orderBy: { name: "asc" },
    });
    return { data: serializeData(communes) };
  } catch (error) {
    console.error("Error fetching communes by districtId:", error);
    return { error: error.message || "Failed to fetch communes" };
  }
}

export async function getAllVillages() {
  try {
    const villages = await prisma.village.findMany({
      orderBy: { name: "asc" },
    });
    return { data: serializeData(villages) };
  } catch (error) {
    console.error("Error fetching villages:", error);
    return { error: error.message || "Failed to fetch villages" };
  }
}

export async function getVillagesByCommuneId(communeId) {
  try {
    if (!communeId || isNaN(Number(communeId))) {
      throw new Error("Valid Commune ID is required");
    }
    const villages = await prisma.village.findMany({
      where: { communeId: Number(communeId) },
      orderBy: { name: "asc" },
    });
    return { data: serializeData(villages) };
  } catch (error) {
    console.error("Error fetching villages by communeId:", error);
    return { error: error.message || "Failed to fetch villages" };
  }
}

export async function getAllAddresses() {
  try {
    const addresses = await prisma.address.findMany({
      where: { status: "active" },
      include: {
        Province: true,
        District: true,
        Commune: true,
        Village: true,
        Customer: true,
        Employee: true,
        Supplier: true,
        Event: true,
        Imageaddress: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return { data: serializeData(addresses) };
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return { error: error.message || "Failed to fetch addresses" };
  }
}

export async function createAddress(data) {
  try {
    if (!data.provinceId || !data.districtId || !data.communeId || !data.villageId) {
      throw new Error("Province, District, Commune, and Village IDs are required");
    }
    const uniqueFields = [data.customerId, data.employeeId, data.supplierId, data.eventId].filter(Boolean);
    if (uniqueFields.length > 1) {
      throw new Error("Only one of Customer, Employee, Supplier, or Event can be associated");
    }
    const address = await prisma.address.create({
      data: {
        provinceId: Number(data.provinceId),
        districtId: Number(data.districtId),
        communeId: Number(data.communeId),
        villageId: Number(data.villageId),
        latitude: data.latitude ? Number(data.latitude) : null,
        longitude: data.longitude ? Number(data.longitude) : null,
        customerId: data.customerId || null,
        employeeId: data.employeeId || null,
        supplierId: data.supplierId || null,
        eventId: data.eventId || null,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    revalidatePath("/address");
    return { data: serializeData(address) };
  } catch (error) {
    console.error("Address creation error:", error);
    if (error.code === "P2002") {
      return { error: `Duplicate ${error.meta?.target?.join(", ") || "field"}` };
    }
    return { error: error.message || "Failed to create address" };
  }
}

export async function updateAddress(addressId, data) {
  try {
    if (!addressId) throw new Error("Address ID is required");
    if (!data.provinceId || !data.districtId || !data.communeId || !data.villageId) {
      throw new Error("Province, District, Commune, and Village IDs are required");
    }
    const uniqueFields = [data.customerId, data.employeeId, data.supplierId, data.eventId].filter(Boolean);
    if (uniqueFields.length > 1) {
      throw new Error("Only one of Customer, Employee, Supplier, or Event can be associated");
    }
    const address = await prisma.address.update({
      where: { addressId },
      data: {
        provinceId: Number(data.provinceId),
        districtId: Number(data.districtId),
        communeId: Number(data.communeId),
        villageId: Number(data.villageId),
        latitude: data.latitude ? Number(data.latitude) : null,
        longitude: data.longitude ? Number(data.longitude) : null,
        customerId: data.customerId || null,
        employeeId: data.employeeId || null,
        supplierId: data.supplierId || null,
        eventId: data.eventId || null,
        updatedAt: new Date(),
      },
    });
    revalidatePath("/address");
    return { data: serializeData(address) };
  } catch (error) {
    console.error("Address update error:", error);
    if (error.code === "P2025") {
      return { error: "Address not found" };
    }
    if (error.code === "P2002") {
      return { error: `Duplicate ${error.meta?.target?.join(", ") || "field"}` };
    }
    return { error: error.message || "Failed to update address" };
  }
}

export async function deleteAddress(addressId) {
  try {
    if (!addressId) throw new Error("Address ID is required");
    const address = await prisma.address.update({
      where: { addressId },
      data: { status: "inactive", updatedAt: new Date() },
    });
    revalidatePath("/address");
    return { data: serializeData(address) };
  } catch (error) {
    console.error("Address soft delete error:", error);
    if (error.code === "P2025") {
      return { error: "Address not found" };
    }
    return { error: "Failed to soft delete address" };
  }
}