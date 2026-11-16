import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse, forbiddenResponse, notFoundResponse, badRequestResponse, successResponse } from '@/lib/auth';
import { favoriteFoodSchema } from '@/lib/validations';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const food = await prisma.favoriteFood.findUnique({
    where: { id: params.id },
  });

  if (!food) return notFoundResponse('Food record not found');
  if (food.userId !== authUser.id) return forbiddenResponse();

  return successResponse(food);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const existing = await prisma.favoriteFood.findUnique({
    where: { id: params.id },
  });

  if (!existing) return notFoundResponse('Food record not found');
  if (existing.userId !== authUser.id) return forbiddenResponse();

  try {
    const body = await req.json();
    const validated = favoriteFoodSchema.partial().parse(body);

    const updated = await prisma.favoriteFood.update({
      where: { id: params.id },
      data: {
        ...validated,
        lastUsedAt: new Date(),
      },
    });

    return successResponse(updated);
  } catch (error: any) {
    if (error.errors) return badRequestResponse('Validation failed', error.errors);
    return badRequestResponse(error.message || 'Failed to update food record');
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const existing = await prisma.favoriteFood.findUnique({
    where: { id: params.id },
  });

  if (!existing) return notFoundResponse('Food record not found');
  if (existing.userId !== authUser.id) return forbiddenResponse();

  await prisma.favoriteFood.delete({
    where: { id: params.id },
  });

  return successResponse({ deleted: true, id: params.id });
}
