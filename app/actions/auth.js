"use server";

import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { generateToken, verifyPassword } from "@/lib/auth";
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// function convertDecimalsToNumbers(obj) {
//   if (!obj) return obj;
//   const newObj = { ...obj };
//   for (const key in newObj) {
//     if (newObj[key] instanceof Prisma.Decimal) {
//       newObj[key] = newObj[key].toNumber();
//     } else if (newObj[key] instanceof Date) {
//       newObj[key] = newObj[key].toISOString();
//     } else if (typeof newObj[key] === "object") {
//       newObj[key] = convertDecimalsToNumbers(newObj[key]);
//     }
//   }
//   return newObj;
// }

function convertDecimalsToNumbers(data) {
  if (data === null || data === undefined) return data;

  if (Array.isArray(data)) {
    return data.map(convertPrismaData);
  }

  if (typeof data === "object") {
    if (
      typeof data.toNumber === "function" &&
      data._isDecimal === true // Handles Prisma.Decimal safely
    ) {
      return data.toNumber();
    }

    if (data instanceof Date) {
      return data.toISOString();
    }

    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, convertPrismaData(value)])
    );
  }

  return data;
}


export async function getAuthRecords(options = {}) {
  try {
    const { type = "all", authId } = options;

    if (type === "byId" && authId) {
      const auth = await prisma.auth.findUnique({
        where: { authId },
        include: {
          Role: true,
          Employee: {
            include: {
              Branch: true,
              Department: true,
              Position: true,
            },
          },
        },
      });
      // const auth = await prisma.auth.findUnique({
      //   where: { authId },
      //   select: {
      //     email: true,
      //     roleId: true,
      //     employeeId: true,
      //     status: true,
      //     createdAt: true,
      //     lastLoginAt: true,
      //     Role: {
      //       select: {
      //         name: true
      //       }
      //     },
      //     Employee: {
      //       include: {
      //         Branch: {
      //           select: {
      //             branchId: true,
      //             branchName: true
      //           }
      //         },
      //         Department: {
      //           select: {
      //             departmentId: true,
      //             departmentName: true
      //           }
      //         },
      //         Position: {
      //           select: {
      //             positionId: true,
      //             positionName: true
      //           }
      //         },
      //         Employeeinfo: true,
      //       },
      //     },
      //   },
      // });
      if (!auth) {
        return { error: "Auth record not found" };
      }

      console.log(auth)

      const convertedAuth = convertDecimalsToNumbers(auth);
      return { data: convertedAuth };
    }
    else if (type === "min") {
      const auths = await prisma.auth.findUnique({
        where: { authId },
        select: {
          email: true,
          roleId: true,
          employeeId: true,
          status: true,
          createdAt: true,
          lastLoginAt: true,
          Role: {
            select: {
              name: true
            }
          },
          Employee: {
            include: {
              Branch: {
                select: {
                  branchId: true,
                  branchName: true
                }
              },
              Department: {
                select: {
                  departmentId: true,
                  departmentName: true
                }
              },
              Position: {
                select: {
                  positionId: true,
                  positionName: true
                }
              },
              Customer: true,
              Employeeinfo: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      const convertedAuths = auths.map((auth) => convertDecimalsToNumbers(auth));
      return { data: convertedAuths };
    }
    else {
      const auths = await prisma.auth.findMany({
        include: {
          Role: true,
          Employee: {
            include: {
              Branch: true,
              Department: true,
              Position: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      const convertedAuths = auths.map((auth) => convertDecimalsToNumbers(auth));
      return { data: convertedAuths };
    }
  } catch (error) {
    console.error("Error fetching auth records:", error);
    return { error: "Failed to fetch auth records" };
  }
}

export async function getCurrentAuthUser() {
  const token = (await cookies()).get("auth-token")?.value;

  if (!token) {
    redirect("/login");
  }

  const { valid, user } = await validateToken(token);

  if (!valid) {
    (await cookies()).delete("auth-token");
    redirect("/login");
  }

  const { data, error } = await getAuthRecords({
    type: "byId",
    authId: user.authId,
  });

  if (error) {
    (await cookies()).delete("auth-token");
    redirect("/login");
  }

  return data;
}

export async function createAuthRecord(data) {
  console.log("Creating auth record...", data);
  try {
    const email = data.email;
    const password = data.password;
    const roleId = data.roleId;
    const employeeId = data.employeeId;

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

    if (employeeId && employeeId !== null) {
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
        createdAt: new Date(),
        updatedAt: new Date(),
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


export async function login(formData) {
  try {
    const email = formData.get("email")
    const password = formData.get("password")
    const deviceInfo = (formData.get("deviceInfo")) || ""
    const ipAddress = (formData.get("ipAddress")) || ""

    console.log("Login attempt for:", email)

    if (!email || !password) {
      return { success: false, error: "Email and password are required" }
    }

    const sanitizedEmail = email.toLowerCase().trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(sanitizedEmail)) {
      return { success: false, error: "Invalid email format" }
    }

    const auth = await prisma.auth.findUnique({
      where: { email: sanitizedEmail },
      include: {
        Role: true,
        Employee: {
          include: {
            Department: true,
            Position: true,
            Employeeinfo: true,
          },
        },
      },
    })

    if (!auth) {
      console.log("User not found:", sanitizedEmail)
      return { success: false, error: "Invalid credentials" }
    }

    if (auth.status !== "active") {
      console.log("Account not active:", sanitizedEmail)
      return { success: false, error: "Account is not active" }
    }

    const isValidPassword = await verifyPassword(password, auth.password)
    if (!isValidPassword) {
      console.log("Invalid password for:", sanitizedEmail)
      return { success: false, error: "Invalid credentials" }
    }

    const tokenPayload = {
      authId: auth.authId,
      role: auth.Role?.name || "user",
      status: auth.status,
      email: auth.email,
    }

    const jwtToken = await generateToken(tokenPayload)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 8)

    const tokenRecord = await prisma.token.create({
      data: {
        token: jwtToken,
        authId: auth.authId,
        deviceInfo,
        ipAddress,
        expiresAt,
      },
    })

    console.log("Generated and stored token for:", sanitizedEmail)

    await prisma.auth.update({
      where: { authId: auth.authId },
      data: { lastLoginAt: new Date() },
    })

    console.log("Login successful for:", sanitizedEmail)
    const cookieStore = await cookies(); 
    cookieStore.set("auth-token", jwtToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 8 * 60 * 60,
      path: "/",
    });

    // cookies().set("auth-token", jwtToken, {
    //   httpOnly: true,
    //   sameSite: "lax",
    //   maxAge: 8 * 60 * 60,
    //   path: "/",
    // })

    return {
      success: true,
      user: {
        authId: auth.authId,
        email: auth.email,
        state: auth.status,
        role: auth.Role?.name,
        employee: auth.Employee,
      },
    }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "Internal server error" }
  }
}

export async function logout() {
  try {
    const cookieStore = cookies()
    const token = (await cookieStore).get("auth-token")?.value
    const data = (await cookieStore).get('auth-data')?.value

    if (token) {
      await prisma.token.deleteMany({ where: { token } })
    }

    if (token) (await cookieStore).delete('auth-token')
    if (data) (await cookieStore).delete('auth-data')


    const headers = new Headers()
    headers.append(
      "Set-Cookie",
      `auth-token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`
    )

    return new Response(null, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error("Logout error:", error)
    return new Response("Logout failed", { status: 500 })
  }
}

export async function validateToken(token) {
  try {
    const tokenRecord = await prisma.token.findUnique({
      where: { token },
      include: { Auth: true },
    })

    if (!tokenRecord || new Date() > tokenRecord.expiresAt) {
      return { valid: false }
    }

    return {
      valid: true,
      user: tokenRecord.Auth,
    }
  } catch (error) {
    console.error("Token validation error:", error)
    return { valid: false }
  }
}

export async function getAuthUser() {
  const token = cookies().get("auth-token")?.value;

  if (!token) {
    redirect("/login")
  }

  const { valid, user } = await validateToken(token)

  if (!valid) {
    cookies().delete("auth-token")
    redirect("/login")
  }

  return user
}