
// app/api/seed/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient, Status } from '@/lib/generated/prisma'
import bcrypt from 'bcryptjs'


const prisma = new PrismaClient()
const SALT_ROUNDS = 12

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Seeding not allowed in production' },
      { status: 403 }
    )
  }

  try {
    const adminRole = await prisma.role.upsert({
      where: { name: 'admin' },
      update: {},
      create: {
        name: 'admin',
        description: 'Administrator',
        isSystemRole: true,
        status: Status.active
      }
    })

    const userRole = await prisma.role.upsert({
      where: { name: 'user' },
      update: {},
      create: {
        name: 'user',
        description: 'Regular User',
        isSystemRole: false,
        status: Status.active
      }
    })

    const adminPassword = await bcrypt.hash('123456', SALT_ROUNDS)
    const userPassword = await bcrypt.hash('123456', SALT_ROUNDS)

    await prisma.auth.upsert({
      where: { email: 'superadmin@gkna.com' },
      update: {},
      create: {
        email: 'superadmin@gkna.com',
        password: adminPassword,
        roleId: adminRole.roleId,
        status: Status.active
      }
    })

    await prisma.auth.upsert({
      where: { email: 'agent@gkna.com' },
      update: {},
      create: {
        email: 'agent@gkna.com',
        password: userPassword,
        roleId: userRole.roleId,
        status: Status.active
      }
    })

    return NextResponse.json({
      message: 'Database seeded successfully',
      roles: [adminRole, userRole]
    })

  } catch (error) {
    console.error('Seeding error:', error)
    return NextResponse.json(
      { error: 'Seeding failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}