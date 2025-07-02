import { type SupabaseClient } from '@supabase/supabase-js'
import { supabase as defaultSupabase } from '@/lib/supabase'
import { type ContentInsert, type ContentUpdate, type ContentRow } from '@/lib/schemas/auth'

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)
}

export async function checkSlugExists(slug: string, supabase?: SupabaseClient): Promise<boolean> {
  const client = supabase || defaultSupabase
  
  const { data, error } = await client
    .from('content')
    .select('id')
    .eq('slug', slug)
    .single()
  
  
  // If error is "PGRST116" it means no rows found, so slug doesn't exist
  if (error?.code === 'PGRST116') {
    return false
  }
  
  // If we have data or any other error, assume slug exists
  return !!data || !!error
}

export async function generateUniqueSlug(title: string, supabase?: SupabaseClient): Promise<string> {
  const baseSlug = generateSlug(title)
  let slug = baseSlug
  let counter = 1
  
  while (await checkSlugExists(slug, supabase)) {
    slug = `${baseSlug}-${counter}`
    counter++
  }
  
  return slug
}

export async function createContent(
  data: Omit<ContentInsert, 'slug'> & { slug?: string; author_id: string },
  supabase?: SupabaseClient
): Promise<ContentRow | null> {
  const client = supabase || defaultSupabase
  
  // Always generate unique slug, even if one is provided
  const slug = await generateUniqueSlug(data.title, client)
  
  const insertData = {
    ...data,
    slug,
    date: data.date || new Date().toISOString(),
    category: data.category || 'Uncategorized',
    type: data.type || 'blog',
    tags: data.tags || [],
    published: data.published ?? false,
    comments_enabled: data.comments_enabled ?? true,
  }
  
  
  const { data: content, error } = await client
    .from('content')
    .insert(insertData)
    .select()
    .single()
  
  if (error) {
    console.error('[createContent] Supabase error:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      insertData
    })
    return null
  }
  
  return content
}

export async function updateContent(
  slug: string, 
  data: ContentUpdate,
  expectedUpdatedAt?: string,
  supabase?: SupabaseClient
): Promise<ContentRow | null> {
  const client = supabase || defaultSupabase
  
  if (expectedUpdatedAt) {
    const { data: existing } = await client
      .from('content')
      .select('updated_at')
      .eq('slug', slug)
      .single()
    
    if (existing && existing.updated_at !== expectedUpdatedAt) {
      throw new Error('OPTIMISTIC_LOCK_ERROR')
    }
  }
  
  const { data: content, error } = await client
    .from('content')
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq('slug', slug)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating content:', error)
    return null
  }
  
  return content
}

export async function deleteContent(slug: string, soft = true, supabase?: SupabaseClient): Promise<boolean> {
  const client = supabase || defaultSupabase
  
  if (soft) {
    // For soft delete, just unpublish the content
    // In a real implementation, you'd add a deleted_at column
    const { error } = await client
      .from('content')
      .update({ 
        published: false
      })
      .eq('slug', slug)
    
    return !error
  }
  
  const { error } = await client
    .from('content')
    .delete()
    .eq('slug', slug)
  
  return !error
}

export async function getContent(slug: string, supabase?: SupabaseClient): Promise<ContentRow | null> {
  const client = supabase || defaultSupabase
  const { data, error } = await client
    .from('content')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error) {
    return null
  }
  
  return data
}

export async function listContent(includeUnpublished = false, supabase?: SupabaseClient): Promise<ContentRow[]> {
  const client = supabase || defaultSupabase
  let query = client
    .from('content')
    .select('*')
    .order('date', { ascending: false })
  
  if (!includeUnpublished) {
    query = query.eq('published', true)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error listing content:', error)
    return []
  }
  
  return data || []
}