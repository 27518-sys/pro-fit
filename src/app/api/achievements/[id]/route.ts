import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse, forbiddenResponse, notFoundResponse, badRequestResponse, successResponse } from '@/lib/auth';
import { achievementSchema } from '@/lib/validations';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const achievement = await prisma.achievement.findUnique({
    where: { id: params.id },
  });

  if (!achievement) return notFoundResponse('Achievement not found');
  if (!achievement.isSystem && achievement.userId !== authUser.id) return forbiddenResponse();

  return successResponse(achievement);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const existing = await prisma.achievement.findUnique({
    where: { id: params.id },
  });

  if (!existing) return notFoundResponse('Achievement not found');
  if (existing.isSystem) {
    return forbiddenResponse('System predefined achievements cannot be modified.');
  }
  if (existing.userId !== authUser.id) return forbiddenResponse();

  try {
    const body = await req.json();
    const validated = achievementSchema.partial().parse(body);

    const updated = await prisma.achievement.update({
      where: { id: params.id },
      data: validated,
    });

    return successResponse(updated);
  } catch (error: any) {
    if (error.errors) return badRequestResponse('Validation failed', error.errors);
    return badRequestResponse(error.message || 'Failed to update achievement');
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const existing = await prisma.achievement.findUnique({
    where: { id: params.id },
  });

  if (!existing) return notFoundResponse('Achievement not found');
  if (existing.isSystem) {
    return forbiddenResponse('System predefined achievements cannot be deleted.');
  }
  if (existing.userId !== authUser.id) return forbiddenResponse();

  await prisma.achievement.delete({
    where: { id: params.id },
  });

  return successResponse({ deleted: true, id: params.id });
}
