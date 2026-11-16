import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse, badRequestResponse, successResponse } from '@/lib/auth';
import { personalRecordSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const exerciseId = searchParams.get('exerciseId');

  const whereClause: any = { userId: authUser.id };
  if (exerciseId) whereClause.exerciseId = exerciseId;

  const records = await prisma.personalRecord.findMany({
    where: whereClause,
    include: {
      exercise: { select: { id: true, name: true, category: true, targetMuscle: true } },
    },
    orderBy: { achievedAt: 'desc' },
  });

  return successResponse(records);
}

export async function POST(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  try {
    const body = await req.json();
    const validated = personalRecordSchema.parse(body);

    const record = await prisma.personalRecord.create({
      data: {
        userId: authUser.id,
        exerciseId: validated.exerciseId,
        workoutSessionId: validated.workoutSessionId,
        recordType: validated.recordType,
        value: validated.value,
        unit: validated.unit,
        notes: validated.notes,
        achievedAt: validated.achievedAt ? new Date(validated.achievedAt) : new Date(),
      },
      include: { exercise: true },
    });

    return successResponse(record, 201);
  } catch (error: any) {
    if (error.errors) return badRequestResponse('Validation failed', error.errors);
    return badRequestResponse(error.message || 'Failed to create personal record');
  }
}
