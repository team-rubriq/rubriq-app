import { NextResponse } from 'next/server';
import { withUser } from '../../_lib/supabase';
import { mapRubric } from '../../_lib/mappers';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { id } = await params;
  const { supabase, error } = await withUser();
  if (error) return error;

  const { data: r, error: rErr } = await supabase
    .from('rubrics')
    .select(
      `id, name, subject_code, version, row_count, status, template_id, template_version, updated_at, shared, owner_id`,
    )
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();

  if (rErr || !r)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // rows
  const { data: rows } = await supabase
    .from('rubric_rows')
    .select(
      `id, position, template_row_id, task, ai_use_level, instructions, examples, acknowledgement`,
    )
    .eq('rubric_id', r.id)
    .order('position', { ascending: true });

  return NextResponse.json(mapRubric(r, rows ?? []));
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { supabase, user, error } = await withUser();
  const { id } = await params;
  if (error) return error;

  const body = await req.json();
  const patch: any = {};
  if (typeof body.name === 'string') patch.name = body.name;
  if (typeof body.subjectCode === 'string')
    patch.subject_code = body.subjectCode;

  if (!Object.keys(patch).length) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const { data, error: upErr } = await supabase
    .from('rubrics')
    .update(patch)
    .eq('id', id)
    .select(
      `id, name, subject_code, version, row_count, status, template_id, template_version, updated_at, shared, owner_id`,
    )
    .maybeSingle();

  if (upErr || !data)
    return NextResponse.json(
      { error: upErr?.message ?? 'Update failed' },
      { status: 400 },
    );
  return NextResponse.json(mapRubric(data));
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  const { id } = await params;
  const { supabase, user, error } = await withUser();
  if (error) return error;

  // soft delete
  const { error: delErr } = await supabase
    .from('rubrics')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (delErr)
    return NextResponse.json({ error: delErr.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
