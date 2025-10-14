import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/app/utils/supabase/server';
import { getIsAdmin } from '@/app/api/_lib/is-admin';
import TemplateEditorClient from '@/components/edit-template-page/TemplateEditorClient';
import type { RubricTemplate, TemplateRow } from '@/lib/types';

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/signin');

  const { isAdmin } = await getIsAdmin();

  // Load the template shell
  const { data: t, error: tErr } = await supabase
    .from('templates')
    .select(
      'id, name, subject_code, version, description, updated_at, created_by',
    )
    .eq('id', id)
    .maybeSingle();

  if (tErr || !t) return notFound();

  // Load rows (RLS will allow if shared/owner/admin)
  const { data: rows, error: rErr } = await supabase
    .from('template_rows')
    .select(
      'id, position, task, ai_use_level, instructions, examples, acknowledgement',
    )
    .eq('template_id', t.id)
    .order('position', { ascending: true });

  if (rErr) redirect('/error');

  const initialTemplate: RubricTemplate = {
    id: t.id,
    name: t.name,
    subjectCode: t.subject_code,
    version: t.version,
    description: t.description ?? '',
    updatedAt: t.updated_at,
    createdBy: t.created_by,
    rowCount: rows?.length ?? 0,
    rows: (rows ?? []).map((r: any) => ({
      id: r.id,
      position: r.position,
      task: r.task ?? '',
      aiUseLevel: r.ai_use_level ?? '',
      instructions: r.instructions ?? '',
      examples: r.examples ?? '',
      acknowledgement: r.acknowledgement ?? '',
    })) as TemplateRow[],
  };

  return (
    <TemplateEditorClient initialTemplate={initialTemplate} isAdmin={isAdmin} />
  );
}
