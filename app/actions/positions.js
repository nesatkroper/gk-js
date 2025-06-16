'use server'

import prisma from '@/lib/prisma'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { Status } from '@prisma/client'
import { generatePositionCode } from '@/lib/utils'

const createPositionSchema = z.object({
  positionName: z.string().min(1, 'Position name is required'),
  positionCode: z.string().optional(),
  departmentId: z.string().uuid('Invalid department ID'),
  memo: z.string().optional(),
  status: z.enum([Status.active, Status.inactive]).default(Status.active),
})

const updatePositionSchema = z.object({
  positionId: z.string().uuid(),
  positionName: z.string().min(1, 'Position name is required').optional(),
  positionCode: z.string().optional(),
  departmentId: z.string().uuid('Invalid department ID').optional(),
  memo: z.string().optional(),
  status: z.enum([Status.active, Status.inactive]).optional(),
})

export async function createPosition(data) {
  const positionCode = data.positionCode || generatePositionCode()
  try {
    const validatedData = createPositionSchema.parse({
      positionName: data.positionName,
      positionCode,
      departmentId: data.departmentId,
      memo: data.memo,
      status: data.status || 'active',
    })

    const position = await prisma.position.create({
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
      include: {
        Department: true,
        Employee: true,
      },
    })

    revalidatePath('/positions')
    return { success: true, position, error: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors.map((err) => err.message).join(', '), position: null }
    }
    return { success: false, error: 'Failed to create position: ' + error.message, position: null }
  }
}

export async function updatePosition(positionId, data) {
  try {
    const validatedData = updatePositionSchema.parse({
      positionId,
      positionName: data.positionName,
      positionCode: data.positionCode,
      departmentId: data.departmentId,
      memo: data.memo,
      status: data.status,
    })

    const { positionId: id, ...updateData } = validatedData
    const position = await prisma.position.update({
      where: { positionId: id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      include: {
        Department: true,
        Employee: true,
      },
    })

    revalidatePath('/positions')
    return { success: true, position, error: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors.map((err) => err.message).join(', '), position: null }
    }
    return { success: false, error: 'Failed to update position: ' + error.message, position: null }
  }
}

export async function deletePosition(positionId) {
  try {
    const position = await prisma.position.delete({
      where: { positionId },
    })

    revalidatePath('/positions')
    return { success: true, position, error: null }
  } catch (error) {
    return { success: false, error: 'Failed to delete position: ' + error.message, position: null }
  }
}

export async function getPosition(positionId) {
  try {
    const position = await prisma.position.findUnique({
      where: { positionId },
      include: {
        Department: true,
        Employee: true,
      },
    })

    if (!position) {
      return { success: false, error: 'Position not found', position: null }
    }

    return { success: true, position, error: null }
  } catch (error) {
    return { success: false, error: 'Failed to fetch position: ' + error.message, position: null }
  }
}

export async function getAllPositions() {
  try {
    const positions = await prisma.position.findMany({
      include: {
        Department: true,
        Employee: true,
      },
    })

    return { success: true, positions, error: null }
  } catch (error) {
    return { success: false, error: 'Failed to fetch positions: ' + error.message, positions: null }
  }
}