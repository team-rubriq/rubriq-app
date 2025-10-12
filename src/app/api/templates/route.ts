// src/app/api/templates/route.ts
import { NextResponse } from 'next/server';
import { withUser } from '../_lib/supabase';
import { mapTemplate } from '../_lib/mappers';

export async function POST(req: Request) {
  const { supabase, user, error } = await withUser();
  if (error) return error;

  // TODO: admin check here (e.g., profiles.role = 'admin')

  const body = await req.json();
  const { name, subjectCode, description, rows } = body;

  const { data: tpl, error: insErr } = await supabase
    .from('templates')
    .insert({
      name,
      subject_code: subjectCode,
      description: description ?? '',
      version: 1,
      created_by: user.id,
    })
    .select('*')
    .single();

  if (insErr)
    return NextResponse.json({ error: insErr.message }, { status: 400 });

  if (Array.isArray(rows) && rows.length) {
    const payload = rows.map((r: any, i: number) => ({
      template_id: tpl.id,
      position: r.position ?? i,
      task: r.task ?? '',
      ai_use_level: r.aiUseLevel ?? '',
      instructions: r.instructions ?? '',
      examples: r.examples ?? '',
      acknowledgement: r.acknowledgement ?? '',
    }));
    const { error: rowErr } = await supabase
      .from('template_rows')
      .insert(payload);
    if (rowErr)
      return NextResponse.json({ error: rowErr.message }, { status: 400 });
  }

  const { data: trows } = await supabase
    .from('template_rows')
    .select(
      `id, position, task, ai_use_level, instructions, examples, acknowledgement`,
    )
    .eq('template_id', tpl.id)
    .order('position', { ascending: true });

  return NextResponse.json(mapTemplate(tpl, trows ?? []));
}
