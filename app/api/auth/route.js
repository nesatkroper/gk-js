export const runtime = 'nodejs';

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const auths = await prisma.auth.findMany({
      include: {
        Role: true,
        Employee: {
          include: {
            Branch: true
          }
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(auths);
  } catch (error) {
    console.error("Error fetching auth records:", error);
    return NextResponse.json({ error: "Failed to fetch auth records" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, roleId, employeeId } = body;

    if (!email || !password || !roleId) {
      return NextResponse.json({ error: "Email, password, and role are required" }, { status: 400 });
    }

    const existingAuth = await prisma.auth.findUnique({ where: { email } });
    if (existingAuth) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    // Validate roleId exists
    const roleExists = await prisma.role.findUnique({ where: { roleId } });
    if (!roleExists) {
      return NextResponse.json({ error: "Invalid role ID" }, { status: 400 });
    }

    // Validate employeeId if provided
    if (employeeId) {
      const employeeExists = await prisma.employee.findUnique({ where: { employeeId } });
      if (!employeeExists) {
        return NextResponse.json({ error: "Invalid employee ID" }, { status: 400 });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const auth = await prisma.auth.create({
      data: {
        email,
        password: hashedPassword,
        roleId,
        employeeId: employeeId || null,
        status: "active",
      },
      include: { Role: true, Employee: true },
    });

    return NextResponse.json(auth, { status: 201 });
  } catch (error) {
    console.error("Error creating auth record:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Unique constraint violation: email or employeeId already exists" }, { status: 400 });
    }
    if (error.code === "P2003") {
      return NextResponse.json({ error: "Foreign key constraint violation: invalid roleId or employeeId" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create auth record" }, { status: 500 });
  }
}


// export const runtime = 'nodejs';

// import prisma from "@/lib/prisma"
// import bcrypt from "bcryptjs"



// export async function GET() {
//   try {
//     const auths = await prisma.auth.findMany({
//       include: {
//         Role: true,
//         Employee: {
//           include: {
//             Branch: true
//           }
//         },
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     })

//     return NextResponse.json(auths)
//   } catch (error) {
//     console.error("Error fetching auth records:", error)
//     return NextResponse.json({ error: "Failed to fetch auth records" }, { status: 500 })
//   }
// }

// export async function POST(request) {
//   try {
//     const body = await request.json();
//     const { email, password, roleId, employeeId } = body;

//     if (!email || !password || !roleId) {
//       return NextResponse.json({ error: "Email, password, and role are required" }, { status: 400 });
//     }

//     const existingAuth = await prisma.auth.findUnique({ where: { email } });
//     if (existingAuth) {
//       return NextResponse.json({ error: "Email already exists" }, { status: 400 });
//     }

//     // Validate roleId exists
//     const roleExists = await prisma.role.findUnique({ where: { roleId } });
//     if (!roleExists) {
//       return NextResponse.json({ error: "Invalid role ID" }, { status: 400 });
//     }

//     // Validate employeeId if provided
//     if (employeeId) {
//       const employeeExists = await prisma.employee.findUnique({ where: { employeeId } });
//       if (!employeeExists) {
//         return NextResponse.json({ error: "Invalid employee ID" }, { status: 400 });
//       }
//     }

//     const hashedPassword = await bcrypt.hash(password, 12);
//     const auth = await prisma.auth.create({
//       data: {
//         email,
//         password: hashedPassword,
//         roleId,
//         employeeId: employeeId || null,
//         status: "active",
//       },
//       include: { Role: true, Employee: true },
//     });

//     return NextResponse.json(auth, { status: 201 });
//   } catch (error) {
//     console.error("Error creating auth record:", error);
//     if (error.code === "P2002") {
//       return NextResponse.json({ error: "Unique constraint violation: email or employeeId already exists" }, { status: 400 });
//     }
//     if (error.code === "P2003") {
//       return NextResponse.json({ error: "Foreign key constraint violation: invalid roleId or employeeId" }, { status: 400 });
//     }
//     return NextResponse.json({ error: "Failed to create auth record" }, { status: 500 });
//   }
// }