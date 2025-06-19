"use server";

import  prisma  from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function getSecurityLogs({ page = 1, limit = 50, status, ip, startDate, endDate } = {}) {
  try {
    // Verify admin access
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token")?.value;
    if (!token) {
      return { error: "Unauthorized", status: 401 };
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return { error: "Invalid token", status: 401 };
    }

    // Check if user has admin role
    const auth = await prisma.auth.findUnique({
      where: { authId: decoded.authId },
      include: { Role: true },
    });

    if (!auth || auth.Role.name !== "admin") {
      return { error: "Insufficient permissions", status: 403 };
    }

    // Build where clause
    const where = {};

    if (status) {
      where.status = Number.parseInt(status);
    }

    if (ip) {
      where.ip = { contains: ip };
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // Get logs with pagination
    const [logs, total] = await Promise.all([
      prisma.authLog.findMany({
        where,
        include: {
          Auth: {
            select: {
              email: true,
              Role: {
                select: { name: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.authLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      status: 200,
    };
  } catch (error) {
    console.error("Security logs error:", error);
    return { error: "Internal server error", status: 500 };
  }
}