import { AuthError } from '@supabase/supabase-js';

export function handleSupabaseError(error: unknown): never {
  if (error instanceof AuthError) {
    throw new Error(error.message);
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    throw new Error((error as { message: string }).message);
  }
  
  throw new Error('An unexpected error occurred');
}

export function createAuthErrorHandler(operation: string) {
  return (error: unknown): never => {
    if (error instanceof AuthError) {
      throw new Error(`${operation} failed: ${error.message}`);
    }
    
    if (error && typeof error === 'object' && 'message' in error) {
      throw new Error(`${operation} failed: ${(error as { message: string }).message}`);
    }
    
    throw new Error(`${operation} failed: An unexpected error occurred`);
  };
}