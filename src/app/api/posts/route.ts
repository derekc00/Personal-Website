import { getContentByType, getContentBySlug } from '@/lib/content';
import { HTTP_STATUS, ERROR_MESSAGES } from '@/lib/constants';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/posts - Get all posts
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug');

    if (slug) {
      // If a slug is provided, return the specific post
      const content = await getContentBySlug(slug);
      
      if (!content || content.type !== 'blog') {
        return NextResponse.json(
          { error: ERROR_MESSAGES.POST_NOT_FOUND },
          { status: HTTP_STATUS.NOT_FOUND }
        );
      }
      
      return NextResponse.json(content);
    }
    
    // Otherwise return all blog posts
    const posts = await getContentByType('blog');
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error in posts API:', error);
    return NextResponse.json(
      { error: ERROR_MESSAGES.FAILED_TO_FETCH_POSTS },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}