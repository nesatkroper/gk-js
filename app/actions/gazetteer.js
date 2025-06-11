"use server";

import prisma from "@/lib/prisma";

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