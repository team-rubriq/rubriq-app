// hooks/useRole.ts
import { useEffect, useState } from 'react';
import { createClient } from '@/app/utils/supabase/client';

export type UserRole = 'admin' | 'user';

interface UseRoleReturn {
  id: string | null;
  email: string | null;
  role: UserRole | null;
  loading: boolean;
  isAdmin: boolean;
  isUser: boolean;
  error: string | null;
  avatar: string | null;
  refetch: () => Promise<void>;
}

const supabase = createClient();

export function useRole(): UseRoleReturn {
  const [id, setId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);

  // Function to fetch role from database
  const fetchRole = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setId(null);
        setRole(null);
        setAvatar(null);
        return;
      } else {
        setId(user.id);
        if (user.email){setEmail(user.email);} else{setEmail(null);}
      }

      // Fetch role from profiles table
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('role, avatar')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        setError(fetchError.message);
        setRole(null);
        setAvatar(null);
      } else if (data) {
        setRole(data.role as UserRole);
        setAvatar(data.avatar || null);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Failed to fetch user role');
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchRole();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        await fetchRole();
      } else if (event === 'SIGNED_OUT') {
        setRole(null);
        setLoading(false);
      }
    });

    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    id,
    email,
    role,
    loading,
    isAdmin: role === 'admin',
    isUser: role === 'user',
    error,
    avatar,
    refetch: fetchRole, // Allow manual refetch if needed
  };
}
