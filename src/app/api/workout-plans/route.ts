import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse, badRequestResponse, successResponse } from '@/lib/auth';
import { workoutPlanSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const plans = await prisma.workoutPlan.findMany({
    where: {
      OR: [{ userId: authUser.id }, { isPublic: true }],
    },
    include: {
      routines: {
        orderBy: { dayOfWeek: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return successResponse(plans);
}

export async function POST(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  try {
    const body = await req.json();
    const validated = workoutPlanSchema.parse(body);

    const plan = await prisma.workoutPlan.create({
      data: {
        userId: authUser.id,
        name: validated.name,
        description: validated.description,
        difficulty: validated.difficulty,
        daysPerWeek: validated.daysPerWeek,
        isPublic: validated.isPublic,
        routines: {
          create: (validated.routines || []).map((r) => ({
            dayOfWeek: r.dayOfWeek,
            name: r.name,
            targetMuscles: r.targetMuscles,
            exerciseList: r.exerciseList,
          })),
        },
      },
      include: { routines: true },
    });

    return successResponse(plan, 201);
  } catch (error: any) {
    if (error.errors) return badRequestResponse('Validation failed', error.errors);
    return badRequestResponse(error.message || 'Failed to create workout plan');
  }
}
