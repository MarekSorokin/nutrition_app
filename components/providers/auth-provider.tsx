'use client';

import { useSession } from 'next-auth/react';
import { useUserStore } from '@/lib/store/user-store';
import { useEffect } from 'react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { setUser, setLoading } = useUserStore();

  useEffect(() => {
    setLoading(status === 'loading');
    setUser(session?.user ?? null);
  }, [session, status, setUser, setLoading]);

  return <>{children}</>;
}
