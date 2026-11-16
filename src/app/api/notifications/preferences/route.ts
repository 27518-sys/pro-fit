import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse, badRequestResponse, successResponse } from '@/lib/auth';
import { notificationPreferenceSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  let prefs = await prisma.notificationPreference.findUnique({
    where: { userId: authUser.id },
  });

  if (!prefs) {
    prefs = await prisma.notificationPreference.create({
      data: { userId: authUser.id },
    });
  }

  return successResponse(prefs);
}

export async function PUT(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  try {
    const body = await req.json();
    const validated = notificationPreferenceSchema.parse(body);

    const prefs = await prisma.notificationPreference.upsert({
      where: { userId: authUser.id },
      update: validated,
      create: { ...validated, userId: authUser.id },
    });

    return successResponse(prefs);
  } catch (error: any) {
    if (error.errors) return badRequestResponse('Validation failed', error.errors);
    return badRequestResponse(error.message || 'Failed to update preferences');
  }
}
