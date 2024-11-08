'use client';

import { signIn, signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { LogIn, LogOut } from 'lucide-react';
import { useUserStore } from '@/lib/store/user-store';

export function Navbar() {
  const { user, isLoading } = useUserStore();

  return (
    <nav className="flex items-center justify-between p-4 bg-gray-800 text-white">
      <div className="text-lg font-bold">MyApp</div>
      <div>
        {isLoading ? (
          <Button variant="ghost" disabled>
            <div className="size-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
          </Button>
        ) : user ? (
          <>
            <span className="text-sm text-muted-foreground">
              ID: {user.id}, Email: {user.email}
            </span>
            <Button onClick={() => signOut()} variant="destructive" className="gap-2">
              <LogOut className="size-4" />
              Logout
            </Button>
          </>
        ) : (
          <Button onClick={() => signIn('credentials')} variant="default" className="gap-2">
            <LogIn className="size-4" />
            Login
          </Button>
        )}
      </div>
    </nav>
  );
}
