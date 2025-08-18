import { db } from '@/lib/db'
import {
  validateChannelAccess,
  channelExists,
  getChannelByName,
  getChannelById,
  ensureGeneralChannel,
  getChannelMembers,
  createChannel,
  getUserChannels,
  addChannelMember,
  removeChannelMember,
  isChannelMember
} from '@/services/database/channel-service'

// Re-export the functions from the new centralized service
export {
  validateChannelAccess,
  channelExists,
  getChannelByName,
  getChannelById,
  ensureGeneralChannel,
  getChannelMembers,
  createChannel,
  getUserChannels,
  addChannelMember,
  removeChannelMember,
  isChannelMember
}