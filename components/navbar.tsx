'use client';

import { memo } from 'react';
import { signIn, signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { Link, LogIn, LogOut } from 'lucide-react';
import { useUserStore } from '@/lib/store/user-store';

function NavbarComponent() {
  const { user, isLoading } = useUserStore();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <span className="hidden font-bold sm:inline-block">
            <Link href="/">Food Tracker</Link>
          </span>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {isLoading ? (
            <Button variant="ghost" disabled>
              <div className="size-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
            </Button>
          ) : user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:inline-block">
                {user.email}
              </span>
              <Button onClick={() => signOut()} variant="destructive" size="sm" className="gap-2">
                <LogOut className="size-4" />
                <span className="hidden sm:inline-block">Logout</span>
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => signIn('credentials')}
              variant="default"
              size="sm"
              className="gap-2"
            >
              <LogIn className="size-4" />
              <span className="hidden sm:inline-block">Login</span>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}

export const Navbar = memo(NavbarComponent);
