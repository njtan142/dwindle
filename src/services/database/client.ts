import { PrismaClient } from '@prisma/client'

// Define a type for the global object to include our Prisma instance
type GlobalWithPrisma = typeof globalThis & {
  prisma: PrismaClient | undefined
}

// Create a single Prisma client instance for the entire application
export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

// For development environments, we want to reuse the same Prisma client
// to prevent too many connections to the database
if (process.env.NODE_ENV !== 'production') {
  const globalWithPrisma = globalThis as GlobalWithPrisma
  if (!globalWithPrisma.prisma) {
    globalWithPrisma.prisma = prisma
  }
}

// Export the client for use in other modules
export default prisma