import { NextRequest, NextResponse } from 'next/server'
import { list } from '@vercel/blob'
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
    
    // List all blobs to find the one matching our filename
    const { blobs } = await list()
    
    // Find the blob that matches our filename
    const matchingBlob = blobs.find(blob => 
      blob.pathname.includes(fileName) || blob.url.includes(fileName)
    )
    
    if (!matchingBlob) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.VIDEO_NOT_FOUND },
        { status: HTTP_STATUS.NOT_FOUND }
      )
    }
    
    return NextResponse.json({
      url: matchingBlob.url,
      fileName
    })
  } catch (error) {
    console.error('Error fetching video from Vercel Blob:', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}