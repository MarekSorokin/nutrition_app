import { RegisterForm } from '@/components/auth/register-form';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function RegisterPage() {
  const session = await auth();

  if (session) {
    redirect('/');
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-4">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">
            Enter your information to create an account
          </p>
        </div>
        <RegisterForm />
      </div>
    </main>
  );
}
