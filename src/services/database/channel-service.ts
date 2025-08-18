import { prisma } from './client'
import { Channel, ChannelType } from '@/types/database'
import { DatabaseError } from './error-handler'

/**
 * Validates if a user has access to a channel
 * @param userId - The ID of the user
 * @param channelId - The ID of the channel
 * @returns Boolean indicating if the user has access to the channel
 */
export async function validateChannelAccess(userId: string, channelId: string): Promise<boolean> {
  try {
    // First, get the channel to check if it exists and if it's private
    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      select: { isPrivate: true }
    })

    // If channel doesn't exist, user doesn't have access
    if (!channel) {
      return false
    }

    // If channel is not private, all users have access
    if (!channel.isPrivate) {
      return true
    }

    // For private channels, check if user is a member
    const membership = await prisma.membership.findUnique({
      where: {
        userId_channelId: {
          userId: userId,
          channelId: channelId
        }
      }
    })

    // User has access if they are a member of the private channel
    return !!membership
  } catch (error) {
    throw new DatabaseError('Error validating channel access', error)
  }
}

/**
 * Checks if a channel exists
 * @param channelId - The ID of the channel
 * @returns Boolean indicating if the channel exists
 */
export async function channelExists(channelId: string): Promise<boolean> {
  try {
    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      select: { id: true }
    })
    return !!channel
  } catch (error) {
    throw new DatabaseError('Error checking if channel exists', error)
  }
}

/**
 * Gets a channel by name
 * @param name - The name of the channel
 * @returns The channel object or null if not found
 */
export async function getChannelByName(name: string): Promise<Channel | null> {
  try {
    return await prisma.channel.findUnique({
      where: { name: name }
    })
  } catch (error) {
    throw new DatabaseError('Error getting channel by name', error)
  }
}

/**
 * Gets a channel by ID
 * @param channelId - The ID of the channel
 * @returns The channel object or null if not found
 */
export async function getChannelById(channelId: string): Promise<Channel | null> {
  try {
    return await prisma.channel.findUnique({
      where: { id: channelId }
    })
  } catch (error) {
    throw new DatabaseError('Error getting channel by ID', error)
  }
}

/**
 * Ensures that a "general" channel exists as a PUBLIC channel
 * @returns The general channel object
 */
export async function ensureGeneralChannel(): Promise<Channel> {
  try {
    // Check if a channel named "general" already exists
    let generalChannel = await getChannelByName("general")
    
    // If not, create it as a PUBLIC channel
    if (!generalChannel) {
      generalChannel = await prisma.channel.create({
        data: {
          name: "general",
          description: "General discussion channel",
          type: "PUBLIC",
          isPrivate: false
        }
      })
      console.log('Created general channel')
    } else {
      console.log('General channel already exists')
    }
    
    return generalChannel
  } catch (error) {
    throw new DatabaseError('Error ensuring general channel exists', error)
  }
}

/**
 * Gets all members of a channel
 * @param channelId - The ID of the channel
 * @returns Array of users who are members of the channel
 */
export async function getChannelMembers(channelId: string) {
  try {
    return await prisma.user.findMany({
      where: {
        memberships: {
          some: {
            channelId: channelId
          }
        }
      },
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
    throw new DatabaseError('Error getting channel members', error)
  }
}

/**
 * Creates a new channel
 * @param name - The name of the channel
 * @param description - The description of the channel
 * @param type - The type of the channel
 * @param creatorId - The ID of the user creating the channel
 * @returns The created channel object
 */
export async function createChannel(
  name: string,
  description: string | undefined,
  type: ChannelType,
  creatorId: string
): Promise<Channel> {
  try {
    const isPrivate = type === 'PRIVATE'
    
    return await prisma.channel.create({
      data: {
        name,
        description,
        type,
        isPrivate,
        memberships: {
          create: {
            userId: creatorId
          }
        }
      }
    })
  } catch (error) {
    throw new DatabaseError('Error creating channel', error)
  }
}

/**
 * Gets all channels accessible to a user
 * @param userId - The ID of the user
 * @returns Array of channels accessible to the user
 */
export async function getUserChannels(userId: string) {
  try {
    return await prisma.channel.findMany({
      where: {
        OR: [
          {
            type: 'PUBLIC'
          },
          {
            memberships: {
              some: {
                userId: userId
              }
            }
          }
        ]
      },
      include: {
        memberships: {
          where: { userId: userId },
          select: { userId: true }
        },
        _count: {
          select: { messages: true, memberships: true }
        }
      },
      orderBy: { name: 'asc' }
    })
  } catch (error) {
    throw new DatabaseError('Error fetching user channels', error)
 }
}

/**
 * Adds a member to a private channel
 * @param channelId - The ID of the channel
 * @param userId - The ID of the user to add
 * @returns The created membership object
 */
export async function addChannelMember(channelId: string, userId: string) {
  try {
    return await prisma.membership.create({
      data: {
        userId: userId,
        channelId: channelId
      }
    })
  } catch (error) {
    throw new DatabaseError('Error adding member to channel', error)
  }
}

/**
 * Removes a member from a private channel
 * @param channelId - The ID of the channel
 * @param userId - The ID of the user to remove
 * @returns void
 */
export async function removeChannelMember(channelId: string, userId: string): Promise<void> {
  try {
    await prisma.membership.delete({
      where: {
        userId_channelId: {
          userId: userId,
          channelId: channelId
        }
      }
    })
  } catch (error) {
    throw new DatabaseError('Error removing member from channel', error)
  }
}

/**
 * Checks if a user is a member of a channel
 * @param channelId - The ID of the channel
 * @param userId - The ID of the user
 * @returns Boolean indicating if the user is a member of the channel
 */
export async function isChannelMember(channelId: string, userId: string): Promise<boolean> {
  try {
    const membership = await prisma.membership.findUnique({
      where: {
        userId_channelId: {
          userId: userId,
          channelId: channelId
        }
      }
    })
    return !!membership
  } catch (error) {
    throw new DatabaseError('Error checking channel membership', error)
  }
}