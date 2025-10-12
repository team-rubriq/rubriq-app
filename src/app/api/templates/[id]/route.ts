import { NextResponse } from 'next/server';
import { withUser } from '../../_lib/supabase';
import { mapTemplate } from '../../_lib/mappers';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { supabase, user, error } = await withUser();
  if (error) return error;

  const { data: tpl, error: tErr } = await supabase
    .from('templates')
    .select(
      `id, name, subject_code, version, row_count, description, updated_at, created_by`,
    )
    .eq('id', params.id)
    .maybeSingle();

  if (tErr || !tpl)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data: trows } = await supabase
    .from('template_rows')
    .select(
      `id, position, task, ai_use_level, instructions, examples, acknowledgement`,
    )
    .eq('template_id', tpl.id)
    .order('position', { ascending: true });

  return NextResponse.json(mapTemplate(tpl, trows ?? []));
}
