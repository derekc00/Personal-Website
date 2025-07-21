'use client'

import { useState, useEffect } from 'react'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import { Card } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import { useMDXComponents } from '@/mdx-components'

const DEFAULT_DEBOUNCE_DELAY_MS = 300 // milliseconds

interface MDXPreviewProps {
  content: string
  className?: string
  debounceDelay?: number
}

export function MDXPreview({ content, className, debounceDelay = DEFAULT_DEBOUNCE_DELAY_MS }: MDXPreviewProps) {
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCompiling, setIsCompiling] = useState(false)
  const components = useMDXComponents({})

  useEffect(() => {
    const compileMDX = async () => {
      if (!content.trim()) {
        setMdxSource(null)
        setError(null)
        return
      }

      setIsCompiling(true)
      setError(null)

      try {
        const result = await serialize(content, {
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [rehypeHighlight, rehypeSlug],
          },
        })
        setMdxSource(result)
      } catch (err) {
        console.error('MDX compilation error:', err)
        setError(err instanceof Error ? err.message : 'Failed to compile MDX')
        setMdxSource(null)
      } finally {
        setIsCompiling(false)
      }
    }

    const timeoutId = setTimeout(compileMDX, debounceDelay)
    return () => clearTimeout(timeoutId)
  }, [content, debounceDelay])

  return (
    <Card className={`p-6 h-full overflow-auto ${className}`}>
      <div className="prose prose-sm dark:prose-invert max-w-none">
        {isCompiling && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  MDX Compilation Error
                </h3>
                <pre className="mt-2 text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap font-mono">
                  {error}
                </pre>
              </div>
            </div>
          </div>
        )}
        
        {!isCompiling && !error && mdxSource && (
          <MDXRemote {...mdxSource} components={components} />
        )}
        
        {!isCompiling && !error && !mdxSource && !content.trim() && (
          <p className="text-gray-500 dark:text-gray-400 italic">
            Start typing to see the preview...
          </p>
        )}
      </div>
    </Card>
  )
}