import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse, forbiddenResponse, notFoundResponse, badRequestResponse, successResponse } from '@/lib/auth';
import { workoutSessionSchema } from '@/lib/validations';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const session = await prisma.workoutSession.findUnique({
    where: { id: params.id },
    include: {
      exercises: {
        include: {
          exercise: true,
          sets: { orderBy: { setNumber: 'asc' } },
        },
        orderBy: { orderIndex: 'asc' },
      },
      workoutPlan: true,
    },
  });

  if (!session) return notFoundResponse('Workout session not found');
  if (session.userId !== authUser.id) return forbiddenResponse();

  return successResponse(session);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const existing = await prisma.workoutSession.findUnique({
    where: { id: params.id },
    include: { exercises: true },
  });

  if (!existing) return notFoundResponse('Workout session not found');
  if (existing.userId !== authUser.id) return forbiddenResponse();

  try {
    const body = await req.json();
    const validated = workoutSessionSchema.partial().parse(body);

    let totalVolume = validated.totalVolumeKg;
    if (totalVolume === undefined && validated.exercises) {
      totalVolume = validated.exercises.reduce((sum, ex) => {
        return (
          sum +
          ex.sets.reduce((sSum, s) => {
            return sSum + (s.isCompleted ? s.reps * s.weightKg : 0);
          }, 0)
        );
      }, 0);
    }

    // Execute in transaction
    const updated = await prisma.$transaction(async (tx) => {
      // If exercises array was provided, replace exercises & sets
      if (validated.exercises !== undefined) {
        // Delete existing workout exercises (cascades to sets)
        await tx.workoutExercise.deleteMany({
          where: { workoutSessionId: params.id },
        });

        // Create new workout exercises & sets
        for (let i = 0; i < validated.exercises.length; i++) {
          const ex = validated.exercises[i];
          await tx.workoutExercise.create({
            data: {
              workoutSessionId: params.id,
              exerciseId: ex.exerciseId,
              orderIndex: ex.orderIndex ?? i,
              notes: ex.notes,
              sets: {
                create: (ex.sets || []).map((s, sIdx) => ({
                  setNumber: s.setNumber ?? sIdx + 1,
                  setType: s.setType || 'NORMAL',
                  reps: s.reps,
                  weightKg: s.weightKg,
                  rpe: s.rpe,
                  isCompleted: s.isCompleted !== false,
                  restTimeSeconds: s.restTimeSeconds || 60,
                })),
              },
            },
          });
        }
      }

      return tx.workoutSession.update({
        where: { id: params.id },
        data: {
          title: validated.title,
          planId: validated.planId,
          notes: validated.notes,
          durationMinutes: validated.durationMinutes,
          totalVolumeKg: totalVolume,
          caloriesBurned: validated.caloriesBurned,
          rating: validated.rating,
          status: validated.status,
          completedAt: validated.completedAt ? new Date(validated.completedAt) : undefined,
        },
        include: {
          exercises: {
            include: {
              exercise: true,
              sets: { orderBy: { setNumber: 'asc' } },
            },
            orderBy: { orderIndex: 'asc' },
          },
        },
      });
    });

    return successResponse(updated);
  } catch (error: any) {
    if (error.errors) return badRequestResponse('Validation failed', error.errors);
    return badRequestResponse(error.message || 'Failed to update workout session');
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const existing = await prisma.workoutSession.findUnique({
    where: { id: params.id },
  });

  if (!existing) return notFoundResponse('Workout session not found');
  if (existing.userId !== authUser.id) return forbiddenResponse();

  await prisma.workoutSession.delete({
    where: { id: params.id },
  });

  return successResponse({ deleted: true, id: params.id });
}
