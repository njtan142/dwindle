import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import prisma from './db'
import CredentialsProvider from 'next-auth/providers/credentials'
import { Session as CustomSession, User as CustomUser, AuthJWT } from '@/types/auth'
import {
  AuthError,
  InvalidCredentialsError,
  UserNotFoundError,
  DatabaseError,
  handleAuthError
} from './auth-errors'

declare module 'next-auth' {
  interface Session extends CustomSession {}
  interface User extends CustomUser {}
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    avatar?: string
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        name: { label: 'Name', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.name) {
          return null
        }

        try {
          // Validate credentials
          if (!credentials.email || !credentials.name) {
            throw new InvalidCredentialsError()
          }

          // Check if user exists, if not create one
          let user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user) {
            user = await prisma.user.create({
              data: {
                email: credentials.email,
                name: credentials.name,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(credentials.name)}&background=3B82F6&color=fff`,
              }
            })
          }

          // Fix the return type to match NextAuth User type
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.avatar || undefined, // Convert null to undefined
          } as CustomUser
        } catch (error) {
          // Handle and log the error
          const errorResponse = handleAuthError(error)
          console.error(`Auth error [${errorResponse.code}]: ${errorResponse.message}`)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user, account, profile, isNewUser }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.avatar = user.avatar
        token.createdAt = Date.now()
      }
      
      // Refresh token if needed
      if (token.createdAt) {
        const now = Date.now()
        const tokenAge = now - token.createdAt
        
        // Refresh token if it's older than 24 hours
        if (tokenAge > 24 * 60 * 1000) {
          // You can add logic here to refresh the token from the database
          // For now, we'll just update the createdAt timestamp
          token.createdAt = now
        }
      }
      
      return token
    },
    async session({ session, token }) {
      // Validate token age
      if (token.createdAt) {
        const now = Date.now()
        const tokenAge = now - token.createdAt
        
        // Expire session if token is older than 30 days
        if (tokenAge > 30 * 24 * 60 * 60 * 1000) {
          // Return an empty session to force re-authentication
          return { expires: new Date().toISOString() }
        }
      }
      
      if (token && session.user) {
        // Cast session.user to our custom type
        const customUser = session.user as CustomSession['user'];
        customUser.id = token.id as string;
        customUser.avatar = token.avatar as string;
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  debug: process.env.NODE_ENV === 'development'
}