import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse, forbiddenResponse, notFoundResponse, badRequestResponse, successResponse } from '@/lib/auth';
import { exerciseSchema } from '@/lib/validations';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const exercise = await prisma.exercise.findUnique({
    where: { id: params.id },
  });

  if (!exercise) return notFoundResponse('Exercise not found');

  if (!exercise.isSystem && exercise.userId !== authUser.id) {
    return forbiddenResponse();
  }

  return successResponse(exercise);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const existing = await prisma.exercise.findUnique({
    where: { id: params.id },
  });

  if (!existing) return notFoundResponse('Exercise not found');

  if (existing.isSystem) {
    return forbiddenResponse('System predefined exercises cannot be modified.');
  }

  if (existing.userId !== authUser.id) {
    return forbiddenResponse();
  }

  try {
    const body = await req.json();
    const validated = exerciseSchema.partial().parse(body);

    const updated = await prisma.exercise.update({
      where: { id: params.id },
      data: validated,
    });

    return successResponse(updated);
  } catch (error: any) {
    if (error.errors) return badRequestResponse('Validation failed', error.errors);
    return badRequestResponse(error.message || 'Failed to update exercise');
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const existing = await prisma.exercise.findUnique({
    where: { id: params.id },
  });

  if (!existing) return notFoundResponse('Exercise not found');

  if (existing.isSystem) {
    return forbiddenResponse('System predefined exercises cannot be deleted.');
  }

  if (existing.userId !== authUser.id) {
    return forbiddenResponse();
  }

  await prisma.exercise.delete({
    where: { id: params.id },
  });

  return successResponse({ deleted: true, id: params.id });
}
