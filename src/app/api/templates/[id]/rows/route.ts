import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { requireAdmin } from '../../../_lib/admin-guard';
import { mapTemplate } from '../../../_lib/mappers';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { id } = params;
  const supabase = await createClient();
  const { rows = [], bumpVersion = true } = await req.json();

  // strategy: replace all rows (simplest, keep ids if provided)
  // 1) delete existing rows
  const { error: dErr } = await supabase
    .from('template_rows')
    .delete()
    .eq('template_id', id);
  if (dErr) return NextResponse.json({ error: dErr.message }, { status: 400 });

  // 2) insert new set (sorted by position)
  const toInsert = (rows as any[]).map((r, i) => ({
    template_id: id,
    position: r.position ?? i,
    task: r.task ?? '',
    ai_use_level: r.aiUseLevel ?? '',
    instructions: r.instructions ?? '',
    examples: r.examples ?? '',
    acknowledgement: r.acknowledgement ?? '',
  }));
  const { error: iErr } = await supabase.from('template_rows').insert(toInsert);
  if (iErr) return NextResponse.json({ error: iErr.message }, { status: 400 });

  // 3) optionally bump template version (minor)
  if (bumpVersion) {
    const { error: uErr } = await supabase
      .from('templates')
      .update({
        version: undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    // ^ If you want a strict publish gate, you can skip bump here and only bump in /publish.
    // Typically: keep version for "draft changes" and only bump in publish route.
    if (uErr)
      return NextResponse.json({ error: uErr.message }, { status: 400 });
  } else {
    const { error: tsErr } = await supabase
      .from('templates')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', id);
    if (tsErr)
      return NextResponse.json({ error: tsErr.message }, { status: 400 });
  }

  // 4) read back
  const [{ data: t }, { data: rowsDb }] = await Promise.all([
    supabase
      .from('templates')
      .select(
        'id, name, subject_code, version, description, updated_at, created_by',
      )
      .eq('id', id)
      .maybeSingle(),
    supabase
      .from('template_rows')
      .select(
        'id, position, task, ai_use_level, instructions, examples, acknowledgement',
      )
      .eq('template_id', id)
      .order('position', { ascending: true }),
  ]);

  if (!t) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(mapTemplate(t, rowsDb ?? []));
}
