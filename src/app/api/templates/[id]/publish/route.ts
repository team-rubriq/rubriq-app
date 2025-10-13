// src/app/api/templates/[id]/publish/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { requireAdmin } from '../../../_lib/admin-guard';
import { mapTemplate } from '../../../_lib/mappers';

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { id } = await params;
  const supabase = await createClient();
  const templateId = id;

  const { data: t, error: tErr } = await supabase
    .from('templates')
    .select('id, version')
    .eq('id', templateId)
    .maybeSingle();
  if (tErr || !t)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const newVersion = (t.version ?? 1) + 1;

  // 1) bump version
  const { error: uErr } = await supabase
    .from('templates')
    .update({ version: newVersion, updated_at: new Date().toISOString() })
    .eq('id', templateId);
  if (uErr) return NextResponse.json({ error: uErr.message }, { status: 400 });

  // 2) mark linked rubrics as update-available
  const { error: rErr } = await supabase
    .from('rubrics')
    .update({ status: 'update-available' })
    .eq('template_id', templateId)
    .lt('template_version', newVersion);
  if (rErr) {
    // non-fatal; log if you want
  }

  // 3) return updated template
  const { data: t2, error: t2Err } = await supabase
    .from('templates')
    .select(
      'id, name, subject_code, version, description, updated_at, created_by',
    )
    .eq('id', templateId)
    .maybeSingle();
  if (t2Err || !t2)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(mapTemplate(t2));
}
