import SidebarNav from '@/components/SidebarNav';
import { createClient } from '../utils/supabase/server';

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profileName = '';
  let avatar = '/avatar.svg';
  let role = ''

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, avatar, role')
      .eq('id', user.id)
      .maybeSingle();
    profileName = [profile?.first_name, profile?.last_name]
      .filter(Boolean)
      .join(' ')
      .trim();
    avatar = profile?.avatar;
    role = profile?.role;
  }

  return (
    <div>
      <SidebarNav fullName={profileName} avatar={avatar} role={role}/>
      <main className="ml-56 min-h-screen">{children}</main>
    </div>
  );
}
