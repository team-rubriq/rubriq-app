import { createClient } from '@/app/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function withUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return {
      supabase,
      user: null as any,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }
  return { supabase, user, error: null as any };
}
