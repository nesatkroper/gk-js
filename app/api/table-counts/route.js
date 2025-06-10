import { NextResponse } from "next/server"
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const results = await prisma.$queryRaw`
        SELECT * FROM count;
    `;

    const serializedResults = JSON.parse(JSON.stringify(results, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    return NextResponse.json(serializedResults);
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to fetch count" }, { status: 500 });
  }
}