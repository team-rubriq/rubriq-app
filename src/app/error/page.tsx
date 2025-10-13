'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ErrorPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-muted/30 to-background">
      <Card className="max-w-md w-full shadow-lg border border-border">
        <CardHeader className="flex flex-col items-center text-center space-y-3">
          <div className="bg-destructive/10 p-3 rounded-full">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="text-muted-foreground text-sm">
            An unexpected error occurred. Please try again or return to your
            dashboard.
          </p>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 mt-2">
          <Button
            onClick={() => router.push('/')}
            variant="default"
            className="w-full"
          >
            Go back home
          </Button>
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="w-full"
          >
            Go back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
