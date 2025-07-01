import { supabase } from '@/lib/supabase'
import { type ContentInsert, type ContentUpdate, type ContentRow } from '@/lib/schemas/auth'

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)
}

export async function checkSlugExists(slug: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('content')
    .select('id')
    .eq('slug', slug)
    .single()
  
  return !error && !!data
}

export async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = generateSlug(title)
  let slug = baseSlug
  let counter = 1
  
  while (await checkSlugExists(slug)) {
    slug = `${baseSlug}-${counter}`
    counter++
  }
  
  return slug
}

export async function createContent(data: Omit<ContentInsert, 'slug'> & { slug?: string; author_id: string }): Promise<ContentRow | null> {
  const slug = data.slug || await generateUniqueSlug(data.title)
  
  const { data: content, error } = await supabase
    .from('content')
    .insert({
      ...data,
      slug,
      date: data.date || new Date().toISOString(),
      category: data.category || 'Uncategorized',
      type: data.type || 'blog',
      tags: data.tags || [],
      published: data.published ?? false,
      comments_enabled: data.comments_enabled ?? true,
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating content:', error)
    return null
  }
  
  return content
}

export async function updateContent(
  slug: string, 
  data: ContentUpdate,
  expectedUpdatedAt?: string
): Promise<ContentRow | null> {
  if (expectedUpdatedAt) {
    const { data: existing } = await supabase
      .from('content')
      .select('updated_at')
      .eq('slug', slug)
      .single()
    
    if (existing && existing.updated_at !== expectedUpdatedAt) {
      throw new Error('OPTIMISTIC_LOCK_ERROR')
    }
  }
  
  const { data: content, error } = await supabase
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

export async function deleteContent(slug: string, soft = true): Promise<boolean> {
  if (soft) {
    // For soft delete, just unpublish the content
    // In a real implementation, you'd add a deleted_at column
    const { error } = await supabase
      .from('content')
      .update({ 
        published: false
      })
      .eq('slug', slug)
    
    return !error
  }
  
  const { error } = await supabase
    .from('content')
    .delete()
    .eq('slug', slug)
  
  return !error
}

export async function getContent(slug: string): Promise<ContentRow | null> {
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error) {
    return null
  }
  
  return data
}

export async function listContent(includeUnpublished = false): Promise<ContentRow[]> {
  let query = supabase
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