import { NextResponse } from 'next/server';
import { withUser } from '../../_lib/supabase';
import { mapRubric } from '../../_lib/mappers';

export async function GET() {
  const { supabase, user, error } = await withUser();
  if (error) return error;

  const { data, error: dbErr } = await supabase
    .from('rubrics')
    .select(`
      id, name, subject_code, version, row_count, status,
      template_id, template_version, updated_at, shared, owner_id
    `)
    .eq('owner_id', user.id)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false });

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 400 });
  return NextResponse.json((data ?? []).map((r: any) => mapRubric(r)));
}
