import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { requireAdmin } from '../../_lib/admin-guard';
import { mapTemplate, mapTemplateRow } from '../../_lib/mappers';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: t, error: tErr } = await supabase
    .from('templates')
    .select(
      'id, name, subject_code, version, description, updated_at, created_by',
    )
    .eq('id', id)
    .maybeSingle();
  if (tErr || !t)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data: rows, error: rErr } = await supabase
    .from('template_rows')
    .select(
      'id, position, task, ai_use_level, instructions, examples, acknowledgement',
    )
    .eq('template_id', id)
    .order('position', { ascending: true });
  if (rErr) return NextResponse.json({ error: rErr.message }, { status: 400 });

  return NextResponse.json(mapTemplate(t, rows));
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { id } = await params;
  const supabase = await createClient();
  const body = await req.json().catch(() => ({}) as any);
  const { name, subjectCode, description } = body ?? {};

  // basic validation
  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  // Build updates only with provided fields
  const updates: Record<string, any> = {
    name: name.trim(),
    updated_at: new Date().toISOString(),
  };
  if (typeof subjectCode === 'string' && subjectCode.trim()) {
    updates.subject_code = subjectCode.trim().toUpperCase();
  }
  if (typeof description !== 'undefined') {
    updates.description = description ?? '';
  }

  // Update template meta
  const { error: uErr } = await supabase
    .from('templates')
    .update(updates)
    .eq('id', id);

  if (uErr) {
    return NextResponse.json({ error: uErr.message }, { status: 400 });
  }

  // Read back (same shape as GET)
  const { data: t, error: tErr } = await supabase
    .from('templates')
    .select(
      'id, name, subject_code, version, description, updated_at, created_by',
    )
    .eq('id', id)
    .maybeSingle();

  if (tErr || !t) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { data: rows, error: rErr } = await supabase
    .from('template_rows')
    .select(
      'id, position, task, ai_use_level, instructions, examples, acknowledgement',
    )
    .eq('template_id', id)
    .order('position', { ascending: true });

  if (rErr) {
    return NextResponse.json({ error: rErr.message }, { status: 400 });
  }

  return NextResponse.json(mapTemplate(t, rows));
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { id } = await params;
  const supabase = await createClient();

  // Hard delete template; template_rows should have FK ON DELETE CASCADE.
  const { error } = await supabase.from('templates').delete().eq('id', id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
