import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/middleware'
import { createContent, listContent } from '@/lib/api/content-utils'
import { contentInsertSchema } from '@/lib/schemas/auth'
import { HTTP_STATUS, ERROR_MESSAGES } from '@/lib/constants'
import { z } from 'zod'

// GET /api/admin/content - List all content (including drafts)
export async function GET(req: NextRequest) {
  return withAuth(async () => {
    try {
      const content = await listContent(true) // Include unpublished content
      
      return NextResponse.json({
        success: true,
        data: content
      })
    } catch (error) {
      console.error('Error listing content:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 
          code: 'LIST_ERROR' 
        },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      )
    }
  })(req)
}

// POST /api/admin/content - Create new content
export async function POST(req: NextRequest) {
  return withAuth(async (req: NextRequest, user) => {
    try {
      const body = await req.json()
      
      // Validate request body
      const validationResult = contentInsertSchema.safeParse(body)
      
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
      
      // Create content with author_id
      const content = await createContent({
        ...validationResult.data,
        author_id: user.id
      })
      
      if (!content) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to create content', 
            code: 'CREATE_ERROR' 
          },
          { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
        )
      }
      
      return NextResponse.json(
        { success: true, data: content },
        { status: HTTP_STATUS.CREATED }
      )
    } catch (error) {
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
      
      console.error('Error creating content:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 
          code: 'CREATE_ERROR' 
        },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      )
    }
  })(req)
}