'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useContent, useCreateContent, useUpdateContent } from '@/hooks/useContent'
import { type ContentInsert, type ContentUpdate } from '@/lib/schemas/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Save, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

interface ContentEditorProps {
  slug?: string
}

// Simple slug generation function
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function ContentEditor({ slug }: ContentEditorProps) {
  const router = useRouter()
  const { data: existingContent, isLoading } = useContent(slug || '')
  const createContent = useCreateContent()
  const updateContent = useUpdateContent()
  
  const [formData, setFormData] = useState<Partial<ContentInsert>>({
    title: '',
    excerpt: '',
    content: '',
    category: 'Uncategorized',
    type: 'blog',
    tags: [],
    published: false,
  })
  
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (existingContent?.data) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, slug: _, created_at, updated_at, author_id, ...contentData } = existingContent.data
      setFormData(contentData)
    }
  }, [existingContent])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      if (slug) {
        await updateContent.mutateAsync({
          slug,
          data: formData as ContentUpdate
        })
      } else {
        // Generate slug from title
        const generatedSlug = generateSlug(formData.title || '')
        const dataWithSlug = { ...formData, slug: generatedSlug }
        
        await createContent.mutateAsync(dataWithSlug as ContentInsert)
      }
      
      router.push('/admin/content')
    } catch (error) {
      console.error('[ContentEditor] Failed to save content:', error)
      console.error('[ContentEditor] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        error
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleTagInput = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(Boolean)
    setFormData(prev => ({ ...prev, tags }))
  }

  if (slug && isLoading) {
    return (
      <div className="p-6">
        <Card className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link 
          href="/admin/content"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Content
        </Link>
      </div>

      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">
          {slug ? 'Edit Content' : 'Create New Content'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              placeholder="Enter a compelling title..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Excerpt</label>
            <Input
              type="text"
              value={formData.excerpt}
              onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
              required
              placeholder="Brief description of the content..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'blog' | 'project' }))}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="blog">Blog Post</option>
                <option value="project">Project</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <Input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., Technology, Design..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
            <Input
              type="text"
              value={formData.tags?.join(', ')}
              onChange={(e) => handleTagInput(e.target.value)}
              placeholder="react, nextjs, typescript..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content (MDX)</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              required
              rows={20}
              className="w-full px-3 py-2 border rounded-md bg-background font-mono text-sm"
              placeholder="Write your MDX content here..."
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.published}
                onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm font-medium flex items-center">
                {formData.published ? (
                  <>
                    <Eye className="mr-1 h-4 w-4" />
                    Published
                  </>
                ) : (
                  <>
                    <EyeOff className="mr-1 h-4 w-4" />
                    Draft
                  </>
                )}
              </span>
            </label>

            <div className="space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/content')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  )
}