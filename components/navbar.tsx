'use client';

import { memo } from 'react';
import { signIn, signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { LogIn, User } from 'lucide-react';
import { useUserStore } from '@/lib/store/user-store';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function NavbarComponent() {
  const { user, isLoading } = useUserStore();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <div className="flex items-center flex-1">
          <Link href="/" className="flex items-center gap-2 font-bold">
            Food Tracker
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {isLoading ? (
            <Button variant="ghost" size="sm" disabled>
              <div className="size-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
            </Button>
          ) : user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden md:inline-block">
                {user.email}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <User className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/foods">Moje potraviny</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={() => signOut()}>
                    Odhlásit se
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button
              onClick={() => signIn('credentials')}
              variant="default"
              size="sm"
              className="gap-1"
            >
              <LogIn className="size-4" />
              <span className="hidden sm:inline-block">Přihlásit</span>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}

export const Navbar = memo(NavbarComponent);
