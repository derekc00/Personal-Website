import { list } from "@vercel/blob";
import { HTTP_STATUS, ERROR_MESSAGES } from '@/lib/constants';
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');

    if (!fileName) {
      return NextResponse.json({ error: ERROR_MESSAGES.FILENAME_REQUIRED }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    console.log(`API: Loading video: ${fileName}`);
    
    const { blobs } = await list({
      prefix: fileName,
      limit: 1,
    });

    if (!blobs || blobs.length === 0) {
      console.warn(`API: No video found with filename: ${fileName}`);
      return NextResponse.json({ error: ERROR_MESSAGES.VIDEO_NOT_FOUND }, { status: HTTP_STATUS.NOT_FOUND });
    }

    const { url } = blobs[0];
    console.log(`API: Video loaded successfully: ${url}`);

    return NextResponse.json({ url });
  } catch (error) {
    console.error("API: Error loading video from Vercel Blob:", error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}