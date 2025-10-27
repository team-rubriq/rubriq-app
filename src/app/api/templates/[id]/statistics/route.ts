// app/api/templates/[id]/statistics/route.ts

import { createClient } from '@/app/utils/supabase/server';
import { NextResponse } from 'next/server';

// app/api/templates/[id]/statistics/route.ts

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = await createClient();

    // Get template info
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select('id, name, subject_code')
      .eq('id', params.id)
      .single();

    if (templateError) throw templateError;

    // Count template rows
    const { count: templateRowCount, error: countError } = await supabase
      .from('template_rows')
      .select('*', { count: 'exact', head: true })
      .eq('template_id', params.id);

    if (countError) throw countError;

    // Get detailed usage
    const { data: usage, error: usageError } = await supabase.rpc(
      'get_template_usage_details',
      { template_id_param: params.id },
    );

    if (usageError) throw usageError;

    // Calculate stats
    const stats = {
      total_rubric_rows: usage.reduce(
        (sum: number, u: any) => sum + u.rows_from_template,
        0,
      ),
      unique_rubrics: usage.length,
      template_rows_used: new Set(
        usage.flatMap((u: any) => u.template_row_ids || []),
      ).size,
      template_row_count: templateRowCount || 0,
    };

    return NextResponse.json({
      template: {
        ...template,
        row_count: templateRowCount,
      },
      usage: usage || [],
      stats,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { message: error.message || 'Failed to fetch statistics' } },
      { status: 500 },
    );
  }
}
