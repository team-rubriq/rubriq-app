import { notFound, redirect } from 'next/navigation';
import RubricEditorClient from '@/components/edit-rubric-page/RubricEditorClient';
import { createClient } from '@/app/utils/supabase/server';
import type { Rubric, RubricRow, RubricTemplate } from '@/lib/types';

export const metadata = {
  title: 'Edit Rubric | Rubriq',
  description: '',
};

interface Params {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Params) {
  const { id } = await params;
  const supabase = await createClient();

  // Auth
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) redirect('/signin');

  // ---- Load rubric ----
  const { data: r, error: rErr } = await supabase
    .from('rubrics')
    .select(
      `
      id,
      name,
      subject_code,
      version,
      row_count,
      status,
      template_id,
      template_version,
      updated_at,
      shared
    `,
    )
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();

  if (rErr) notFound();
  if (!r) notFound();

  // Optional: enforce ownership in UI (RLS should already protect this)
  // if (r.owner_id !== user.id && !r.shared) notFound();

  // ---- Load rubric rows ----
  const { data: rrows, error: rrErr } = await supabase
    .from('rubric_rows')
    .select(
      `
      id,
      rubric_id,
      position,
      template_row_id,
      task,
      ai_use_level,
      instructions,
      examples,
      acknowledgement
    `,
    )
    .eq('rubric_id', r.id)
    .order('position', { ascending: true });

  if (rrErr) notFound();

  const rows: RubricRow[] = (rrows ?? []).map((rw: any) => ({
    id: rw.id,
    position: rw.position ?? 0,
    templateRowId: rw.template_row_id,
    task: rw.task ?? '',
    aiUseLevel: rw.ai_use_level ?? '',
    instructions: rw.instructions ?? '',
    examples: rw.examples ?? '',
    acknowledgement: rw.acknowledgement ?? '',
  }));

  // Build initialRubric for client
  let initialRubric: Rubric = {
    id: r.id,
    name: r.name,
    subjectCode: r.subject_code,
    version: r.version,
    rowCount: r.row_count ?? rows.length,
    status: r.status, // 'active' | 'update-available'
    templateId: r.template_id,
    templateVersion: r.template_version,
    updatedAt: r.updated_at,
    shared: r.shared ?? false,
    ownerId: user.id,
    rows,
  };

  // ---- If linked to a template, load it (with rows) ----
  let linkedTemplate: RubricTemplate | null = null;
  if (r.template_id) {
    const { data: t, error: tErr } = await supabase
      .from('templates_with_counts')
      .select(
        `
        id,
        name,
        subject_code,
        version,
        row_count,
        description,
        updated_at,
        created_by
      `,
      )
      .eq('id', r.template_id)
      .maybeSingle();

    if (!tErr && t) {
      const { data: trows, error: trErr } = await supabase
        .from('template_rows')
        .select(
          `
          id,
          template_id,
          position,
          task,
          ai_use_level,
          instructions,
          examples,
          acknowledgement
        `,
        )
        .eq('template_id', t.id)
        .order('position', { ascending: true });

      const templateRows =
        (trows ?? []).map((tw: any) => ({
          id: tw.id,
          position: tw.position ?? 0,
          task: tw.task ?? '',
          aiUseLevel: tw.ai_use_level ?? '',
          instructions: tw.instructions ?? '',
          examples: tw.examples ?? '',
          acknowledgement: tw.acknowledgement ?? '',
        })) ?? [];

      linkedTemplate = {
        id: t.id,
        name: t.name,
        subjectCode: t.subject_code,
        version: t.version,
        rowCount: t.row_count ?? templateRows.length,
        description: t.description ?? '',
        updatedAt: t.updated_at,
        createdBy: t.created_by,
        rows: templateRows,
      };

      // Optional: recompute status if template is newer
      // if (
      //   (initialRubric.templateVersion ?? 0) < (linkedTemplate.version ?? 0)
      // ) {
      //   initialRubric = { ...initialRubric, status: 'update-available' };
      // }
    }
  }

  return (
    <RubricEditorClient
      initialRubric={initialRubric}
      linkedTemplate={linkedTemplate}
    />
  );
}
