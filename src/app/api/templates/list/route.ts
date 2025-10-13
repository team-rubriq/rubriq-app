import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { mapTemplate } from '../../_lib/mappers';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Prefer the view with row_count
  const { data, error } = await supabase
    .from('templates_with_counts') // create this view in Supabase (below)
    .select(
      'id, name, subject_code, version, row_count, description, updated_at, created_by',
    )
    .order('updated_at', { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json((data ?? []).map((t: any) => mapTemplate(t)));
}
