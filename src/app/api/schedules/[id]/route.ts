import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse, forbiddenResponse, notFoundResponse, badRequestResponse, successResponse } from '@/lib/auth';
import { workoutScheduleSchema } from '@/lib/validations';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const schedule = await prisma.workoutSchedule.findUnique({
    where: { id: params.id },
    include: { workoutPlan: true },
  });

  if (!schedule) return notFoundResponse('Schedule not found');
  if (schedule.userId !== authUser.id) return forbiddenResponse();

  return successResponse(schedule);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const existing = await prisma.workoutSchedule.findUnique({
    where: { id: params.id },
  });

  if (!existing) return notFoundResponse('Schedule not found');
  if (existing.userId !== authUser.id) return forbiddenResponse();

  try {
    const body = await req.json();
    const validated = workoutScheduleSchema.partial().parse(body);

    const updated = await prisma.workoutSchedule.update({
      where: { id: params.id },
      data: validated,
      include: { workoutPlan: true },
    });

    return successResponse(updated);
  } catch (error: any) {
    if (error.errors) return badRequestResponse('Validation failed', error.errors);
    return badRequestResponse(error.message || 'Failed to update schedule');
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const existing = await prisma.workoutSchedule.findUnique({
    where: { id: params.id },
  });

  if (!existing) return notFoundResponse('Schedule not found');
  if (existing.userId !== authUser.id) return forbiddenResponse();

  await prisma.workoutSchedule.delete({
    where: { id: params.id },
  });

  return successResponse({ deleted: true, id: params.id });
}
