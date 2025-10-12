// src/app/api/rubrics/[id]/rows/route.ts
import { NextResponse } from 'next/server';
import { withUser } from '../../../_lib/supabase';
import { mapRubric } from '../../../_lib/mappers';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { id } = await params;
  const { supabase, user, error } = await withUser();
  if (error) return error;

  const { rows, bumpVersion } = await req.json();

  // Call RPC to upsert rows atomically + (optionally) bump version
  const { data: saved, error: rpcErr } = await supabase.rpc(
    'save_rubric_rows',
    {
      p_rubric_id: id,
      p_rows: rows, // array of row JSONs (id?, position, fields…)
      p_bump: !!bumpVersion,
    },
  );

  if (rpcErr)
    return NextResponse.json({ error: rpcErr.message }, { status: 400 });

  // Return full rubric with rows (saved returns rubric id/version typically; refetch for complete shape)
  const { data: r, error: rErr } = await supabase
    .from('rubrics')
    .select(
      `id, name, subject_code, version, row_count, status, template_id, template_version, updated_at, shared, owner_id`,
    )
    .eq('id', params.id)
    .maybeSingle();

  if (rErr || !r)
    return NextResponse.json(
      { error: 'Rubric not found after save' },
      { status: 404 },
    );

  const { data: rr } = await supabase
    .from('rubric_rows')
    .select(
      `id, position, template_row_id, task, ai_use_level, instructions, examples, acknowledgement`,
    )
    .eq('rubric_id', r.id)
    .order('position', { ascending: true });

  return NextResponse.json(mapRubric(r, rr ?? []));
}
