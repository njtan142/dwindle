import { prisma } from './client'
import { Prisma } from '@prisma/client'
import { DatabaseError, handlePrismaError } from './error-handler'

/**
 * Executes a database transaction
 * @param transactionFn - The function to execute within a transaction
 * @returns The result of the transaction
 */
export async function executeTransaction<T>(
  transactionFn: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  try {
    return await prisma.$transaction(transactionFn)
  } catch (error) {
    throw handlePrismaError(error)
  }
}

/**
 * Executes a database transaction with options
 * @param transactionFn - The function to execute within a transaction
 * @param options - Transaction options
 * @returns The result of the transaction
 */
export async function executeTransactionWithOptions<T>(
  transactionFn: (tx: Prisma.TransactionClient) => Promise<T>,
  options: {
    maxWait?: number
    timeout?: number
    isolationLevel?: Prisma.TransactionIsolationLevel
  }
): Promise<T> {
  try {
    return await prisma.$transaction(transactionFn, options)
  } catch (error) {
    throw handlePrismaError(error)
  }
}

/**
 * Example: Adds a member to a channel within a transaction
 * @param channelId - The ID of the channel
 * @param userId - The ID of the user to add
 * @returns The created membership object
 */
export async function addChannelMemberTransaction(channelId: string, userId: string) {
  return executeTransaction(async (tx) => {
    // Create the membership
    const membership = await tx.membership.create({
      data: {
        userId,
        channelId
      }
    })
    
    // Update channel membership count (if we had a field for it)
    // This is just an example of a second operation in the transaction
    // await tx.channel.update({
    //   where: { id: channelId },
    //   data: { memberCount: { increment: 1 } }
    // })
    
    return membership
  })
}

/**
 * Example: Removes a member from a channel within a transaction
 * @param channelId - The ID of the channel
 * @param userId - The ID of the user to remove
 * @returns void
 */
export async function removeChannelMemberTransaction(channelId: string, userId: string) {
  return executeTransaction(async (tx) => {
    // Delete the membership
    await tx.membership.delete({
      where: {
        userId_channelId: {
          userId,
          channelId
        }
      }
    })
    
    // Update channel membership count (if we had a field for it)
    // This is just an example of a second operation in the transaction
    // await tx.channel.update({
    //   where: { id: channelId },
    //   data: { memberCount: { decrement: 1 } }
    // })
  })
}