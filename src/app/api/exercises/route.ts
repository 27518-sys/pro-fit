import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse, badRequestResponse, successResponse } from '@/lib/auth';
import { exerciseSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const targetMuscle = searchParams.get('targetMuscle');
  const search = searchParams.get('search');

  const whereClause: any = {
    OR: [{ isSystem: true }, { userId: authUser.id }],
  };

  if (category) whereClause.category = category;
  if (targetMuscle) whereClause.targetMuscle = targetMuscle;
  if (search) {
    whereClause.name = { contains: search };
  }

  const exercises = await prisma.exercise.findMany({
    where: whereClause,
    orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
  });

  return successResponse(exercises);
}

export async function POST(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  try {
    const body = await req.json();
    const validated = exerciseSchema.parse(body);

    const exercise = await prisma.exercise.create({
      data: {
        name: validated.name,
        description: validated.description,
        category: validated.category,
        targetMuscle: validated.targetMuscle,
        secondaryMuscle: validated.secondaryMuscle,
        equipment: validated.equipment,
        difficulty: validated.difficulty,
        instructions: validated.instructions,
        videoUrl: validated.videoUrl,
        userId: authUser.id,
        isSystem: false,
      },
    });

    return successResponse(exercise, 201);
  } catch (error: any) {
    if (error.errors) return badRequestResponse('Validation failed', error.errors);
    return badRequestResponse(error.message || 'Failed to create exercise');
  }
}
