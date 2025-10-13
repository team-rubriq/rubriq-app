'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  TableProperties,
  PackageOpen,
  User,
  ChevronUp,
  LogOut,
  Settings,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { createClient } from '@/app/utils/supabase/client';
import { useRouter } from 'next/navigation';

const links = [
  { href: '/my-rubrics', label: 'My Rubrics', icon: TableProperties },
  { href: '/templates', label: 'Templates', icon: PackageOpen },
];

interface SidebarNavProps {
  fullName: string;
  avatar?: string;
}

export default function SidebarNav({
  fullName,
  avatar = '/avatar.svg',
}: SidebarNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  return (
    <aside className="w-56 h-screen fixed flex flex-col justify-between bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Header */}
      <div>
        <div className="flex items-center p-5 border-b border-sidebar-border">
          <span className="text-lg font-bold tracking-tight">
            Customisable <br /> AI Use Scales
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 p-4 text-sm">
          {links.map(({ href, label, icon: Icon }) => (
            <Button
              key={href}
              asChild
              variant={pathname === href ? 'secondary' : 'ghost'}
              className={cn(
                'flex items-center gap-3 justify-start px-3 py-2 rounded',
                pathname === href && 'font-bold shadow',
              )}
            >
              <Link href={href}>
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            </Button>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="px-2 pb-5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full flex items-center gap-3 justify-start p-3"
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={avatar} alt={fullName} />
                <AvatarFallback>{fullName?.[0] ?? '?'}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-bold">{fullName}</span>
              <ChevronUp size={16} className="ml-auto" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="end" className="w-full">
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center gap-2">
                <User size={16} /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive flex items-center gap-2"
              onClick={() => {
                supabase.auth.signOut();
                router.push('/signin');
              }}
            >
              <LogOut size={16} /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
