'use server';

import { createClient } from '@/app/utils/supabase/server';

export async function signUpWithEmail(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as 'admin' | 'user';

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      data: { role },
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, role };
}
