import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-background text-foreground px-4">
      <h1 className="text-3xl font-bold mb-2">404 – Page Not Found</h1>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        Sorry, the page you’re looking for doesn’t exist or has been moved.
      </p>
      <Button asChild>
        <Link href="/">Go back home</Link>
      </Button>
    </div>
  );
}