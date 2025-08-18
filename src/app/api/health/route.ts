import { createPublicApiHandler } from '@/lib/api-middleware'
import { createApiResponse } from '@/lib/api-utils'

export const GET = createPublicApiHandler(async () => {
  return createApiResponse(null, 200, 'Service is healthy')
})