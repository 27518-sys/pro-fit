import { prisma } from './prisma';
import { NextResponse } from 'next/server';

export interface AuthSessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export async function getAuthUser(req: Request): Promise<AuthSessionUser | null> {
  try {
    // Check custom header, cookie, or authorization
    const userIdHeader = req.headers.get('x-user-id');
    const authHeader = req.headers.get('authorization');
    
    let targetUserId = 'demo-user-1'; // Default active session
    if (userIdHeader) {
      targetUserId = userIdHeader;
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      targetUserId = authHeader.replace('Bearer ', '').trim();
    }

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return user;
  } catch (error) {
    console.error('getAuthUser error:', error);
    return null;
  }
}

export function unauthorizedResponse(message = 'Unauthorized access. Valid session required.') {
  return NextResponse.json({ success: false, error: message }, { status: 401 });
}

export function forbiddenResponse(message = 'Forbidden. You do not have permission to access or modify this record.') {
  return NextResponse.json({ success: false, error: message }, { status: 403 });
}

export function notFoundResponse(message = 'Record not found.') {
  return NextResponse.json({ success: false, error: message }, { status: 404 });
}

export function badRequestResponse(message: string, errors?: any) {
  return NextResponse.json({ success: false, error: message, details: errors }, { status: 400 });
}

export function successResponse(data: any, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}
