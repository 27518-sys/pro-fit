import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse, forbiddenResponse, notFoundResponse, badRequestResponse, successResponse } from '@/lib/auth';
import { personalRecordSchema } from '@/lib/validations';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const record = await prisma.personalRecord.findUnique({
    where: { id: params.id },
    include: { exercise: true },
  });

  if (!record) return notFoundResponse('Personal record not found');
  if (record.userId !== authUser.id) return forbiddenResponse();

  return successResponse(record);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const existing = await prisma.personalRecord.findUnique({
    where: { id: params.id },
  });

  if (!existing) return notFoundResponse('Personal record not found');
  if (existing.userId !== authUser.id) return forbiddenResponse();

  try {
    const body = await req.json();
    const validated = personalRecordSchema.partial().parse(body);

    const updated = await prisma.personalRecord.update({
      where: { id: params.id },
      data: {
        ...validated,
        achievedAt: validated.achievedAt ? new Date(validated.achievedAt) : existing.achievedAt,
      },
      include: { exercise: true },
    });

    return successResponse(updated);
  } catch (error: any) {
    if (error.errors) return badRequestResponse('Validation failed', error.errors);
    return badRequestResponse(error.message || 'Failed to update personal record');
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const existing = await prisma.personalRecord.findUnique({
    where: { id: params.id },
  });

  if (!existing) return notFoundResponse('Personal record not found');
  if (existing.userId !== authUser.id) return forbiddenResponse();

  await prisma.personalRecord.delete({
    where: { id: params.id },
  });

  return successResponse({ deleted: true, id: params.id });
}
