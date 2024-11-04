'use server'

import { z } from "zod"
import { hash } from "bcryptjs"
import prisma from "@/lib/prisma"
import { signIn } from "@/lib/auth"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function register(data: z.infer<typeof registerSchema>) {
  try {
    const { email, password } = registerSchema.parse(data)

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { error: "User already exists" }
    }

    const hashedPassword = await hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    return { success: true, user }
  } catch (error) {
    console.error("Registration error:", error)
    if (error instanceof z.ZodError) {
      return { error: "Invalid input data" }
    }
    return { error: "Failed to register" }
  }
}

export async function login(data: z.infer<typeof loginSchema>) {
  try {
    const result = await signIn("credentials", {
      redirect: false,
      ...data,
    })

    if (result?.error) {
      return { error: "Invalid credentials" }
    }

    return { success: true }
  } catch (error) {
    return { error: "Login failed" }
  }
} 