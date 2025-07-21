import { NextRequest, NextResponse } from 'next/server'
import { withAuth, type AuthenticatedRequest } from '@/lib/api/middleware'
import { createContent, listContent } from '@/lib/api/content-utils'
import { contentInsertSchema } from '@/lib/schemas/auth'
import { handleApiError, createApiError } from '@/lib/api/errors'
import { HTTP_STATUS } from '@/lib/constants'

// GET /api/admin/content - List all content (including drafts)
export async function GET(req: NextRequest) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      const content = await listContent(true, req.supabase) // Include unpublished content
      
      return NextResponse.json({
        success: true,
        data: content
      })
    } catch (error) {
      return handleApiError(error)
    }
  })(req)
}

// POST /api/admin/content - Create new content
export async function POST(req: NextRequest) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      const body = await req.json()
      
      // Validate request body
      const validationResult = contentInsertSchema.safeParse(body)
      
      if (!validationResult.success) {
        return handleApiError(validationResult.error)
      }
      
      // Create content with author_id using authenticated Supabase client
      const content = await createContent({
        ...validationResult.data,
        author_id: req.user!.id
      }, req.supabase)
      
      if (!content) {
        return createApiError(
          'Failed to create content',
          'INTERNAL_ERROR',
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        )
      }
      
      return NextResponse.json(
        { success: true, data: content },
        { status: HTTP_STATUS.CREATED }
      )
    } catch (error) {
      return handleApiError(error)
    }
  })(req)
}