import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT } from 'next-auth/jwt'

// Extended Session interface for authentication
export interface Session extends DefaultSession {
  user: {
    id: string
    email: string
    name: string
    avatar?: string
  } & DefaultSession['user']
}

// Extended User interface for authentication
export interface User extends DefaultUser {
  id: string
  email: string
  name: string
  avatar?: string
}

// Extended JWT interface for authentication
export interface AuthJWT extends JWT {
  id: string
  avatar?: string
}

// Server session type
export interface ServerSession {
  user?: {
    id: string
    email: string
    name: string
    avatar?: string
  }
  expires: string
}