import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/middleware'
import { getContent, updateContent, deleteContent } from '@/lib/api/content-utils'
import { createServerClient } from '@/lib/supabase-server'
import { contentUpdateSchema } from '@/lib/schemas/auth'
import { handleApiError, createApiError } from '@/lib/api/errors'
import { HTTP_STATUS, ERROR_MESSAGES } from '@/lib/constants'

type RouteParams = {
  params: Promise<{ slug: string }>
}

// GET /api/admin/content/[slug] - Get single content item
export async function GET(req: NextRequest, { params }: RouteParams) {
  return withAuth(async () => {
    try {
      const { slug } = await params
      const content = await getContent(slug)
      
      if (!content) {
        return createApiError(
          ERROR_MESSAGES.CONTENT_NOT_FOUND,
          'NOT_FOUND',
          HTTP_STATUS.NOT_FOUND
        )
      }
      
      return NextResponse.json({
        success: true,
        data: content
      })
    } catch (error) {
      return handleApiError(error)
    }
  })(req)
}

// PATCH /api/admin/content/[slug] - Update existing content
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  return withAuth(async (innerReq: NextRequest) => {
    try {
      const { slug } = await params
      const body = await innerReq.json()
      
      // Extract updated_at for optimistic locking
      const { updated_at, ...updateData } = body
      
      // Validate request body
      const validationResult = contentUpdateSchema.safeParse(updateData)
      
      if (!validationResult.success) {
        return NextResponse.json(
          { 
            success: false, 
            error: ERROR_MESSAGES.INVALID_REQUEST,
            code: 'VALIDATION_ERROR',
            details: validationResult.error.errors
          },
          { status: HTTP_STATUS.BAD_REQUEST }
        )
      }
      
      // Update content with optimistic locking
      const content = await updateContent(slug, validationResult.data, updated_at)
      
      if (!content) {
        return createApiError(
          ERROR_MESSAGES.CONTENT_NOT_FOUND,
          'NOT_FOUND',
          HTTP_STATUS.NOT_FOUND
        )
      }
      
      return NextResponse.json({
        success: true,
        data: content
      })
    } catch (error) {
      if (error instanceof Error && error.message === 'OPTIMISTIC_LOCK_ERROR') {
        return createApiError(
          ERROR_MESSAGES.OPTIMISTIC_LOCK_ERROR,
          'OPTIMISTIC_LOCK_ERROR',
          HTTP_STATUS.CONFLICT
        )
      }
      
      return handleApiError(error)
    }
  })(req)
}

// DELETE /api/admin/content/[slug] - Delete content
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  return withAuth(async (innerReq: NextRequest) => {
    try {
      const { slug } = await params
      const url = new URL(innerReq.url)
      const hardDelete = url.searchParams.get('hard') === 'true'
      
      // Get the auth token from the request
      const authHeader = innerReq.headers.get('authorization')
      const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined
      
      // Create an authenticated Supabase client
      const supabaseClient = createServerClient(token)
      
      
      const success = await deleteContent(slug, !hardDelete, supabaseClient)
      
      
      if (!success) {
        return createApiError(
          ERROR_MESSAGES.CONTENT_NOT_FOUND,
          'NOT_FOUND',
          HTTP_STATUS.NOT_FOUND
        )
      }
      
      return NextResponse.json(
        { success: true },
        { status: HTTP_STATUS.OK }
      )
    } catch (error) {
      return handleApiError(error)
    }
  })(req)
}