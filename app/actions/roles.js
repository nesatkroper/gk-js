'use server'

import prisma from '@/lib/prisma'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { Status } from '@prisma/client'

const createRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(100, 'Role name is too long'),
  description: z.string().optional(),
  status: z.enum([Status.active, Status.inactive]).default(Status.active),
  isSystemRole: z.boolean().default(false),
})

const updateRoleSchema = z.object({
  roleId: z.string().uuid(),
  name: z.string().min(1, 'Role name is required').max(100, 'Role name is too long').optional(),
  description: z.string().optional(),
  status: z.enum([Status.active, Status.inactive]).optional(),
  isSystemRole: z.boolean().optional(),
})

export async function createRole(data) {
  try {
    const validatedData = createRoleSchema.parse({
      name: data.name,
      description: data.description,
      status: data.status || 'active',
      isSystemRole: data.isSystemRole || false,
    })

    const role = await prisma.role.create({
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
      include: {
        Auth: true,
      },
    })

    revalidatePath('/roles')
    return { success: true, role, error: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors.map((err) => err.message).join(', '), role: null }
    }
    if (error.code === 'P2002') {
      return { success: false, error: 'Role name already exists', role: null }
    }
    return { success: false, error: 'Failed to create role: ' + error.message, role: null }
  }
}

export async function updateRole(roleId, data) {
  try {
    const validatedData = updateRoleSchema.parse({
      roleId,
      name: data.name,
      description: data.description,
      status: data.status,
      isSystemRole: data.isSystemRole,
    })

    const { roleId: id, ...updateData } = validatedData
    const role = await prisma.role.update({
      where: { roleId: id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      include: {
        Auth: true,
      },
    })

    revalidatePath('/roles')
    return { success: true, role, error: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors.map((err) => err.message).join(', '), role: null }
    }
    if (error.code === 'P2002') {
      return { success: false, error: 'Role name already exists', role: null }
    }
    return { success: false, error: 'Failed to update role: ' + error.message, role: null }
  }
}

export async function deleteRole(roleId) {
  try {
    const role = await prisma.role.findUnique({
      where: { roleId },
    })

    if (!role) {
      return { success: false, error: 'Role not found', role: null }
    }

    if (role.isSystemRole) {
      return { success: false, error: 'Cannot delete system role', role: null }
    }

    const deletedRole = await prisma.role.delete({
      where: { roleId },
    })

    revalidatePath('/roles')
    return { success: true, role: deletedRole, error: null }
  } catch (error) {
    return { success: false, error: 'Failed to delete role: ' + error.message, role: null }
  }
}

export async function getRole(roleId) {
  try {
    const role = await prisma.role.findUnique({
      where: { roleId },
      include: {
        Auth: true,
      },
    })

    if (!role) {
      return { success: false, error: 'Role not found', role: null }
    }

    return { success: true, role, error: null }
  } catch (error) {
    return { success: false, error: 'Failed to fetch role: ' + error.message, role: null }
  }
}

export async function getAllRoles() {
  try {
    const roles = await prisma.role.findMany({
      include: {
        Auth: true,
      },
    })

    return { success: true, roles, error: null }
  } catch (error) {
    return { success: false, error: 'Failed to fetch roles: ' + error.message, roles: null }
  }
}