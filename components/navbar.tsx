'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { Button } from './ui/button';
import { LogIn, LogOut } from 'lucide-react';
import { useUserStore } from '@/lib/store/user-store';
import { useEffect } from 'react';

export function Navbar() {
  const { data: session, status } = useSession()
  const { user, isLoading, setUser, setLoading } = useUserStore()

  useEffect(() => {
    setLoading(status === 'loading')
    setUser(session?.user ?? null)
  }, [session, status, setUser, setLoading])

  return (
    <nav className="flex items-center justify-between p-4 bg-gray-800 text-white">
      <div className="text-lg font-bold">
        MyApp
      </div>
      <div>
        {isLoading ? (
          <Button variant="ghost" disabled>
            <div className="size-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
          </Button>
        ) : user ? (
          <Button
            onClick={async () => {
              await signOut()
              setUser(null)
            }}
            variant="destructive"
            className="gap-2"
          >
            <LogOut className="size-4" />
            Logout
          </Button>
        ) : (
          <Button
            onClick={() => signIn('credentials')}
            variant="default"
            className="gap-2"
          >
            <LogIn className="size-4" />
            Login
          </Button>
        )}
      </div>
    </nav>
  );
}