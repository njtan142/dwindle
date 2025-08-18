/**
 * Custom error class for database operations
 */
export class DatabaseError extends Error {
  constructor(
    message: string,
    public originalError?: unknown,
    public code?: string
  ) {
    super(message)
    this.name = 'DatabaseError'
    
    // Ensure proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DatabaseError)
    }
  }
}

/**
 * Handles Prisma-specific errors and converts them to more user-friendly errors
 * @param error - The original error
 * @returns A DatabaseError with a user-friendly message
 */
export function handlePrismaError(error: unknown): DatabaseError {
  if (error instanceof DatabaseError) {
    return error
  }
  
  // Handle Prisma errors
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const prismaError = error as { code: string; meta?: unknown }
    
    switch (prismaError.code) {
      case 'P2000':
        return new DatabaseError('The provided value for the column is too long', error, prismaError.code)
      case 'P2001':
        return new DatabaseError('The record searched for in the where condition does not exist', error, prismaError.code)
      case 'P2002':
        return new DatabaseError('Unique constraint failed', error, prismaError.code)
      case 'P2003':
        return new DatabaseError('Foreign key constraint failed', error, prismaError.code)
      case 'P2004':
        return new DatabaseError('A constraint failed on the database', error, prismaError.code)
      case 'P2005':
        return new DatabaseError('The value stored in the database is invalid for the field', error, prismaError.code)
      case 'P2006':
        return new DatabaseError('The provided value is invalid for the field', error, prismaError.code)
      case 'P2007':
        return new DatabaseError('Data validation error', error, prismaError.code)
      case 'P2008':
        return new DatabaseError('Failed to parse the query', error, prismaError.code)
      case 'P2009':
        return new DatabaseError('Failed to validate the query', error, prismaError.code)
      case 'P2010':
        return new DatabaseError('Raw query failed', error, prismaError.code)
      case 'P2011':
        return new DatabaseError('Null constraint violation', error, prismaError.code)
      case 'P2012':
        return new DatabaseError('Missing a required value', error, prismaError.code)
      case 'P2013':
        return new DatabaseError('Missing the required argument', error, prismaError.code)
      case 'P2014':
        return new DatabaseError('The change you are trying to make would violate the required relation', error, prismaError.code)
      case 'P2015':
        return new DatabaseError('A related record could not be found', error, prismaError.code)
      case 'P2016':
        return new DatabaseError('Query interpretation error', error, prismaError.code)
      case 'P2017':
        return new DatabaseError('The records for the relation are not connected', error, prismaError.code)
      case 'P2018':
        return new DatabaseError('The required connected records were not found', error, prismaError.code)
      case 'P2019':
        return new DatabaseError('Input error', error, prismaError.code)
      case 'P2020':
        return new DatabaseError('Value out of range', error, prismaError.code)
      case 'P2021':
        return new DatabaseError('The table does not exist in the current database', error, prismaError.code)
      case 'P2022':
        return new DatabaseError('The column does not exist in the current database', error, prismaError.code)
      case 'P2023':
        return new DatabaseError('Inconsistent column data', error, prismaError.code)
      case 'P2024':
        return new DatabaseError('Timed out fetching a new connection from the pool', error, prismaError.code)
      case 'P2025':
        return new DatabaseError('An operation failed because it depends on one or more records that were required but not found', error, prismaError.code)
      case 'P2026':
        return new DatabaseError('The current database provider does not support a feature', error, prismaError.code)
      case 'P2027':
        return new DatabaseError('Multiple errors occurred on the database during query execution', error, prismaError.code)
      default:
        return new DatabaseError('Database operation failed', error, prismaError.code)
    }
  }
  
  // Handle generic errors
  if (error instanceof Error) {
    return new DatabaseError(error.message, error)
  }
  
  // Handle unknown errors
  return new DatabaseError('An unknown database error occurred', error)
}

/**
 * Logs database errors with additional context
 * @param error - The error to log
 * @param context - Additional context about where the error occurred
 */
export function logDatabaseError(error: unknown, context: string): void {
  console.error(`Database Error in ${context}:`, error)
  
  if (error instanceof DatabaseError) {
    console.error('Original error:', error.originalError)
    console.error('Error code:', error.code)
  }
}