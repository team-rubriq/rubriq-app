import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { requireAdmin } from '../_lib/admin-guard';
import { mapTemplate, mapTemplateRow } from '../_lib/mappers';

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const supabase = await createClient();
  const payload = await req.json();
  const { name, subjectCode, description = '', rows = [] } = payload ?? {};

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 1) create template shell
  const { data: created, error: cErr } = await supabase
    .from('templates')
    .insert({
      name,
      subject_code: subjectCode,
      description,
      version: 1,
      created_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single();
  if (cErr || !created)
    return NextResponse.json(
      { error: cErr?.message || 'Create failed' },
      { status: 400 },
    );

  // 2) optional initial rows
  if (rows?.length) {
    const rowsToInsert = rows.map((r: any, i: number) => ({
      template_id: created.id,
      position: r.position ?? i,
      task: r.task ?? '',
      ai_use_level: r.aiUseLevel ?? '',
      instructions: r.instructions ?? '',
      examples: r.examples ?? '',
      acknowledgement: r.acknowledgement ?? '',
    }));
    const { error: rErr } = await supabase
      .from('template_rows')
      .insert(rowsToInsert);
    if (rErr)
      return NextResponse.json({ error: rErr.message }, { status: 400 });
  }

  // 3) read back with rows
  const { data: rowsDb } = await supabase
    .from('template_rows')
    .select(
      'id, position, task, ai_use_level, instructions, examples, acknowledgement',
    )
    .eq('template_id', created.id)
    .order('position', { ascending: true });

  return NextResponse.json(mapTemplate(created, rowsDb ?? []));
}
