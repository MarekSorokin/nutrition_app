import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { compare } from "bcryptjs"
import prisma from "@/lib/prisma"

// Validation schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  pages: {
    signIn: "/login",
  },
  events: {
    async signIn({ user }) {
      console.log("User signed in:", user.email)
    },
    async signOut() {
      console.log("User signed out")
    },
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
      }
      // Handle user updates
      if (trigger === "update" && session) {
        token = { ...token, ...session }
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  providers: [
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { email, password } = loginSchema.parse(credentials)

          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              password: true,
              name: true,
            },
          })

          if (!user) {
            console.log("User not found")
            return null
          }

          const isValidPassword = await compare(password, user.password)
          if (!isValidPassword) {
            console.log("Invalid password")
            return null
          }

          console.log("User authorized:", user.email)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
})