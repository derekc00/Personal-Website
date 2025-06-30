import { z, ZodError, ZodSchema } from 'zod';
import { NextRequest } from 'next/server';

export class ValidationError extends Error {
  public readonly errors: z.ZodIssue[];

  constructor(error: ZodError) {
    const message = error.errors
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join(', ');
    super(message);
    this.name = 'ValidationError';
    this.errors = error.errors;
  }
}

export async function validateRequest<T extends ZodSchema>(
  request: NextRequest,
  schema: T
): Promise<z.infer<T>> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError(error);
    }
    throw error;
  }
}

export function validateData<T extends ZodSchema>(
  data: unknown,
  schema: T
): z.infer<T> {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError(error);
    }
    throw error;
  }
}

export function safeValidateData<T extends ZodSchema>(
  data: unknown,
  schema: T
): { success: true; data: z.infer<T> } | { success: false; error: ValidationError } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: new ValidationError(error) };
    }
    throw error;
  }
}