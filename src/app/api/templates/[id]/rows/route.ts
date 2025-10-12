import { NextResponse } from 'next/server';
import { withUser } from '../../../_lib/supabase';
import { mapTemplate } from '../../../_lib/mappers';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { id } = await params;
  const { supabase, user, error } = await withUser();
  if (error) return error;

  // TODO: admin check

  const { rows, bumpVersion } = await req.json();

  // naive sync: delete all rows and reinsert (or write a dedicated RPC if you prefer diff/merge)
  const { error: delErr } = await supabase
    .from('template_rows')
    .delete()
    .eq('template_id', id);
  if (delErr)
    return NextResponse.json({ error: delErr.message }, { status: 400 });

  if (Array.isArray(rows) && rows.length) {
    const payload = rows.map((r: any, i: number) => ({
      template_id: id,
      position: r.position ?? i,
      task: r.task ?? '',
      ai_use_level: r.aiUseLevel ?? '',
      instructions: r.instructions ?? '',
      examples: r.examples ?? '',
      acknowledgement: r.acknowledgement ?? '',
    }));
    const { error: insErr } = await supabase
      .from('template_rows')
      .insert(payload);
    if (insErr)
      return NextResponse.json({ error: insErr.message }, { status: 400 });
  }

  if (bumpVersion) {
    const { error: bumpErr } = await supabase
      .from('templates')
      .update({
        version: supabase.rpc('increment_int', {
          /* optional */
        }),
      }) // or do read+update
      .eq('id', id);

    // Simpler inline bump:
    const { data: curTpl } = await supabase
      .from('templates')
      .select('version')
      .eq('id', id)
      .maybeSingle();
    const { error: bumpSimpleErr } = await supabase
      .from('templates')
      .update({ version: (curTpl?.version ?? 1) + 1 })
      .eq('id', id);
    if (bumpSimpleErr)
      return NextResponse.json(
        { error: bumpSimpleErr.message },
        { status: 400 },
      );
  }

  const { data: tpl } = await supabase
    .from('templates')
    .select(
      `id, name, subject_code, version, row_count, description, updated_at, created_by`,
    )
    .eq('id', id)
    .maybeSingle();

  const { data: trows } = await supabase
    .from('template_rows')
    .select(
      `id, position, task, ai_use_level, instructions, examples, acknowledgement`,
    )
    .eq('template_id', id)
    .order('position', { ascending: true });

  return NextResponse.json(mapTemplate(tpl, trows ?? []));
}
