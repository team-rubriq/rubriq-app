'use client';

import { FormEvent, useState, useEffect } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Eye, EyeOff, Mail, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import icon from '@/../public/icon.svg';

export default function LoginPage() {
  // Code here
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [callbackError, setCallbackError] = useState('');
  const [callbackErrorDescription, setCallbackErrorDescription] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);

  useEffect(() => {
    document.title = `Sign In | Rubriq`;
  });

  // Redirected from signup page/errors
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.hash.substring(1));
      setSignupSuccess(params.get('signup') === 'success');
      setCallbackError(params.get('error') || '');
      setCallbackErrorDescription(params.get('error_description') || '');
    }
  }, []);

  // Automatically redirect to home
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        router.replace('/');
      }
    });
  }, [router]);

  // Sign-in handler
  const handleSignIn = async (e: FormEvent) => {
    const supabase = createClient();
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      // Sign in with Supabase
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      if (data.user) {
        // Successful sign in!
        console.log('Sign in successful:', data.user.email);

        router.push('/my-rubrics');
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // This div basically centers everything with a light grey background
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      {/* Panel fades and drops in */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Make the card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* The Header */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <Image src={icon} alt="Logo" width={30} height={30} />
              <h1 className="text-3xl font-bold tracking-tighter">Rubriq.</h1>
            </div>
            <p className="text-muted-foreground">
              Welcome back! Please sign in to view your templates.
            </p>
          </div>
          {signupSuccess && (
            <Alert>
              <AlertDescription className="text-black">
                Sign Up Successful! Please Confirm Email!
              </AlertDescription>
            </Alert>
          )}
          {callbackError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {callbackError}
                {callbackErrorDescription && (
                  <>
                    <br />
                    <span className="text-sm text-muted-foreground">
                      {callbackErrorDescription}
                    </span>
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              {/* htmlFor="email" links this label to id=email */}
              <Label htmlFor="email">Email</Label>
              {/* id, links it to hmtlFor, and type tells the browser this field is an email */}
              <Input
                id="email"
                type="email"
                placeholder="Please enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              ></Input>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              {/* relative is means to reference this div later when we change the positioning of objects */}
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Please enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                ></Input>
                {/* Creating the eye icon */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Or</span>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push('/signup')}
          >
            <Mail className="mr-2 h-4 2-4"></Mail>
            Create New Account
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
