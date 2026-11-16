import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse, forbiddenResponse, notFoundResponse, badRequestResponse, successResponse } from '@/lib/auth';
import { fitnessGoalSchema } from '@/lib/validations';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const goal = await prisma.fitnessGoal.findUnique({
    where: { id: params.id },
  });

  if (!goal) return notFoundResponse('Goal not found');
  if (goal.userId !== authUser.id) return forbiddenResponse();

  return successResponse(goal);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const existing = await prisma.fitnessGoal.findUnique({
    where: { id: params.id },
  });

  if (!existing) return notFoundResponse('Goal not found');
  if (existing.userId !== authUser.id) return forbiddenResponse();

  try {
    const body = await req.json();
    const validated = fitnessGoalSchema.partial().parse(body);

    const targetVal = validated.targetValue !== undefined ? validated.targetValue : existing.targetValue;
    const currentVal = validated.currentValue !== undefined ? validated.currentValue : existing.currentValue;
    const progressPercent =
      targetVal > 0 ? Math.min(100, Math.max(0, (currentVal / targetVal) * 100)) : existing.progressPercent;
    const isCompleted =
      validated.isCompleted !== undefined ? validated.isCompleted : progressPercent >= 100;

    const updated = await prisma.fitnessGoal.update({
      where: { id: params.id },
      data: {
        ...validated,
        progressPercent: Number(progressPercent.toFixed(1)),
        isCompleted,
      },
    });

    return successResponse(updated);
  } catch (error: any) {
    if (error.errors) return badRequestResponse('Validation failed', error.errors);
    return badRequestResponse(error.message || 'Failed to update goal');
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const existing = await prisma.fitnessGoal.findUnique({
    where: { id: params.id },
  });

  if (!existing) return notFoundResponse('Goal not found');
  if (existing.userId !== authUser.id) return forbiddenResponse();

  await prisma.fitnessGoal.delete({
    where: { id: params.id },
  });

  return successResponse({ deleted: true, id: params.id });
}
