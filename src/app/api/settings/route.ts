import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse, badRequestResponse, successResponse } from '@/lib/auth';
import { personalSettingsSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  let settings = await prisma.personalSettings.findUnique({
    where: { userId: authUser.id },
  });

  if (!settings) {
    settings = await prisma.personalSettings.create({
      data: { userId: authUser.id },
    });
  }

  return successResponse(settings);
}

export async function PUT(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  try {
    const body = await req.json();
    const validated = personalSettingsSchema.parse(body);

    const settings = await prisma.personalSettings.upsert({
      where: { userId: authUser.id },
      update: validated,
      create: { ...validated, userId: authUser.id },
    });

    return successResponse(settings);
  } catch (error: any) {
    if (error.errors) return badRequestResponse('Validation failed', error.errors);
    return badRequestResponse(error.message || 'Failed to update settings');
  }
}
