'use server'

import prisma from '@/lib/prisma'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { Status } from '@prisma/client'

const dateSchema = z.preprocess((arg) => {
  if (typeof arg === 'string' || arg instanceof Date) {
    const date = new Date(arg)
    return isNaN(date.getTime()) ? undefined : date
  }
  return undefined
}, z.date({ invalid_type_error: 'Invalid date' }))

const createEventSchema = z.object({
  eventName: z.string().min(1, 'Event name is required'),
  memo: z.string().optional(),
  startDate: dateSchema,
  endDate: dateSchema,
  status: z.enum([Status.active, Status.inactive]).default(Status.active),
}).refine((data) => data.startDate <= data.endDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
})

const updateEventSchema = z.object({
  eventId: z.string().uuid(),
  eventName: z.string().min(1, 'Event name is required').optional(),
  memo: z.string().optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  status: z.enum([Status.active, Status.inactive]).optional(),
}).refine((data) => !data.startDate || !data.endDate || data.startDate <= data.endDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
})

export async function createEvent(data) {
  try {
    const validatedData = createEventSchema.parse({
      eventName: data.eventName,
      memo: data.memo,
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status || 'active',
    })

    const event = await prisma.event.create({
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
      include: {
        Address: true,
        Attendance: true,
      },
    })

    revalidatePath('/events')
    return { success: true, event, error: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors.map((err) => err.message).join(', '), event: null }
    }
    return { success: false, error: 'Failed to create event: ' + error.message, event: null }
  }
}

export async function updateEvent(eventId, data) {
  try {
    const validatedData = updateEventSchema.parse({
      eventId,
      eventName: data.eventName,
      memo: data.memo,
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status,
    })

    const { eventId: id, ...updateData } = validatedData
    const event = await prisma.event.update({
      where: { eventId: id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      include: {
        Address: true,
        Attendance: true,
      },
    })

    revalidatePath('/events')
    return { success: true, event, error: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors.map((err) => err.message).join(', '), event: null }
    }
    return { success: false, error: 'Failed to update event: ' + error.message, event: null }
  }
}

export async function deleteEvent(eventId) {
  try {
    const event = await prisma.event.delete({
      where: { eventId },
    })

    revalidatePath('/events')
    return { success: true, event, error: null }
  } catch (error) {
    return { success: false, error: 'Failed to delete event: ' + error.message, event: null }
  }
}

export async function getEvent(eventId) {
  try {
    const event = await prisma.event.findUnique({
      where: { eventId },
      include: {
        Address: true,
        Attendance: true,
      },
    })

    if (!event) {
      return { success: false, error: 'Event not found', event: null }
    }

    return { success: true, event, error: null }
  } catch (error) {
    return { success: false, error: 'Failed to fetch event: ' + error.message, event: null }
  }
}

export async function getAllEvents() {
  try {
    const events = await prisma.event.findMany({
      include: {
        Address: true,
        Attendance: true,
      },
    })

    return { success: true, events, error: null }
  } catch (error) {
    return { success: false, error: 'Failed to fetch events: ' + error.message, events: null }
  }
}