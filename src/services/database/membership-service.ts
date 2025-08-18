import { prisma } from './client'
import { Membership } from '@/types/database'
import { DatabaseError } from './error-handler'

/**
 * Gets all memberships for a user
 * @param userId - The ID of the user
 * @returns Array of memberships
 */
export async function getUserMemberships(userId: string) {
  try {
    return await prisma.membership.findMany({
      where: { userId },
      include: {
        channel: {
          select: {
            id: true,
            name: true,
            description: true,
            type: true,
            isPrivate: true
          }
        }
      }
    })
  } catch (error) {
    throw new DatabaseError('Error fetching user memberships', error)
  }
}

/**
 * Gets all memberships for a channel
 * @param channelId - The ID of the channel
 * @returns Array of memberships
 */
export async function getChannelMemberships(channelId: string) {
  try {
    return await prisma.membership.findMany({
      where: { channelId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            online: true
          }
        }
      }
    })
  } catch (error) {
    throw new DatabaseError('Error fetching channel memberships', error)
  }
}

/**
 * Creates a new membership
 * @param userId - The ID of the user
 * @param channelId - The ID of the channel
 * @returns The created membership object
 */
export async function createMembership(userId: string, channelId: string): Promise<Membership> {
 try {
    return await prisma.membership.create({
      data: {
        userId,
        channelId
      }
    })
  } catch (error) {
    throw new DatabaseError('Error creating membership', error)
  }
}

/**
 * Deletes a membership
 * @param userId - The ID of the user
 * @param channelId - The ID of the channel
 * @returns void
 */
export async function deleteMembership(userId: string, channelId: string): Promise<void> {
  try {
    await prisma.membership.delete({
      where: {
        userId_channelId: {
          userId,
          channelId
        }
      }
    })
  } catch (error) {
    throw new DatabaseError('Error deleting membership', error)
  }
}

/**
 * Checks if a membership exists
 * @param userId - The ID of the user
 * @param channelId - The ID of the channel
 * @returns Boolean indicating if the membership exists
 */
export async function membershipExists(userId: string, channelId: string): Promise<boolean> {
  try {
    const membership = await prisma.membership.findUnique({
      where: {
        userId_channelId: {
          userId,
          channelId
        }
      }
    })
    return !!membership
  } catch (error) {
    throw new DatabaseError('Error checking membership existence', error)
  }
}

/**
 * Gets the count of memberships for a channel
 * @param channelId - The ID of the channel
 * @returns The count of memberships
 */
export async function getChannelMembershipCount(channelId: string): Promise<number> {
  try {
    return await prisma.membership.count({
      where: { channelId }
    })
  } catch (error) {
    throw new DatabaseError('Error counting channel memberships', error)
  }
}