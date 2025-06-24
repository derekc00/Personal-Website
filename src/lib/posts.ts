import { getContentBySlug, getContentByType } from "./content";
import { Post, PostMetadata } from "../utils/types";

// Mark as server-only to prevent bundling in client code
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Gets all blog posts sorted by date
 * Uses the unified content system while maintaining backward compatibility
 */
export async function getAllPosts(): Promise<Post[]> {
  try {
    const blogContent = await getContentByType('blog');
    
    // Transform unified ContentItem to legacy Post format
    return blogContent.map(item => ({
      slug: item.slug,
      content: item.content,
      metadata: {
        title: item.title,
        date: item.date,
        tags: item.tags,
        image: item.image || undefined,
      } as PostMetadata
    }));
  } catch (error) {
    console.error("Error getting posts:", error);
    return [];
  }
}

/**
 * Gets a single blog post by slug
 * Uses the unified content system while maintaining backward compatibility
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const contentItem = await getContentBySlug(slug);
    
    if (!contentItem || contentItem.type !== 'blog') {
      return null;
    }

    // Transform unified ContentItem to legacy Post format
    return {
      slug: contentItem.slug,
      content: contentItem.content,
      metadata: {
        title: contentItem.title,
        date: contentItem.date,
        tags: contentItem.tags,
        image: contentItem.image || undefined,
      } as PostMetadata
    };
  } catch (error) {
    console.error(`Error getting post with slug "${slug}":`, error);
    return null;
  }
}
