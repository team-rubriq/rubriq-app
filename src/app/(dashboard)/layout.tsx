// uses <SidebarNav/> (Home, CUS Library, USL Library, Profile)
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

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, avatar')
      .eq('id', user.id)
      .maybeSingle();
    profileName = [profile?.first_name, profile?.last_name]
      .filter(Boolean)
      .join(' ')
      .trim();
    avatar = profile?.avatar;
  }

  return (
    <div>
      <SidebarNav fullName={profileName} avatar={avatar} />
      <main className="ml-56 min-h-screen">{children}</main>
    </div>
  );
}
