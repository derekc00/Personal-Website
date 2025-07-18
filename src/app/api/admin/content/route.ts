import { NextRequest, NextResponse } from 'next/server'
import { withAuth, type AuthenticatedRequest } from '@/lib/api/middleware'
import { createContent, listContent } from '@/lib/api/content-utils'
import { createServerClient } from '@/lib/supabase-server'
import { contentInsertSchema } from '@/lib/schemas/auth'
import { handleApiError, createApiError } from '@/lib/api/errors'
import { HTTP_STATUS } from '@/lib/constants'

// GET /api/admin/content - List all content (including drafts)
export async function GET(req: NextRequest) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      // Get the auth token from the request
      const authHeader = req.headers.get('authorization')
      const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined
      
      // Create an authenticated Supabase client
      const supabaseClient = createServerClient(token)
      
      const content = await listContent(true, supabaseClient) // Include unpublished content
      
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
      
      // Get the auth token from the request
      const authHeader = req.headers.get('authorization')
      const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined
      
      // Create an authenticated Supabase client
      const supabaseClient = createServerClient(token)
      
      // Create content with author_id
      
      const content = await createContent({
        ...validationResult.data,
        author_id: req.user!.id
      }, supabaseClient)
      
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