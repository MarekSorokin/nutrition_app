'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useUserStore } from "@/lib/store/user-store"

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const setUser = useUserStore((state) => state.setUser)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    
    try {
      const result = await signIn('credentials', {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        redirect: false,
      })

      if (result?.error) {
        toast.error(result.error)
        return
      }

      // Fetch the session after successful login
      const response = await fetch('/api/auth/session')
      const session = await response.json()
      
      if (session?.user) {
        setUser(session.user)
        router.refresh()
        router.push('/')
        toast.success('Logged in successfully')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Something went wrong', { description: errorMessage });
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          name="email"
          type="email"
          placeholder="Email"
          required
          disabled={isLoading}
        />
        <Input
          name="password"
          type="password"
          placeholder="Password"
          required
          disabled={isLoading}
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="size-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
        ) : (
          'Sign In'
        )}
      </Button>
      <div className="text-center text-sm">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-primary hover:underline">
          Sign up
        </Link>
      </div>
    </form>
  )
} 