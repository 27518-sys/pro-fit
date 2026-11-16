import { NextRequest } from 'next/server';
import { checkSupabaseConnection } from '@/lib/supabase';
import { successResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const result = await checkSupabaseConnection();
  return successResponse({
    supabaseConfigured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project')),
    ...result,
  });
}
