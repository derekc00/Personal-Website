import { z, ZodError, ZodSchema } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

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

// API Route validation middleware
export function withValidation<T extends ZodSchema>(
  schema: T,
  handler: (
    req: NextRequest,
    context: { params: Record<string, string> },
    validatedData: z.infer<T>
  ) => Promise<NextResponse> | NextResponse
) {
  return async (req: NextRequest, context: { params: Record<string, string> }) => {
    try {
      const body = await req.json();
      const validatedData = schema.parse(body);
      return await handler(req, context, validatedData);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            details: error.flatten()
          },
          { status: 400 }
        );
      }
      
      // Handle JSON parsing errors
      if (error instanceof SyntaxError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid JSON in request body'
          },
          { status: 400 }
        );
      }
      
      // Generic error response
      return NextResponse.json(
        {
          success: false,
          error: 'Internal server error'
        },
        { status: 500 }
      );
    }
  };
}