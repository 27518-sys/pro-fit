import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse, badRequestResponse, successResponse } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  try {
    const { targetMuscle, difficulty, durationMinutes, saveAsPlan } = await req.json();

    const muscle = targetMuscle || 'FULL_BODY';
    const diff = difficulty || 'INTERMEDIATE';
    const duration = durationMinutes || 45;

    // Fetch existing exercises from library
    const availableExercises = await prisma.exercise.findMany({
      where: {
        OR: [{ isSystem: true }, { userId: authUser.id }],
        ...(muscle !== 'FULL_BODY' ? { targetMuscle: muscle } : {}),
      },
      take: 6,
    });

    const routineName = `AI ${diff} ${muscle.replace('_', ' ')} Blast`;
    const generatedExercises = availableExercises.length > 0
      ? availableExercises.map((ex, idx) => ({
          exerciseId: ex.id,
          name: ex.name,
          targetMuscle: ex.targetMuscle,
          category: ex.category,
          sets: [
            { setNumber: 1, reps: diff === 'BEGINNER' ? 12 : 10, weightKg: 20 + idx * 10, rpe: 7.0 },
            { setNumber: 2, reps: diff === 'BEGINNER' ? 12 : 8, weightKg: 25 + idx * 10, rpe: 8.0 },
            { setNumber: 3, reps: diff === 'BEGINNER' ? 10 : 6, weightKg: 30 + idx * 10, rpe: 9.0 },
          ],
        }))
      : [
          {
            exerciseId: 'sys-ex-1',
            name: 'Barbell Bench Press',
            targetMuscle: 'CHEST',
            category: 'STRENGTH',
            sets: [
              { setNumber: 1, reps: 10, weightKg: 60, rpe: 7.5 },
              { setNumber: 2, reps: 8, weightKg: 80, rpe: 8.5 },
              { setNumber: 3, reps: 6, weightKg: 95, rpe: 9.0 },
            ],
          },
        ];

    let createdPlan = null;
    if (saveAsPlan) {
      createdPlan = await prisma.workoutPlan.create({
        data: {
          userId: authUser.id,
          name: routineName,
          description: `AI-generated high-efficiency workout optimized for ${muscle} development (${duration} mins).`,
          difficulty: diff,
          daysPerWeek: 3,
          isPublic: false,
          routines: {
            create: [
              {
                dayOfWeek: 1,
                name: `${routineName} Routine`,
                targetMuscles: muscle,
                exerciseList: JSON.stringify(generatedExercises.map((e) => e.name)),
              },
            ],
          },
        },
        include: { routines: true },
      });
    }

    return successResponse({
      title: routineName,
      targetMuscle: muscle,
      difficulty: diff,
      estimatedMinutes: duration,
      estimatedCaloriesBurned: Math.round(duration * 8.2),
      exercises: generatedExercises,
      savedPlan: createdPlan,
    });
  } catch (error: any) {
    return badRequestResponse(error.message || 'Failed to generate AI workout');
  }
}
