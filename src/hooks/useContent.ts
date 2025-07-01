import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { type ContentRow, type ContentInsert, type ContentUpdate } from '@/lib/schemas/auth'

const API_BASE = '/api/admin/content'

async function fetchWithAuth(url: string, options?: RequestInit) {
  // Get the session from Supabase
  const { supabase } = await import('@/lib/supabase')
  const { data: { session } } = await supabase.auth.getSession()
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      'Authorization': session?.access_token ? `Bearer ${session.access_token}` : '',
      'Content-Type': 'application/json',
    },
  })

  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error || 'API request failed')
  }
  
  return data
}

export function useContentList() {
  return useQuery({
    queryKey: ['content', 'list'],
    queryFn: () => fetchWithAuth(API_BASE),
  })
}

export function useContent(slug: string) {
  return useQuery({
    queryKey: ['content', slug],
    queryFn: () => fetchWithAuth(`${API_BASE}/${slug}`),
    enabled: !!slug,
  })
}

export function useCreateContent() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: Omit<ContentInsert, 'slug'>) => 
      fetchWithAuth(API_BASE, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] })
    },
  })
}

export function useUpdateContent() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: ContentUpdate }) =>
      fetchWithAuth(`${API_BASE}/${slug}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['content'] })
      queryClient.invalidateQueries({ queryKey: ['content', variables.slug] })
    },
  })
}

export function useDeleteContent() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ slug, hard = false }: { slug: string; hard?: boolean }) =>
      fetchWithAuth(`${API_BASE}/${slug}${hard ? '?hard=true' : ''}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] })
    },
  })
}

export function useContentStats() {
  return useQuery({
    queryKey: ['content', 'stats'],
    queryFn: async () => {
      const { data } = await fetchWithAuth(API_BASE)
      const content = data as ContentRow[]
      
      return {
        total: content.length,
        published: content.filter(c => c.published).length,
        drafts: content.filter(c => !c.published).length,
        byType: {
          blog: content.filter(c => c.type === 'blog').length,
          project: content.filter(c => c.type === 'project').length,
        },
      }
    },
  })
}