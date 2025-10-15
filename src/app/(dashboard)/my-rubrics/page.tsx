import RubricsHomeClient from '@/components/my-rubrics-page/RubricsHomeClient';
import { createClient } from '@/app/utils/supabase/server';
import { redirect } from 'next/navigation';
import type { Rubric } from '@/lib/types';

export const metadata = {
  title: 'My Rubrics | Rubriq',
  description: '',
};

export default async function Page() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    redirect('/signin');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name')
    .eq('id', user.id)
    .maybeSingle();

  const { data, error } = await supabase
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
    .eq('owner_id', user.id)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false });

  if (error) {
    redirect('/error');
  }

  const initialData: Rubric[] = (data ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    subjectCode: r.subject_code,
    version: r.version,
    rowCount: r.row_count,
    status: r.status, // 'active' | 'update-available'
    templateId: r.template_id,
    templateVersion: r.template_version,
    updatedAt: r.updated_at,
    shared: r.shared ?? false,
    ownerId: user.id, // convenient for filters in UI
    // rows are not loaded on the home page (keep list light)
  }));

  return (
    <RubricsHomeClient
      initialData={initialData}
      profileName={profile?.first_name ?? ''}
    />
  );
}
