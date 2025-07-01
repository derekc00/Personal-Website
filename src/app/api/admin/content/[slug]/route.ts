import { NextRequest, NextResponse } from 'next/server'
import { withRole } from '@/lib/api/middleware'
import { getContent, updateContent, deleteContent } from '@/lib/api/content-utils'
import { contentUpdateSchema } from '@/lib/schemas/auth'
import { HTTP_STATUS, ERROR_MESSAGES } from '@/lib/constants'
import { z } from 'zod'

type RouteParams = {
  params: Promise<{ slug: string }>
}

// GET /api/admin/content/[slug] - Get single content item
export async function GET(req: NextRequest, { params }: RouteParams) {
  return withRole('editor')(async () => {
    try {
      const { slug } = await params
      const content = await getContent(slug)
      
      if (!content) {
        return NextResponse.json(
          { 
            success: false, 
            error: ERROR_MESSAGES.CONTENT_NOT_FOUND, 
            code: 'NOT_FOUND' 
          },
          { status: HTTP_STATUS.NOT_FOUND }
        )
      }
      
      return NextResponse.json({
        success: true,
        data: content
      })
    } catch (error) {
      console.error('Error getting content:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 
          code: 'GET_ERROR' 
        },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      )
    }
  })(req)
}

// PATCH /api/admin/content/[slug] - Update existing content
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  return withRole('editor')(async (innerReq: NextRequest) => {
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
        return NextResponse.json(
          { 
            success: false, 
            error: ERROR_MESSAGES.CONTENT_NOT_FOUND, 
            code: 'NOT_FOUND' 
          },
          { status: HTTP_STATUS.NOT_FOUND }
        )
      }
      
      return NextResponse.json({
        success: true,
        data: content
      })
    } catch (error) {
      if (error instanceof Error && error.message === 'OPTIMISTIC_LOCK_ERROR') {
        return NextResponse.json(
          { 
            success: false, 
            error: ERROR_MESSAGES.OPTIMISTIC_LOCK_ERROR, 
            code: 'OPTIMISTIC_LOCK_ERROR' 
          },
          { status: HTTP_STATUS.CONFLICT }
        )
      }
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { 
            success: false, 
            error: ERROR_MESSAGES.INVALID_REQUEST,
            code: 'VALIDATION_ERROR',
            details: error.errors
          },
          { status: HTTP_STATUS.BAD_REQUEST }
        )
      }
      
      console.error('Error updating content:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 
          code: 'UPDATE_ERROR' 
        },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      )
    }
  })(req)
}

// DELETE /api/admin/content/[slug] - Delete content
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  return withRole('admin')(async (innerReq: NextRequest) => {
    try {
      const { slug } = await params
      const url = new URL(innerReq.url)
      const hardDelete = url.searchParams.get('hard') === 'true'
      
      const success = await deleteContent(slug, !hardDelete)
      
      if (!success) {
        return NextResponse.json(
          { 
            success: false, 
            error: ERROR_MESSAGES.CONTENT_NOT_FOUND, 
            code: 'NOT_FOUND' 
          },
          { status: HTTP_STATUS.NOT_FOUND }
        )
      }
      
      return NextResponse.json(
        { success: true },
        { status: HTTP_STATUS.OK }
      )
    } catch (error) {
      console.error('Error deleting content:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 
          code: 'DELETE_ERROR' 
        },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      )
    }
  })(req)
}