// Profile & Settings
'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/app/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useRole } from '@/hooks/useRole';

const defaultAvatars = [
  '/avatars/avatar1.svg',
  '/avatars/avatar2.svg',
  '/avatars/avatar3.svg',
  '/avatars/avatar4.svg',
  '/avatars/avatar5.svg',
  '/avatars/avatar6.svg',
  '/avatars/avatar7.svg',
  '/avatars/avatar8.svg',
  '/avatars/avatar.svg',
];

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const {data: { user },
  } = await supabase.auth.getUser();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Use the useRole hook
  const {data, error} = await supabase
  const {
    id,
    email,
    role,
    loading: roleLoading,
    isAdmin,
    isUser,
    error: roleError,
    avatar,
  } = useRole();

  const [userAvatar, setUserAvatar] = useState(avatar || '');
  const [selectedAvatar, setSelectedAvatar] = useState(avatar || '');

  if (roleLoading) return <div>Loading...</div>;
  if (roleError) return <div>Error: {roleError}</div>;
  if (id === null) return <div>Error: User not found.</div>;

  // Change Password
  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    alert('Password updated!');
    await supabase.auth.updateUser({ password: newPassword });
    await supabase.auth.signOut();
    router.push('/signin#changed_password=true');
  };
  
  
  // Change Avatar
  const handleAvatarSelect = async (url: string) => {
    setSelectedAvatar(url);

    const { error } = await supabase
    .from('profiles')
    .update({ avatar: url })
    .eq('id', id);
    if (error) {
      console.error('Error updating avatar', error);
      alert('Could not update avatar.');
    } else {
    alert('Avatar updated successfully!');
    setUserAvatar(url);
    }
  };

  // Delete Account
  const handleDeleteAccount = async () => {
    const confirmDelete = confirm(
      'Are you sure? This will permanently delete your account.'
    );
    if (!confirmDelete) return;
    const { data, error } = await supabase.auth.admin.deleteUser(id);
    if (error) {
      alert(`Failed to delete account: ${error.message}`);
    } else {
      console.log('User deleted:', data);
      router.push('/signin');
    }
  }


  // Sign Out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
  };


  return (
    <div className="flex min-h-screen">
      <main className="flex-1 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-6 gap-x-12">
      {/* Avatar Selection */}
      <div className="flex-shrink-0 flex flex-col items-center">
            <div className="flex flex-col items-center space-y-2">
              <Avatar className="w-24 h-24 border-2 border-black">
                <AvatarImage src={selectedAvatar || avatar || defaultAvatars[0]} alt="Profile" />
                <AvatarFallback>◎</AvatarFallback>
              </Avatar>

              <div className="grid grid-cols-4 gap-2 mt-2">
                {defaultAvatars.map((avatar) => (
                  <Avatar
                    key={avatar}
                    className={`w-12 h-12 cursor-pointer border-2 ${
                      selectedAvatar === avatar ? 'border-blue-500' : 'border-transparent'
                        }`}
                    onClick={() => setSelectedAvatar(avatar)}
                    >
                  <AvatarImage src={avatar} alt="Avatar" />
                  <AvatarFallback>◎</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <Button variant="default" onClick={() => handleAvatarSelect(selectedAvatar)} className="w-1/2">
                Submit
              </Button>
            </div>
          </div>

      {/* Main Content */}
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
            {/* Header */}
            <div className="text-center space-y-3">
              <h1 className="text-3xl font-bold tracking-tighter">
                Profile and Settings
              </h1>
              <div className="flex flex-col items-center space-y-2">
              <Avatar className="w-24 h-24 border-2 border-black">
                <AvatarImage src={userAvatar || avatar || ''} alt="Profile" />
                <AvatarFallback>◎</AvatarFallback>
              </Avatar>
              <p className="text-muted-foreground">
                Update your account details below
              </p>
            </div>

          
            {/* Password form */}
            <form className="space-y-4" onSubmit={handlePassword}>
              <Input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <Button type="submit" className="w-full">
                Confirm
              </Button>
            </form>

            {/* Sign out */}
            <Button variant="secondary" className="w-full" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Account */}
      <div className="flex-shrink-0 flex flex-col items-center text-center">
      <p className="font-semibold text-red-600">Delete Account</p>
        <p className="text-sm text-black mb-2 whitespace-pre-line">
          {`Warning: This will terminate your access to this software and delete all your
          assignment rubrics. To gain access again you will need to contact an administrator`}
          </p>
        <Button variant="destructive" onClick={handleDeleteAccount}>
          Delete My Account
        </Button>
      </div>
              </main>
    </div>
  );
}
