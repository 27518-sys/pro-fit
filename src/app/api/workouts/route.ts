import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse, badRequestResponse, successResponse } from '@/lib/auth';
import { workoutSessionSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

  const whereClause: any = { userId: authUser.id };
  if (status) whereClause.status = status;

  const sessions = await prisma.workoutSession.findMany({
    where: whereClause,
    include: {
      exercises: {
        include: {
          exercise: true,
          sets: {
            orderBy: { setNumber: 'asc' },
          },
        },
        orderBy: { orderIndex: 'asc' },
      },
      workoutPlan: {
        select: { id: true, name: true },
      },
    },
    orderBy: { startedAt: 'desc' },
    take: limit,
  });

  return successResponse(sessions);
}

export async function POST(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  try {
    const body = await req.json();
    const validated = workoutSessionSchema.parse(body);

    // Calculate total volume across sets if 0
    let totalVolume = validated.totalVolumeKg;
    if (!totalVolume && validated.exercises?.length) {
      totalVolume = validated.exercises.reduce((sum, ex) => {
        return (
          sum +
          ex.sets.reduce((sSum, s) => {
            return sSum + (s.isCompleted ? s.reps * s.weightKg : 0);
          }, 0)
        );
      }, 0);
    }

    const session = await prisma.workoutSession.create({
      data: {
        userId: authUser.id,
        title: validated.title,
        planId: validated.planId || null,
        notes: validated.notes,
        startedAt: validated.startedAt ? new Date(validated.startedAt) : new Date(),
        completedAt: validated.completedAt ? new Date(validated.completedAt) : new Date(),
        durationMinutes: validated.durationMinutes,
        totalVolumeKg: totalVolume,
        caloriesBurned: validated.caloriesBurned || Math.round(validated.durationMinutes * 7.5),
        rating: validated.rating,
        status: validated.status,
        exercises: {
          create: validated.exercises.map((ex, exIdx) => ({
            exerciseId: ex.exerciseId,
            orderIndex: ex.orderIndex ?? exIdx,
            notes: ex.notes,
            sets: {
              create: ex.sets.map((s, sIdx) => ({
                setNumber: s.setNumber ?? sIdx + 1,
                setType: s.setType || 'NORMAL',
                reps: s.reps,
                weightKg: s.weightKg,
                rpe: s.rpe,
                isCompleted: s.isCompleted !== false,
                restTimeSeconds: s.restTimeSeconds || 60,
              })),
            },
          })),
        },
      },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: true,
          },
        },
      },
    });

    return successResponse(session, 201);
  } catch (error: any) {
    if (error.errors) return badRequestResponse('Validation failed', error.errors);
    return badRequestResponse(error.message || 'Failed to create workout session');
  }
}
