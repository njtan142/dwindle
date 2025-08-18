import { prisma } from './client'
import { User } from '@/types/database'
import { DatabaseError } from './error-handler'

/**
 * Gets all users
 * @returns Array of all users
 */
export async function getAllUsers() {
  try {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        online: true,
        createdAt: true
      },
      orderBy: { name: 'asc' }
    })
  } catch (error) {
    throw new DatabaseError('Error fetching users', error)
  }
}

/**
 * Gets a user by ID
 * @param userId - The ID of the user
 * @returns The user object or null if not found
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    return await prisma.user.findUnique({
      where: { id: userId }
    })
  } catch (error) {
    throw new DatabaseError('Error getting user by ID', error)
  }
}

/**
 * Updates a user
 * @param userId - The ID of the user to update
 * @param data - The data to update
 * @returns The updated user object
 */
export async function updateUser(userId: string, data: Partial<User>): Promise<User> {
  try {
    return await prisma.user.update({
      where: { id: userId },
      data
    })
  } catch (error) {
    throw new DatabaseError('Error updating user', error)
  }
}

/**
 * Sets a user's online status
 * @param userId - The ID of the user
 * @param online - The online status
 * @returns The updated user object
 */
export async function setUserOnlineStatus(userId: string, online: boolean): Promise<User> {
  try {
    return await prisma.user.update({
      where: { id: userId },
      data: { online }
    })
  } catch (error) {
    throw new DatabaseError('Error updating user online status', error)
  }
}