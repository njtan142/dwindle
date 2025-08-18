import { db } from '@/lib/db'

/**
 * Validates if a user has access to a channel
 * @param userId - The ID of the user
 * @param channelId - The ID of the channel
 * @returns Boolean indicating if the user has access to the channel
 */
export async function validateChannelAccess(userId: string, channelId: string): Promise<boolean> {
  try {
    // Special case for general channel - all users have access
    if (channelId === 'general') {
      return true
    }

    // First, get the channel to check if it exists and if it's private
    const channel = await db.channel.findUnique({
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
    const membership = await db.membership.findUnique({
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
    console.error('Error validating channel access:', error)
    return false
  }
}

/**
 * Checks if a channel exists
 * @param channelId - The ID of the channel
 * @returns Boolean indicating if the channel exists
 */
export async function channelExists(channelId: string): Promise<boolean> {
  try {
    const channel = await db.channel.findUnique({
      where: { id: channelId },
      select: { id: true }
    })
    return !!channel
  } catch (error) {
    console.error('Error checking if channel exists:', error)
    return false
  }
}

/**
 * Gets a channel by name
 * @param name - The name of the channel
 * @returns The channel object or null if not found
 */
export async function getChannelByName(name: string) {
  try {
    return await db.channel.findUnique({
      where: { name: name }
    })
  } catch (error) {
    console.error('Error getting channel by name:', error)
    return null
  }
}

/**
 * Gets a channel by ID
 * @param channelId - The ID of the channel
 * @returns The channel object or null if not found
 */
export async function getChannelById(channelId: string) {
  try {
    return await db.channel.findUnique({
      where: { id: channelId }
    })
  } catch (error) {
    console.error('Error getting channel by ID:', error)
    return null
  }
}

/**
 * Ensures that a "general" channel exists as a PUBLIC channel
 * @returns The general channel object
 */
export async function ensureGeneralChannel() {
  try {
    // Check if a channel named "general" already exists
    let generalChannel = await getChannelByName("general");
    
    // If not, create it as a PUBLIC channel
    if (!generalChannel) {
      generalChannel = await db.channel.create({
        data: {
          name: "general",
          description: "General discussion channel",
          type: "PUBLIC",
          isPrivate: false
        }
      });
      console.log('Created general channel');
    } else {
      console.log('General channel already exists');
    }
    
    return generalChannel;
  } catch (error) {
    console.error('Error ensuring general channel exists:', error);
    throw error;
  }
}