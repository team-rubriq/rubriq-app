// src/app/api/rubrics/[id]/apply-template-updates/route.ts
import { NextResponse } from 'next/server';
import { withUser } from '../../../_lib/supabase';
import { mapRubric } from '../../../_lib/mappers';

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { id } = await params;
  const { supabase, user, error } = await withUser();
  if (error) return error;

  const { acceptRowIds } = await req.json();
  if (!Array.isArray(acceptRowIds) || acceptRowIds.length === 0) {
    return NextResponse.json(
      { error: 'acceptRowIds must be a non-empty array' },
      { status: 400 },
    );
  }

  const { error: rpcErr } = await supabase.rpc('apply_template_updates', {
    p_rubric_id: id,
    p_accept: acceptRowIds,
  });

  if (rpcErr)
    return NextResponse.json({ error: rpcErr.message }, { status: 400 });

  // Refetch rubric with rows
  const { data: r, error: rErr } = await supabase
    .from('rubrics')
    .select(
      `id, name, subject_code, version, row_count, status, template_id, template_version, updated_at, shared, owner_id`,
    )
    .eq('id', id)
    .maybeSingle();

  if (rErr || !r)
    return NextResponse.json({ error: 'Rubric not found' }, { status: 404 });

  const { data: rr } = await supabase
    .from('rubric_rows')
    .select(
      `id, position, template_row_id, task, ai_use_level, instructions, examples, acknowledgement`,
    )
    .eq('rubric_id', r.id)
    .order('position', { ascending: true });

  return NextResponse.json(mapRubric(r, rr ?? []));
}
