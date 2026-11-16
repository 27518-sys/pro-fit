import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse, badRequestResponse, successResponse } from '@/lib/auth';
import { workoutScheduleSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');

  const whereClause: any = { userId: authUser.id };
  if (date) whereClause.scheduledDate = date;

  const schedules = await prisma.workoutSchedule.findMany({
    where: whereClause,
    include: {
      workoutPlan: { select: { id: true, name: true } },
    },
    orderBy: [{ scheduledDate: 'asc' }, { scheduledTime: 'asc' }],
  });

  return successResponse(schedules);
}

export async function POST(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  try {
    const body = await req.json();
    const validated = workoutScheduleSchema.parse(body);

    const schedule = await prisma.workoutSchedule.create({
      data: {
        userId: authUser.id,
        workoutPlanId: validated.workoutPlanId,
        title: validated.title,
        description: validated.description,
        scheduledDate: validated.scheduledDate,
        scheduledTime: validated.scheduledTime,
        status: validated.status,
        reminderMinutes: validated.reminderMinutes,
      },
      include: { workoutPlan: true },
    });

    return successResponse(schedule, 201);
  } catch (error: any) {
    if (error.errors) return badRequestResponse('Validation failed', error.errors);
    return badRequestResponse(error.message || 'Failed to schedule workout');
  }
}
