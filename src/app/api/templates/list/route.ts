import { NextResponse } from 'next/server';
import { withUser } from '../../_lib/supabase';
import { mapTemplate } from '../../_lib/mappers';

export async function GET() {
  const { supabase, error } = await withUser();
  if (error) return error;

  const { data, error: dbErr } = await supabase
    .from('templates_with_counts')
    .select(
      `id, name, subject_code, version, row_count, description, updated_at, created_by`,
    )
    .order('updated_at', { ascending: false });

  if (dbErr)
    return NextResponse.json({ error: dbErr.message }, { status: 400 });
  return NextResponse.json((data ?? []).map((t: any) => mapTemplate(t)));
}
