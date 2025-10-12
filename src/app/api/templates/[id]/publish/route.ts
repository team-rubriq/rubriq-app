// src/app/api/templates/[id]/publish/route.ts
import { NextResponse } from 'next/server';
import { withUser } from '../../../_lib/supabase';
import { mapTemplate } from '../../../_lib/mappers';

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const { supabase, user, error } = await withUser();
  if (error) return error;

  // TODO: admin check

  const { data: cur, error: curErr } = await supabase
    .from('templates')
    .select(`id, version`)
    .eq('id', params.id)
    .maybeSingle();

  if (curErr || !cur) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { error: upErr } = await supabase
    .from('templates')
    .update({ version: (cur.version ?? 1) + 1 })
    .eq('id', params.id);

  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 400 });

  const { data: tpl } = await supabase
    .from('templates')
    .select(`id, name, subject_code, version, row_count, description, updated_at, created_by`)
    .eq('id', params.id)
    .maybeSingle();

  const { data: trows } = await supabase
    .from('template_rows')
    .select(`id, position, task, ai_use_level, instructions, examples, acknowledgement`)
    .eq('template_id', params.id)
    .order('position', { ascending: true });

  return NextResponse.json(mapTemplate(tpl, trows ?? []));
}
