import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse, badRequestResponse, successResponse } from '@/lib/auth';
import { nutritionLogSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');

  const whereClause: any = { userId: authUser.id };
  if (date) whereClause.date = date;

  const logs = await prisma.nutritionLog.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
  });

  return successResponse(logs);
}

export async function POST(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  try {
    const body = await req.json();
    const validated = nutritionLogSchema.parse(body);

    const log = await prisma.nutritionLog.create({
      data: {
        userId: authUser.id,
        date: validated.date,
        mealType: validated.mealType,
        foodName: validated.foodName,
        calories: validated.calories,
        proteinG: validated.proteinG,
        carbsG: validated.carbsG,
        fatG: validated.fatG,
        fiberG: validated.fiberG,
        servingSize: validated.servingSize,
        servingUnit: validated.servingUnit,
        notes: validated.notes,
      },
    });

    return successResponse(log, 201);
  } catch (error: any) {
    if (error.errors) return badRequestResponse('Validation failed', error.errors);
    return badRequestResponse(error.message || 'Failed to create nutrition entry');
  }
}
