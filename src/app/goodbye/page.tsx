'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { LogIn } from 'lucide-react';

export default function GoodbyePage() {
  useEffect(() => {
    const t = setTimeout(() => {
      window.location.href = '/signin';
    }, 5000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center px-6 py-10">
      <Card className="w-full max-w-lg shadow-xl border-2 rounded-2xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl tracking-tight">
            Goodbye for now.
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Your account session has ended. You can come back any time!
          </p>
        </CardHeader>

        <Separator />

        <CardContent className="py-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              We’ll redirect you to the login page shortly…
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Link href="/login" className="w-full">
            <Button className="w-full">
              <LogIn className="h-4 w-4 mr-2" />
              Go to Login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
