import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse, badRequestResponse, successResponse } from '@/lib/auth';
import { bodyMeasurementSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const measurements = await prisma.bodyMeasurement.findMany({
    where: { userId: authUser.id },
    orderBy: { date: 'desc' },
  });

  return successResponse(measurements);
}

export async function POST(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  try {
    const body = await req.json();
    const validated = bodyMeasurementSchema.parse(body);

    const measurement = await prisma.bodyMeasurement.create({
      data: {
        userId: authUser.id,
        date: validated.date,
        weightKg: validated.weightKg,
        bodyFatPercentage: validated.bodyFatPercentage,
        chestCm: validated.chestCm,
        waistCm: validated.waistCm,
        hipsCm: validated.hipsCm,
        bicepsCm: validated.bicepsCm,
        thighsCm: validated.thighsCm,
        notes: validated.notes,
        photoUrl: validated.photoUrl,
      },
    });

    // Also update current weight on UserProfile
    await prisma.userProfile.updateMany({
      where: { userId: authUser.id },
      data: { currentWeightKg: validated.weightKg },
    });

    return successResponse(measurement, 201);
  } catch (error: any) {
    if (error.errors) return badRequestResponse('Validation failed', error.errors);
    return badRequestResponse(error.message || 'Failed to record measurement');
  }
}
