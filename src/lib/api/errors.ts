import { NextResponse } from 'next/server'
import { HTTP_STATUS, ERROR_MESSAGES } from '@/lib/constants'
import { ZodError } from 'zod'

export type ApiErrorCode = 
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'BAD_REQUEST'
  | 'INTERNAL_ERROR'
  | 'DUPLICATE_ENTRY'
  | 'NO_AUTH'
  | 'INSUFFICIENT_ROLE'
  | 'OPTIMISTIC_LOCK_ERROR'

export interface ApiError {
  success: false
  error: string
  code: ApiErrorCode
  details?: unknown
}

export function createApiError(
  message: string,
  code: ApiErrorCode,
  status: number,
  details?: unknown
): NextResponse {
  const response: ApiError = {
    success: false,
    error: message,
    code,
    ...(details ? { details } : {})
  }
  
  return NextResponse.json(response, { status })
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return createApiError(
      ERROR_MESSAGES.INVALID_REQUEST,
      'VALIDATION_ERROR',
      HTTP_STATUS.BAD_REQUEST,
      error.errors
    )
  }
  
  if (error instanceof Error) {
    // Check for specific error patterns
    if (error.message.includes('duplicate key') || error.message.includes('already exists')) {
      return createApiError(
        ERROR_MESSAGES.SLUG_ALREADY_EXISTS,
        'DUPLICATE_ENTRY',
        HTTP_STATUS.CONFLICT
      )
    }
    
    if (error.message.includes('not found')) {
      return createApiError(
        error.message,
        'NOT_FOUND',
        HTTP_STATUS.NOT_FOUND
      )
    }
    
    // Default to internal error
    return createApiError(
      process.env.NODE_ENV === 'production' 
        ? ERROR_MESSAGES.INTERNAL_SERVER_ERROR 
        : error.message,
      'INTERNAL_ERROR',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
  
  return createApiError(
    ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    'INTERNAL_ERROR',
    HTTP_STATUS.INTERNAL_SERVER_ERROR
  )
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'success' in error &&
    error.success === false &&
    'error' in error &&
    'code' in error
  )
}