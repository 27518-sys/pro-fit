import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse, badRequestResponse, successResponse } from '@/lib/auth';
import { hydrationTargetSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  let target = await prisma.hydrationTarget.findUnique({
    where: { userId: authUser.id },
  });

  if (!target) {
    target = await prisma.hydrationTarget.create({
      data: {
        userId: authUser.id,
        dailyTargetMl: 3000,
        reminderIntervalMins: 60,
        autoAdjustForActivity: true,
      },
    });
  }

  return successResponse(target);
}

export async function PUT(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  try {
    const body = await req.json();
    const validated = hydrationTargetSchema.parse(body);

    const target = await prisma.hydrationTarget.upsert({
      where: { userId: authUser.id },
      update: validated,
      create: { ...validated, userId: authUser.id },
    });

    return successResponse(target);
  } catch (error: any) {
    if (error.errors) return badRequestResponse('Validation failed', error.errors);
    return badRequestResponse(error.message || 'Failed to update hydration target');
  }
}
