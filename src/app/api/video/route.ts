import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { ERROR_MESSAGES, HTTP_STATUS } from '@/lib/constants'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const fileName = searchParams.get('fileName')
    
    if (!fileName) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.FILENAME_REQUIRED },
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }
    
    // For now, return a placeholder response
    // In production, this would fetch from Vercel Blob storage
    return NextResponse.json({
      url: `/videos/${fileName}`, // This assumes videos are in public/videos directory
      fileName
    })
  } catch (error) {
    return NextResponse.json(
      { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}