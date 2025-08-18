import { Prisma } from '@prisma/client'
import { Channel, Message, User, Membership } from '@/types/database'

/**
 * Query builder for channel operations
 */
export class ChannelQueryBuilder {
  private query: Prisma.ChannelFindManyArgs = {}
  
  whereName(name: string): this {
    this.query.where = { ...this.query.where, name }
    return this
  }
  
  whereType(type: Prisma.ChannelType): this {
    this.query.where = { ...this.query.where, type }
    return this
  }
  
  whereIsPrivate(isPrivate: boolean): this {
    this.query.where = { ...this.query.where, isPrivate }
    return this
  }
  
  includeMemberships(userId?: string): this {
    this.query.include = {
      ...this.query.include,
      memberships: userId ? {
        where: { userId },
        select: { userId: true }
      } : true
    }
    return this
  }
  
  includeMessageCount(): this {
    this.query.include = {
      ...this.query.include,
      _count: {
        ...this.query.include?._count,
        messages: true
      }
    }
    return this
  }
  
  includeMembershipCount(): this {
    this.query.include = {
      ...this.query.include,
      _count: {
        ...this.query.include?._count,
        memberships: true
      }
    }
    return this
  }
  
  orderBy(field: keyof Prisma.ChannelOrderByWithRelationInput, direction: 'asc' | 'desc' = 'asc'): this {
    this.query.orderBy = { [field]: direction } as Prisma.ChannelOrderByWithRelationInput
    return this
  }
  
  take(limit: number): this {
    this.query.take = limit
    return this
  }
  
  skip(offset: number): this {
    this.query.skip = offset
    return this
  }
  
  build(): Prisma.ChannelFindManyArgs {
    return this.query
  }
}

/**
 * Query builder for message operations
 */
export class MessageQueryBuilder {
  private query: Prisma.MessageFindManyArgs = {}
  
  whereChannelId(channelId: string): this {
    this.query.where = { ...this.query.where, channelId }
    return this
  }
  
  whereUserId(userId: string): this {
    this.query.where = { ...this.query.where, userId }
    return this
  }
  
  includeUser(): this {
    this.query.include = {
      ...this.query.include,
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
    return this
  }
  
  orderByTimestamp(direction: 'asc' | 'desc' = 'desc'): this {
    this.query.orderBy = { timestamp: direction }
    return this
  }
  
  take(limit: number): this {
    this.query.take = limit
    return this
  }
  
  skip(offset: number): this {
    this.query.skip = offset
    return this
  }
  
  build(): Prisma.MessageFindManyArgs {
    return this.query
  }
}

/**
 * Query builder for user operations
 */
export class UserQueryBuilder {
  private query: Prisma.UserFindManyArgs = {}
  
  whereName(name: string): this {
    this.query.where = { ...this.query.where, name }
    return this
  }
  
  whereEmail(email: string): this {
    this.query.where = { ...this.query.where, email }
    return this
  }
  
  whereOnline(online: boolean): this {
    this.query.where = { ...this.query.where, online }
    return this
  }
  
  orderBy(field: keyof Prisma.UserOrderByWithRelationInput, direction: 'asc' | 'desc' = 'asc'): this {
    this.query.orderBy = { [field]: direction } as Prisma.UserOrderByWithRelationInput
    return this
  }
  
  take(limit: number): this {
    this.query.take = limit
    return this
  }
  
  skip(offset: number): this {
    this.query.skip = offset
    return this
  }
  
  build(): Prisma.UserFindManyArgs {
    return this.query
  }
}

/**
 * Query builder for membership operations
 */
export class MembershipQueryBuilder {
  private query: Prisma.MembershipFindManyArgs = {}
  
  whereUserId(userId: string): this {
    this.query.where = { ...this.query.where, userId }
    return this
  }
  
  whereChannelId(channelId: string): this {
    this.query.where = { ...this.query.where, channelId }
    return this
  }
  
  includeChannel(): this {
    this.query.include = {
      ...this.query.include,
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
    return this
  }
  
  includeUser(): this {
    this.query.include = {
      ...this.query.include,
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
    return this
  }
  
  orderByJoinedAt(direction: 'asc' | 'desc' = 'asc'): this {
    this.query.orderBy = { joinedAt: direction }
    return this
  }
  
  take(limit: number): this {
    this.query.take = limit
    return this
  }
  
  skip(offset: number): this {
    this.query.skip = offset
    return this
  }
  
  build(): Prisma.MembershipFindManyArgs {
    return this.query
  }
}