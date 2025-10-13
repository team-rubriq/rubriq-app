import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function POST() {
  // 1) get current user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json(
      { error: { message: 'Unauthorized' } },
      { status: 401 },
    );

  // 2) admin client with service role key (server only!)
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // NEVER expose this to the browser
  );

  // optional: clean up app data first (FKs with ON DELETE CASCADE can handle child tables)
  // e.g. delete rubrics owned by the user (if no cascade):
  // await admin.from('rubrics').delete().eq('owner_id', user.id);

  // 3) delete auth user (bypasses RLS)
  const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
  if (delErr) {
    return NextResponse.json(
      { error: { message: delErr.message } },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
