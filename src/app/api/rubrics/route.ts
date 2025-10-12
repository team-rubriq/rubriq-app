import { NextResponse } from 'next/server';
import { withUser } from '../_lib/supabase';
import { mapRubric } from '../_lib/mappers';

export async function POST(req: Request) {
  const { supabase, user, error } = await withUser();
  if (error) return error;

  const body = await req.json();

  // Create rubric shell
  const base = {
    name: body.name,
    subject_code: body.subjectCode,
    owner_id: user.id,
    version: 1,
    status: 'active',
    shared: false,
    template_id: body.mode === 'template' ? body.templateId : null,
    template_version: null as number | null,
  };

  if (body.mode === 'template') {
    // grab template version & rows to seed
    const { data: tpl } = await supabase
      .from('templates')
      .select(`id, version`)
      .eq('id', body.templateId)
      .maybeSingle();

    base.template_version = tpl?.version ?? 1;
  }

  const { data: inserted, error: insErr } = await supabase
    .from('rubrics')
    .insert(base)
    .select('*')
    .single();

  if (insErr)
    return NextResponse.json({ error: insErr.message }, { status: 400 });

  let seededCount = 0;

  // Seed rows
  if (body.mode === 'scratch') {
    const n = Math.max(1, Math.min(50, body.initialRows ?? 10));
    const rowsPayload = Array.from({ length: n }, (_, i) => ({
      rubric_id: inserted.id,
      position: i,
      template_row_id: null,
      task: '',
      ai_use_level: '',
      instructions: '',
      examples: '',
      acknowledgement: '',
    }));
    const { error: rowErr } = await supabase
      .from('rubric_rows')
      .insert(rowsPayload);
    if (rowErr)
      return NextResponse.json({ error: rowErr.message }, { status: 400 });
    seededCount = rowsPayload.length;
  } else {
    // from template: copy rows; optionally link to template rows
    const { data: trows, error: trErr } = await supabase
      .from('template_rows')
      .select(
        `id, position, task, ai_use_level, instructions, examples, acknowledgement`,
      )
      .eq('template_id', body.templateId)
      .order('position', { ascending: true });

    if (trErr)
      return NextResponse.json({ error: trErr.message }, { status: 400 });

    const rowsPayload = (trows ?? []).map((t, i) => ({
      rubric_id: inserted.id,
      position: i,
      template_row_id: body.linkForUpdates ? t.id : null,
      task: t.task,
      ai_use_level: t.ai_use_level,
      instructions: t.instructions,
      examples: t.examples,
      acknowledgement: t.acknowledgement,
    }));

    if (rowsPayload.length) {
      const { error: rowErr } = await supabase
        .from('rubric_rows')
        .insert(rowsPayload);
      if (rowErr)
        return NextResponse.json({ error: rowErr.message }, { status: 400 });
    }
    seededCount = rowsPayload.length;
  }

  // set row_count immediately so list pages show correct count
  await supabase
    .from('rubrics')
    .update({ row_count: seededCount })
    .eq('id', inserted.id);

  // Return full rubric with rows
  const { data: rows } = await supabase
    .from('rubric_rows')
    .select(
      `id, position, template_row_id, task, ai_use_level, instructions, examples, acknowledgement`,
    )
    .eq('rubric_id', inserted.id)
    .order('position', { ascending: true });

  return NextResponse.json(mapRubric(inserted, rows ?? []));
}
