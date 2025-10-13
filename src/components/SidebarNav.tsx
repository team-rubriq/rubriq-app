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
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useRole } from '@/hooks/useRole';

const links = [
  { href: '/my-rubrics', label: 'My Rubrics', icon: TableProperties },
  { href: '/templates', label: 'Templates', icon: PackageOpen },
];

export default function SidebarNav() {
  const pathname = usePathname();

  const { id, email, role, loading: roleLoading, isAdmin, isUser, error: roleError, avatar } = useRole();
  if (roleLoading) return <div>Loading...</div>;
  if (roleError) return <div>Error: {roleError}</div>;

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
        <Button
          asChild
          variant="ghost"
          className="w-full flex items-center gap-3 justify-start p-3"
        >
          <Link href="/profile">
            <Avatar className="w-8 h-8">
              <AvatarImage src={avatar || ''} alt={email || 'User'} />
              <AvatarFallback>{email}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-bold">{"Profile"}</span>
            <Settings size={16} />
          </Link>
        </Button>
      </div>
    </aside>
  );
}
