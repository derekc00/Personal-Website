import { getAllPosts, getPostBySlug } from '@/lib/posts';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/posts - Get all posts
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug');

    if (slug) {
      // If a slug is provided, return the specific post
      const post = await getPostBySlug(slug);
      
      if (!post) {
        return NextResponse.json(
          { error: 'Post not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(post);
    }
    
    // Otherwise return all posts
    const posts = await getAllPosts();
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error in posts API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}