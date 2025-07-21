import { createClient } from "@supabase/supabase-js";
import { ContentItemSchema, type ContentItem } from "./schemas";
import { ERROR_MESSAGES, CONTENT_TYPES } from './constants';
import { contentRowSchema } from "./schemas/auth";
import type { Database } from "./supabase";

// Helper function to ensure ISO date string format
function ensureISODateString(date: string): string {
  return date.includes('T') ? date : `${date}T00:00:00.000Z`;
}

// Create Supabase client for server-side use
// Using anon key is correct here - content reading should respect RLS policies
// and this maintains consistency with client-side access patterns
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getAllContent(): Promise<ContentItem[]> {
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .eq('published', true)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching content:', error);
    return [];
  }

  if (!data) {
    return [];
  }

  const validContent: ContentItem[] = [];

  for (const row of data) {
    try {
      // Validate the row with schema
      const validatedRow = contentRowSchema.parse(row);
      
      const contentItem: ContentItem = {
        id: validatedRow.id,
        slug: validatedRow.slug,
        title: validatedRow.title,
        excerpt: validatedRow.excerpt || ERROR_MESSAGES.NO_DESCRIPTION,
        date: ensureISODateString(validatedRow.date),
        category: validatedRow.category,
        image: validatedRow.image,
        type: validatedRow.type,
        tags: validatedRow.tags || [],
        content: validatedRow.content,
      };

      // Validate the complete content item
      const validatedItem = ContentItemSchema.parse(contentItem);
      validContent.push(validatedItem);
    } catch (error) {
      console.warn(`Invalid content for slug ${row.slug}:`, error);
      // Skip invalid content
    }
  }

  return validContent;
}

export async function getContentBySlug(slug: string): Promise<ContentItem | null> {
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error || !data) {
    console.warn(`Content not found for slug ${slug}:`, error);
    return null;
  }

  try {
    // Validate the row with schema
    const validatedRow = contentRowSchema.parse(data);
    
    const contentItem: ContentItem = {
      id: validatedRow.id,
      slug: validatedRow.slug,
      title: validatedRow.title,
      excerpt: validatedRow.excerpt || ERROR_MESSAGES.NO_DESCRIPTION,
      date: validatedRow.date.includes('T') ? validatedRow.date : `${validatedRow.date}T00:00:00.000Z`,
      category: validatedRow.category,
      image: validatedRow.image,
      type: validatedRow.type,
      tags: validatedRow.tags || [],
      content: validatedRow.content,
    };

    // Validate the complete content item
    return ContentItemSchema.parse(contentItem);
  } catch (error) {
    console.warn(`Invalid content for slug ${slug}:`, error);
    return null;
  }
}

export async function getContentByType(type: typeof CONTENT_TYPES.BLOG | typeof CONTENT_TYPES.PROJECT): Promise<ContentItem[]> {
  const allContent = await getAllContent();
  return allContent.filter(item => item.type === type);
}

export async function getCategories(): Promise<string[]> {
  const content = await getAllContent();
  return Array.from(new Set(content.map((item) => item.category)));
}

export async function searchContent(query: string): Promise<ContentItem[]> {
  const content = await getAllContent();
  const searchTerm = query.toLowerCase();

  return content.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm) ||
      item.excerpt.toLowerCase().includes(searchTerm) ||
      item.category.toLowerCase().includes(searchTerm)
  );
}

// Re-export types for backward compatibility
export type { ContentItem } from "./schemas";
