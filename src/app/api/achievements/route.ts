import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse, badRequestResponse, successResponse } from '@/lib/auth';
import { achievementSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const achievements = await prisma.achievement.findMany({
    where: {
      OR: [{ isSystem: true }, { userId: authUser.id }],
    },
    orderBy: [{ isSystem: 'desc' }, { points: 'desc' }],
  });

  return successResponse(achievements);
}

export async function POST(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  try {
    const body = await req.json();
    const validated = achievementSchema.parse(body);

    const existingKey = await prisma.achievement.findUnique({
      where: { key: validated.key },
    });

    if (existingKey) {
      return badRequestResponse(`Achievement with key '${validated.key}' already exists.`);
    }

    const achievement = await prisma.achievement.create({
      data: {
        key: validated.key,
        title: validated.title,
        description: validated.description,
        icon: validated.icon || 'Award',
        badgeColor: validated.badgeColor || 'amber',
        criteriaType: validated.criteriaType || 'WORKOUT_COUNT',
        criteriaValue: validated.criteriaValue || 1,
        points: validated.points || 50,
        userId: authUser.id,
        isSystem: false,
      },
    });

    return successResponse(achievement, 201);
  } catch (error: any) {
    if (error.errors) return badRequestResponse('Validation failed', error.errors);
    return badRequestResponse(error.message || 'Failed to create achievement');
  }
}
