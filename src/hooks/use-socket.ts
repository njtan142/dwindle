'use client'

import { useSocketService } from '@/services/socket/socket-service'
import { UseSocketReturn } from '@/types'

/**
 * A hook for managing socket connections and real-time communication
 * @returns {UseSocketReturn} Object containing socket connection status and communication functions
 */
export function useSocket(): UseSocketReturn {
  return useSocketService()
}
