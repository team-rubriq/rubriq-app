'use client';

import { FormEvent, useState } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import { useRouter } from 'next/navigation';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SignUpPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Track which button was clicked
  const [selectedRole, setSelectedRole] = useState<'admin' | 'user' | null>(
    null,
  );

  // Modified handler that accepts a role parameter
  const handleSignUp = async (role: 'admin' | 'user') => {
    // Store which button was clicked for loading state
    setSelectedRole(role);

    // Reset states
    setError('');
    setSuccess(false);

    // Validation - Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setSelectedRole(null);
      return;
    }

    // Password strength validation
    if (password.length < 6) {
      setError('Password should be at least 6 characters long');
      setSelectedRole(null);
      return;
    }

    setLoading(true);

    try {
      // STEP 1: Sign up the user with role in metadata
      // This metadata is accessible in our trigger function
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            role: role, // This passes the role to our database trigger
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.user) {
        // Check if email confirmation is needed
        if (data.user.identities?.length === 0) {
          setSuccess(true);
          setError('');

          // Show success message with role info
          console.log(
            `User registered as ${role}. Profile will be created via trigger.`,
          );

          // Clear form
          setEmail('');
          setName('');
          setPassword('');
          setConfirmPassword('');
        } else {
          // User doesn't need email confirmation
          // The trigger has already created their profile
          // When they sign in, the JWT will contain their role
          router.push('/signin#signup=success');
        }
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
      setSelectedRole(null);
    }
  };

  // Form submission handler for Enter key
  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Default to 'user' role if form is submitted via Enter key
    handleSignUp('user');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold tracking-tighter">Sign Up</h1>
            <p className="text-muted-foreground">
              Please sign up to save and view templates!
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>
                Registration successful as{' '}
                <strong>{selectedRole || 'user'}</strong>Please check your email
                to confirm your account.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              {/* htmlFor="email" links this label to id=email */}
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Please enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Please enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Re-enter Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Please re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Role Selection Buttons */}
            <div className="flex gap-4">
              <Button
                type="button" // Important: Not submit!
                variant="outline"
                className="flex-1"
                onClick={() => handleSignUp('admin')}
                disabled={loading}
              >
                {loading && selectedRole === 'admin'
                  ? 'Creating admin account...'
                  : 'Register as Admin'}
              </Button>

              <Button
                type="button" // Important: Not submit!
                className="flex-1"
                onClick={() => handleSignUp('user')}
                disabled={loading}
              >
                {loading && selectedRole === 'user'
                  ? 'Creating user account...'
                  : 'Register as User'}
              </Button>
            </div>
          </div>

          {/* Sign in link */}
          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              Already have an account?{' '}
            </span>
            <button
              onClick={() => router.push('/signin')}
              className="text-primary hover:underline font-medium"
              disabled={loading}
            >
              Sign in
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
