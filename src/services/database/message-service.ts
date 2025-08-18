import { prisma } from './client'
import { Message } from '@/types/database'
import { DatabaseError } from './error-handler'

/**
 * Gets messages for a channel
 * @param channelId - The ID of the channel
 * @param limit - The maximum number of messages to return
 * @param offset - The number of messages to skip
 * @returns Array of messages
 */
export async function getChannelMessages(channelId: string, limit: number = 50, offset: number = 0) {
  try {
    return await prisma.message.findMany({
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
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset
    })
  } catch (error) {
    throw new DatabaseError('Error fetching channel messages', error)
  }
}

/**
 * Creates a new message
 * @param content - The content of the message
 * @param channelId - The ID of the channel
 * @param userId - The ID of the user creating the message
 * @returns The created message object
 */
export async function createMessage(content: string, channelId: string, userId: string): Promise<Message> {
  try {
    return await prisma.message.create({
      data: {
        content,
        channelId,
        userId
      },
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
    throw new DatabaseError('Error creating message', error)
  }
}

/**
 * Updates a message
 * @param messageId - The ID of the message to update
 * @param content - The new content of the message
 * @returns The updated message object
 */
export async function updateMessage(messageId: string, content: string): Promise<Message> {
  try {
    return await prisma.message.update({
      where: { id: messageId },
      data: {
        content,
        editedAt: new Date(),
        isEdited: true
      },
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
    throw new DatabaseError('Error updating message', error)
  }
}

/**
 * Deletes a message
 * @param messageId - The ID of the message to delete
 * @returns void
 */
export async function deleteMessage(messageId: string): Promise<void> {
  try {
    await prisma.message.delete({
      where: { id: messageId }
    })
  } catch (error) {
    throw new DatabaseError('Error deleting message', error)
  }
}