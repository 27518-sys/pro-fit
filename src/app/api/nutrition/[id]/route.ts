import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse, forbiddenResponse, notFoundResponse, badRequestResponse, successResponse } from '@/lib/auth';
import { nutritionLogSchema } from '@/lib/validations';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const log = await prisma.nutritionLog.findUnique({
    where: { id: params.id },
  });

  if (!log) return notFoundResponse('Nutrition entry not found');
  if (log.userId !== authUser.id) return forbiddenResponse();

  return successResponse(log);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const existing = await prisma.nutritionLog.findUnique({
    where: { id: params.id },
  });

  if (!existing) return notFoundResponse('Nutrition entry not found');
  if (existing.userId !== authUser.id) return forbiddenResponse();

  try {
    const body = await req.json();
    const validated = nutritionLogSchema.partial().parse(body);

    const updated = await prisma.nutritionLog.update({
      where: { id: params.id },
      data: validated,
    });

    return successResponse(updated);
  } catch (error: any) {
    if (error.errors) return badRequestResponse('Validation failed', error.errors);
    return badRequestResponse(error.message || 'Failed to update nutrition entry');
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const existing = await prisma.nutritionLog.findUnique({
    where: { id: params.id },
  });

  if (!existing) return notFoundResponse('Nutrition entry not found');
  if (existing.userId !== authUser.id) return forbiddenResponse();

  await prisma.nutritionLog.delete({
    where: { id: params.id },
  });

  return successResponse({ deleted: true, id: params.id });
}
