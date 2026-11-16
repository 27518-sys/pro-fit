import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse, badRequestResponse, successResponse } from '@/lib/auth';
import { favoriteFoodSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const foods = await prisma.favoriteFood.findMany({
    where: { userId: authUser.id },
    orderBy: { lastUsedAt: 'desc' },
  });

  return successResponse(foods);
}

export async function POST(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  try {
    const body = await req.json();
    const validated = favoriteFoodSchema.parse(body);

    const food = await prisma.favoriteFood.create({
      data: {
        userId: authUser.id,
        name: validated.name,
        brand: validated.brand,
        defaultServing: validated.defaultServing,
        servingUnit: validated.servingUnit,
        calories: validated.calories,
        proteinG: validated.proteinG,
        carbsG: validated.carbsG,
        fatG: validated.fatG,
        fiberG: validated.fiberG,
        isFavorite: validated.isFavorite,
      },
    });

    return successResponse(food, 201);
  } catch (error: any) {
    if (error.errors) return badRequestResponse('Validation failed', error.errors);
    return badRequestResponse(error.message || 'Failed to create favorite food');
  }
}
