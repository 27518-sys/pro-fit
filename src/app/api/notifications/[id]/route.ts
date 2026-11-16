import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse, forbiddenResponse, notFoundResponse, badRequestResponse, successResponse } from '@/lib/auth';
import { notificationSchema } from '@/lib/validations';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const notification = await prisma.notification.findUnique({
    where: { id: params.id },
  });

  if (!notification) return notFoundResponse('Notification not found');
  if (notification.userId !== authUser.id) return forbiddenResponse();

  return successResponse(notification);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const existing = await prisma.notification.findUnique({
    where: { id: params.id },
  });

  if (!existing) return notFoundResponse('Notification not found');
  if (existing.userId !== authUser.id) return forbiddenResponse();

  try {
    const body = await req.json();
    const validated = notificationSchema.partial().parse(body);

    const updated = await prisma.notification.update({
      where: { id: params.id },
      data: {
        ...validated,
        readAt: validated.isRead ? new Date() : existing.readAt,
      },
    });

    return successResponse(updated);
  } catch (error: any) {
    if (error.errors) return badRequestResponse('Validation failed', error.errors);
    return badRequestResponse(error.message || 'Failed to update notification');
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const existing = await prisma.notification.findUnique({
    where: { id: params.id },
  });

  if (!existing) return notFoundResponse('Notification not found');
  if (existing.userId !== authUser.id) return forbiddenResponse();

  await prisma.notification.delete({
    where: { id: params.id },
  });

  return successResponse({ deleted: true, id: params.id });
}
