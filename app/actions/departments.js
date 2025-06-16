'use server';

import prisma from '@/lib/prisma';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { Status } from '@prisma/client';
import { generateDepartmentCode } from '@/lib/utils';

const createDepartmentSchema = z.object({
  departmentName: z.string().min(1, 'Department name is required'),
  departmentCode: z.string().optional(),
  memo: z.string().optional(),
  status: z.enum([Status.active, Status.inactive]).default(Status.active),
});

const updateDepartmentSchema = z.object({
  departmentId: z.string().uuid(),
  departmentName: z.string().min(1, 'Department name is required').optional(),
  departmentCode: z.string().optional(),
  memo: z.string().optional(),
  status: z.enum([Status.active, Status.inactive]).optional(),
});

// Create Department
export async function createDepartment(data) {
  const departmentCode = data.departmentCode || generateDepartmentCode();
  try {
    const validatedData = createDepartmentSchema.parse({
      departmentName: data.departmentName,
      departmentCode,
      memo: data.memo,
      status: data.status || 'active',
    });

    const department = await prisma.department.create({
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
    });

    revalidatePath('/departments');
    return { success: true, department, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors.map((err) => err.message).join(', '), department: null };
    }
    return { success: false, error: 'Failed to create department: ' + error.message, department: null };
  }
}

// Update Department
export async function updateDepartment(departmentId, data) {
  try {
    const validatedData = updateDepartmentSchema.parse({
      departmentId,
      departmentName: data.departmentName,
      departmentCode: data.departmentCode,
      memo: data.memo,
      status: data.status,
    });

    const { departmentId: id, ...updateData } = validatedData;
    const department = await prisma.department.update({
      where: { departmentId: id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });

    revalidatePath('/departments');
    return { success: true, department, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors.map((err) => err.message).join(', '), department: null };
    }
    return { success: false, error: 'Failed to update department: ' + error.message, department: null };
  }
}

// Delete Department
export async function deleteDepartment(departmentId) {
  try {
    const department = await prisma.department.delete({
      where: { departmentId },
    });

    revalidatePath('/departments');
    return { success: true, department, error: null };
  } catch (error) {
    return { success: false, error: 'Failed to delete department: ' + error.message, department: null };
  }
}

// Get Department by ID
export async function getDepartment(departmentId) {
  try {
    const department = await prisma.department.findUnique({
      where: { departmentId },
      include: {
        Employee: true,
        Position: true,
      },
    });

    if (!department) {
      return { success: false, error: 'Department not found', department: null };
    }

    return { success: true, department, error: null };
  } catch (error) {
    return { success: false, error: 'Failed to fetch department: ' + error.message, department: null };
  }
}

// Get All Departments
export async function getAllDepartments() {
  try {
    const departments = await prisma.department.findMany({
      include: {
        Employee: true,
        Position: true,
      },
    });

    return { success: true, departments, error: null };
  } catch (error) {
    return { success: false, error: 'Failed to fetch departments: ' + error.message, departments: null };
  }
}
