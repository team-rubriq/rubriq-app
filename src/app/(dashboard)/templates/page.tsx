
import { createClient } from '@/app/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getIsAdmin } from '@/app/api/_lib/is-admin';
import TemplatesHomeClient from '@/components/templates-page/TemplatesHomeClient';
import type { RubricTemplate } from '@/lib/types';

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { isAdmin } = await getIsAdmin();

  // If you created the "templates_with_counts" view, use it here:
  const { data, error } = await supabase
    .from('templates_with_counts')
    .select(
      'id, name, subject_code, version, row_count, description, updated_at, created_by',
    )
    .order('updated_at', { ascending: false });

  if (error) redirect('/error');

  // map to front-end shape (our mapTemplate() does this in API routes, but here we inline)
  const initialTemplates: RubricTemplate[] = (data ?? []).map((t: any) => ({
    id: t.id,
    name: t.name,
    subjectCode: t.subject_code,
    version: t.version,
    rowCount: t.row_count ?? 0,
    description: t.description ?? '',
    updatedAt: t.updated_at,
    createdBy: t.created_by,
    rows: undefined, // list page doesn’t need rows
  }));

  return (
    <TemplatesHomeClient
      initialTemplates={initialTemplates}
      isAdmin={isAdmin}
    />
  );
}

