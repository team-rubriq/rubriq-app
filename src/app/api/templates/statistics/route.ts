// app/api/templates/statistics/route.ts

import { createClient } from '@/app/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('get_template_usage_stats');

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error: any) {
    return NextResponse.json(
      { error: { message: error.message || 'Failed to fetch statistics' } },
      { status: 500 },
    );
  }
}
