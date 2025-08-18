import { z, ZodSchema } from 'zod'
import { ValidationError } from '@/types/api'
import { createApiResponse } from '@/lib/api-utils'

// Enhanced validation helper function
export function validateRequest<T>(schema: ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: ValidationError } {
  try {
    const result = schema.safeParse(data)
    if (result.success) {
      return { success: true, data: result.data }
    } else {
      const errorMessage = result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ')
      return { success: false, error: new ValidationError(errorMessage) }
    }
  } catch (error) {
    return { success: false, error: new ValidationError('Invalid request data') }
  }
}

// Query parameter validation
export function validateQueryParams<T>(schema: ZodSchema<T>, searchParams: URLSearchParams): { success: true; data: T } | { success: false; error: ValidationError } {
  try {
    // Convert URLSearchParams to a plain object
    const params: Record<string, string | string[]> = {}
    
    for (const [key, value] of searchParams.entries()) {
      if (params[key]) {
        // If key already exists, convert to array or append to existing array
        if (Array.isArray(params[key])) {
          (params[key] as string[]).push(value)
        } else {
          params[key] = [params[key] as string, value]
        }
      } else {
        params[key] = value
      }
    }
    
    return validateRequest(schema, params)
  } catch (error) {
    return { success: false, error: new ValidationError('Invalid query parameters') }
  }
}

// Path parameter validation
export function validatePathParams<T>(schema: ZodSchema<T>, params: Record<string, string>): { success: true; data: T } | { success: false; error: ValidationError } {
  try {
    return validateRequest(schema, params)
  } catch (error) {
    return { success: false, error: new ValidationError('Invalid path parameters') }
 }
}

// Validation schemas for common API parameters
export const paginationSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1).pipe(z.number().min(1)),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 50).pipe(z.number().min(1).max(100)),
})

export const sortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
})

// Helper function to validate and extract pagination parameters
export function getPaginationParams(searchParams: URLSearchParams) {
  const paginationValidation = validateQueryParams(paginationSchema, searchParams)
  
  if (!paginationValidation.success) {
    return {
      page: 1,
      limit: 50,
      offset: 0
    }
  }
  
  const { page, limit } = paginationValidation.data
  const offset = (page - 1) * limit
  
  return {
    page,
    limit,
    offset
  }
}

// Helper function to validate and extract sort parameters
export function getSortParams(searchParams: URLSearchParams) {
  const sortValidation = validateQueryParams(sortSchema, searchParams)
  
  if (!sortValidation.success) {
    return {
      sortBy: 'createdAt',
      sortOrder: 'desc' as const
    }
  }
  
  return sortValidation.data
}