import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse, badRequestResponse, successResponse } from '@/lib/auth';
import { fitnessGoalSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const goals = await prisma.fitnessGoal.findMany({
    where: { userId: authUser.id },
    orderBy: [{ isCompleted: 'asc' }, { createdAt: 'desc' }],
  });

  return successResponse(goals);
}

export async function POST(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  try {
    const body = await req.json();
    const validated = fitnessGoalSchema.parse(body);

    const progressPercent =
      validated.targetValue > 0
        ? Math.min(100, Math.max(0, (validated.currentValue / validated.targetValue) * 100))
        : 0;

    const goal = await prisma.fitnessGoal.create({
      data: {
        userId: authUser.id,
        title: validated.title,
        description: validated.description,
        category: validated.category,
        targetValue: validated.targetValue,
        currentValue: validated.currentValue,
        unit: validated.unit,
        targetDate: validated.targetDate,
        progressPercent: Number(progressPercent.toFixed(1)),
        isCompleted: validated.isCompleted || progressPercent >= 100,
      },
    });

    return successResponse(goal, 201);
  } catch (error: any) {
    if (error.errors) return badRequestResponse('Validation failed', error.errors);
    return badRequestResponse(error.message || 'Failed to create fitness goal');
  }
}
