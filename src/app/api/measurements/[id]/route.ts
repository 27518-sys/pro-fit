import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse, forbiddenResponse, notFoundResponse, badRequestResponse, successResponse } from '@/lib/auth';
import { bodyMeasurementSchema } from '@/lib/validations';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const measurement = await prisma.bodyMeasurement.findUnique({
    where: { id: params.id },
  });

  if (!measurement) return notFoundResponse('Measurement not found');
  if (measurement.userId !== authUser.id) return forbiddenResponse();

  return successResponse(measurement);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const existing = await prisma.bodyMeasurement.findUnique({
    where: { id: params.id },
  });

  if (!existing) return notFoundResponse('Measurement not found');
  if (existing.userId !== authUser.id) return forbiddenResponse();

  try {
    const body = await req.json();
    const validated = bodyMeasurementSchema.partial().parse(body);

    const updated = await prisma.bodyMeasurement.update({
      where: { id: params.id },
      data: validated,
    });

    if (validated.weightKg) {
      await prisma.userProfile.updateMany({
        where: { userId: authUser.id },
        data: { currentWeightKg: validated.weightKg },
      });
    }

    return successResponse(updated);
  } catch (error: any) {
    if (error.errors) return badRequestResponse('Validation failed', error.errors);
    return badRequestResponse(error.message || 'Failed to update measurement');
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const existing = await prisma.bodyMeasurement.findUnique({
    where: { id: params.id },
  });

  if (!existing) return notFoundResponse('Measurement not found');
  if (existing.userId !== authUser.id) return forbiddenResponse();

  await prisma.bodyMeasurement.delete({
    where: { id: params.id },
  });

  return successResponse({ deleted: true, id: params.id });
}
