import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse, badRequestResponse, successResponse } from '@/lib/auth';
import { userIntegrationSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const integrations = await prisma.userIntegration.findMany({
    where: { userId: authUser.id },
  });

  return successResponse(integrations);
}

export async function POST(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  try {
    const body = await req.json();
    const validated = userIntegrationSchema.parse(body);

    const integration = await prisma.userIntegration.upsert({
      where: {
        userId_provider: {
          userId: authUser.id,
          provider: validated.provider,
        },
      },
      update: {
        isConnected: validated.isConnected,
        syncFrequency: validated.syncFrequency,
        configJson: validated.configJson,
        lastSyncedAt: validated.isConnected ? new Date() : undefined,
      },
      create: {
        userId: authUser.id,
        provider: validated.provider,
        isConnected: validated.isConnected,
        syncFrequency: validated.syncFrequency,
        configJson: validated.configJson,
        lastSyncedAt: validated.isConnected ? new Date() : undefined,
      },
    });

    return successResponse(integration, 201);
  } catch (error: any) {
    if (error.errors) return badRequestResponse('Validation failed', error.errors);
    return badRequestResponse(error.message || 'Failed to update integration');
  }
}
