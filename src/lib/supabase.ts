import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project.supabase.co')) {
    if (!supabaseInstance) {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    }
    return supabaseInstance;
  }
  return null;
}

export async function checkSupabaseConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    const client = getSupabase();
    if (!client) {
      return {
        connected: false,
        message: 'Supabase credentials not configured or set to placeholder in .env',
      };
    }
    const { data, error } = await client.from('Exercise').select('id').limit(1);
    if (error) {
      return { connected: false, message: error.message };
    }
    return { connected: true, message: 'Connected to Supabase PostgreSQL successfully!' };
  } catch (err: any) {
    return { connected: false, message: err.message || 'Failed to connect to Supabase' };
  }
}
