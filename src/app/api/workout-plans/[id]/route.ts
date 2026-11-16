import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse, forbiddenResponse, notFoundResponse, badRequestResponse, successResponse } from '@/lib/auth';
import { workoutPlanSchema } from '@/lib/validations';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const plan = await prisma.workoutPlan.findUnique({
    where: { id: params.id },
    include: {
      routines: { orderBy: { dayOfWeek: 'asc' } },
    },
  });

  if (!plan) return notFoundResponse('Workout plan not found');
  if (!plan.isPublic && plan.userId !== authUser.id) return forbiddenResponse();

  return successResponse(plan);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const existing = await prisma.workoutPlan.findUnique({
    where: { id: params.id },
  });

  if (!existing) return notFoundResponse('Workout plan not found');
  if (existing.userId !== authUser.id) return forbiddenResponse();

  try {
    const body = await req.json();
    const validated = workoutPlanSchema.partial().parse(body);

    const updated = await prisma.$transaction(async (tx) => {
      if (validated.routines !== undefined) {
        await tx.workoutPlanRoutine.deleteMany({
          where: { workoutPlanId: params.id },
        });

        for (const routine of validated.routines) {
          await tx.workoutPlanRoutine.create({
            data: {
              workoutPlanId: params.id,
              dayOfWeek: routine.dayOfWeek,
              name: routine.name,
              targetMuscles: routine.targetMuscles,
              exerciseList: routine.exerciseList,
            },
          });
        }
      }

      return tx.workoutPlan.update({
        where: { id: params.id },
        data: {
          name: validated.name,
          description: validated.description,
          difficulty: validated.difficulty,
          daysPerWeek: validated.daysPerWeek,
          isPublic: validated.isPublic,
        },
        include: { routines: true },
      });
    });

    return successResponse(updated);
  } catch (error: any) {
    if (error.errors) return badRequestResponse('Validation failed', error.errors);
    return badRequestResponse(error.message || 'Failed to update workout plan');
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const existing = await prisma.workoutPlan.findUnique({
    where: { id: params.id },
  });

  if (!existing) return notFoundResponse('Workout plan not found');
  if (existing.userId !== authUser.id) return forbiddenResponse();

  await prisma.workoutPlan.delete({
    where: { id: params.id },
  });

  return successResponse({ deleted: true, id: params.id });
}
