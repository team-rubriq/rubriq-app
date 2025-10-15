'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Profile } from '@/lib/types';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg p-6 shadow-lg relative">
        <button className="absolute top-2 right-2 text-xl" onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}

const defaultAvatars = [
  '/avatars/avatar1.svg',
  '/avatars/avatar2.svg',
  '/avatars/avatar3.svg',
  '/avatars/avatar4.svg',
  '/avatars/avatar5.svg',
  '/avatars/avatar6.svg',
  '/avatars/avatar7.svg',
  '/avatars/avatar8.svg',
];

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();

  // auth + profile
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  // profile fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatar, setAvatar] = useState<string>('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [role, setRole] = useState<string>('');

  // password fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // loading flags
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Modal state
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  // Load current user + profile
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error) throw error;
        if (!user) {
          toast.error('Not signed in');
          router.push('/signin');
          return;
        }

        if (!alive) return;

        setUserId(user.id);
        setEmail(user.email ?? null);

        const { data: profile, error: pErr } = await supabase
          .from('profiles')
          .select('id, email, first_name, last_name, avatar, role, created_at')
          .eq('id', user.id)
          .maybeSingle();

        if (pErr) throw pErr;

        setFirstName(profile?.first_name ?? '');
        setLastName(profile?.last_name ?? '');
        setAvatar(profile?.avatar ?? defaultAvatars[0]);
        setSelectedAvatar(profile?.avatar ?? defaultAvatars[0]);
        setRole(profile?.role ?? '');
      } catch (e: any) {
        toast.error('Failed to load profile', { description: e.message });
        router.push('/signin');
      } finally {
        if (alive) setLoadingProfile(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [router, supabase]);

  // Save avatar (and names)
  const handleAvatarSelect = async (path: string) => {
    if (!userId) return;
    try {
      setSavingProfile(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          avatar: path,
          first_name: firstName.trim() || null,
          last_name: lastName.trim() || null,
        })
        .eq('id', userId);
      if (error) throw error;

      setAvatar(path);
      setSelectedAvatar(path);
      toast.success('Profile updated');
    } catch (e: any) {
      toast.error('Failed to update profile', { description: e.message });
    } finally {
      setSavingProfile(false);
    }
  };

  // Save name fields without changing avatar
  const handleSaveNames = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    try {
      setSavingProfile(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName.trim() || null,
          last_name: lastName.trim() || null,
        })
        .eq('id', userId);
      if (error) throw error;
      toast.success('Name updated');
    } catch (e: any) {
      toast.error('Failed to update name', { description: e.message });
    } finally {
      setSavingProfile(false);
    }
  };

  // Password update
  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      setSavingPassword(true);
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password updated');
    } catch (e: any) {
      toast.error('Failed to update password', { description: e.message });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/signin');
    } catch (e: any) {
      toast.error('Failed to sign out', { description: e.message });
    }
  };

  // Account deletion: calls a secure server route (see below)
  const handleDeleteAccount = async () => {
    if (
      !confirm(
        'This will permanently delete your account and rubrics. Continue?',
      )
    )
      return;
    try {
      const res = await fetch('/api/account/delete', { method: 'POST' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body.error?.message || `${res.status} ${res.statusText}`,
        );
      }
      toast.success('Account deleted');
      router.push('/goodbye'); // or /login
    } catch (e: any) {
      toast.error('Failed to delete account', { description: e.message });
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground"></div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Header */}
      <div className="absolute top-0 left-0 w-full z-10 bg-background px-10 py-3">
        <h1 className="text-[44px] font-semibold tracking-tight">My Profile</h1>
        <p className="text-m text-muted-foreground">Manage your account.</p>
      </div>

      {/* Body */}
      <div className="flex justify-center gap-40">
        {/* Avatar */}
        <div className="flex flex-col pt-33 px-10 gap-2 items-center space-y-2 mt-10">
          <Avatar
            className="w-50 h-50 cursor-pointer"
            onClick={() => setAvatarModalOpen(true)}
          >
            <AvatarImage src={avatar || ''} alt="Profile" />
            <AvatarFallback>◎</AvatarFallback>
          </Avatar>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAvatarModalOpen(true)}
            className="mb-10"
          >
            Change Avatar
          </Button>
          <p className="text-muted-foreground">
            {email
              ? `Signed in as ${email}`
              : 'Update your account details below'}
          </p>
          <Badge variant="outline">
            {role === 'admin' ? 'ADMIN' : 'SUBJECT COORDINATOR'}
          </Badge>
        </div>

        {/* Modal */}
        <Modal open={avatarModalOpen} onClose={() => setAvatarModalOpen(false)}>
          <div className="grid grid-cols-4 gap-3">
            {defaultAvatars.map((a) => (
              <Avatar
                key={a}
                className={`w-16 h-16 cursor-pointer border-2 ${
                  selectedAvatar === a
                    ? 'border-blue-500'
                    : 'border-transparent'
                }`}
                onClick={() => setSelectedAvatar(a)}
              >
                <AvatarImage src={a} alt="Avatar" />
                <AvatarFallback>◎</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <Button
            variant="default"
            onClick={() =>
              handleAvatarSelect(selectedAvatar || defaultAvatars[0])
            }
            className="w-full mt-4"
            disabled={savingProfile}
          >
            {savingProfile ? 'Saving…' : 'Select Avatar'}
          </Button>
        </Modal>

        {/* Bordered box */}
        <div className="w-130 rounded-2xl shadow-xl border p-8 mt-33">
          {/* Name form */}
          <h1 className="text-lg font-semibold tracking-tight mb-2">Name</h1>
          <form className="space-y-3 mb-10" onSubmit={handleSaveNames}>
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <Input
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <Button
              variant="default"
              type="submit"
              className="w-full"
              disabled={savingProfile}
            >
              {savingProfile ? 'Saving…' : 'Save profile'}
            </Button>
          </form>
          {/* Password form */}
          <h1 className="text-lg font-semibold tracking-tight mb-2">
            Change password
          </h1>
          <form className="space-y-3 mb-10" onSubmit={handlePassword}>
            <Input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button
              variant="default"
              type="submit"
              className="w-full"
              disabled={savingPassword}
            >
              {savingPassword ? 'Updating…' : 'Update password'}
            </Button>
          </form>
          {/* Sign out and Delete Account */}
          <h1 className="text-lg font-semibold tracking-tight mb-2">Account</h1>
          <div className="flex flex-col gap-3">
            <Button
              variant="default"
              className="w-full"
              onClick={handleSignOut}
            >
              Logout
            </Button>
            <p className="text-sm text-black whitespace-pre-line">
              {`Warning: This will terminate your access and delete your rubrics and profile.`}
            </p>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              className="w-full"
            >
              Delete My Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
