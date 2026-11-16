import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse, badRequestResponse, successResponse } from '@/lib/auth';
import { userProfileSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  let profile = await prisma.userProfile.findUnique({
    where: { userId: authUser.id },
  });

  if (!profile) {
    profile = await prisma.userProfile.create({
      data: { userId: authUser.id },
    });
  }

  return successResponse(profile);
}

export async function PUT(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  try {
    const body = await req.json();
    const validated = userProfileSchema.parse(body);

    const profile = await prisma.userProfile.upsert({
      where: { userId: authUser.id },
      update: validated,
      create: { ...validated, userId: authUser.id },
    });

    return successResponse(profile);
  } catch (error: any) {
    if (error.errors) return badRequestResponse('Validation failed', error.errors);
    return badRequestResponse(error.message || 'Failed to update profile');
  }
}
