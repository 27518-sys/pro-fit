import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse, forbiddenResponse, notFoundResponse, badRequestResponse, successResponse } from '@/lib/auth';
import { userIntegrationSchema } from '@/lib/validations';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const integration = await prisma.userIntegration.findUnique({
    where: { id: params.id },
  });

  if (!integration) return notFoundResponse('Integration not found');
  if (integration.userId !== authUser.id) return forbiddenResponse();

  return successResponse(integration);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const existing = await prisma.userIntegration.findUnique({
    where: { id: params.id },
  });

  if (!existing) return notFoundResponse('Integration not found');
  if (existing.userId !== authUser.id) return forbiddenResponse();

  try {
    const body = await req.json();
    const validated = userIntegrationSchema.partial().parse(body);

    const updated = await prisma.userIntegration.update({
      where: { id: params.id },
      data: {
        ...validated,
        lastSyncedAt: validated.isConnected ? new Date() : existing.lastSyncedAt,
      },
    });

    return successResponse(updated);
  } catch (error: any) {
    if (error.errors) return badRequestResponse('Validation failed', error.errors);
    return badRequestResponse(error.message || 'Failed to update integration');
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const existing = await prisma.userIntegration.findUnique({
    where: { id: params.id },
  });

  if (!existing) return notFoundResponse('Integration not found');
  if (existing.userId !== authUser.id) return forbiddenResponse();

  await prisma.userIntegration.delete({
    where: { id: params.id },
  });

  return successResponse({ deleted: true, id: params.id });
}
