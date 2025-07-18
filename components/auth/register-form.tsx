'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function RegisterForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);

    try {
      const formData = new FormData(event.currentTarget);
      const result = await register({
        email: formData.get('email') as string,
        password: formData.get('password') as string,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Account created successfully!');
      router.push('/login');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Something went wrong. Please try again.', { description: errorMessage });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input name="name" placeholder="Full name" required disabled={isPending} />
        <Input
          name="email"
          type="email"
          placeholder="name@example.com"
          required
          disabled={isPending}
        />
        <Input
          name="password"
          type="password"
          placeholder="Password"
          required
          disabled={isPending}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <div className="size-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
        ) : (
          'Create Account'
        )}
      </Button>
      <div className="text-center text-sm">
        <Link href="/login" className="text-primary hover:underline">
          Already have an account? Sign in
        </Link>
      </div>
    </form>
  );
}
