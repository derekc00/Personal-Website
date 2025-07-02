'use client'

import { useState, useMemo } from 'react'
import { useContentList, useDeleteContent, useUpdateContent } from '@/hooks/useContent'
import { type ContentRow } from '@/lib/schemas/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  ChevronUp,
  ChevronDown,
  Check,
  MoreVertical
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type SortField = 'date' | 'title' | 'updated_at'
type SortOrder = 'asc' | 'desc'

export function ContentList() {
  const { data: response, isLoading, error } = useContentList()
  const deleteContent = useDeleteContent()
  const updateContent = useUpdateContent()
  
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'blog' | 'project'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  const content = useMemo(() => response?.data || [], [response])

  const filteredAndSortedContent = useMemo(() => {
    let filtered = content

    // Search filter
    if (search) {
      filtered = filtered.filter((item: ContentRow) => 
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((item: ContentRow) => item.type === typeFilter)
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((item: ContentRow) => 
        statusFilter === 'published' ? item.published : !item.published
      )
    }

    // Sort
    filtered.sort((a: ContentRow, b: ContentRow) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const comparison = aVal.localeCompare(bVal)
        return sortOrder === 'asc' ? comparison : -comparison
      }
      
      return 0
    })

    return filtered
  }, [content, search, typeFilter, statusFilter, sortField, sortOrder]) as ContentRow[]

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const handleTogglePublish = async (item: ContentRow) => {
    await updateContent.mutateAsync({
      slug: item.slug,
      data: { published: !item.published }
    })
  }

  const handleDelete = async (slug: string, hard = false) => {
    const message = hard 
      ? 'Are you sure you want to PERMANENTLY DELETE this content? This cannot be undone!'
      : 'Are you sure you want to unpublish this content? It will remain in your drafts.'
    
    if (confirm(message)) {
      await deleteContent.mutateAsync({ slug, hard })
      setSelectedItems(prev => {
        const next = new Set(prev)
        next.delete(slug)
        return next
      })
    }
  }

  const handleSelectAll = () => {
    if (selectedItems.size === filteredAndSortedContent.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(filteredAndSortedContent.map(item => item.slug)))
    }
  }

  const handleBulkDelete = async () => {
    if (confirm(`Are you sure you want to delete ${selectedItems.size} items?`)) {
      await Promise.all(
        Array.from(selectedItems).map(slug => 
          deleteContent.mutateAsync({ slug, hard: false })
        )
      )
      setSelectedItems(new Set())
    }
  }

  const handleBulkPublish = async (publish: boolean) => {
    await Promise.all(
      Array.from(selectedItems).map(slug => {
        const item = content.find((c: ContentRow) => c.slug === slug)
        if (item && item.published !== publish) {
          return updateContent.mutateAsync({
            slug,
            data: { published: publish }
          })
        }
      })
    )
    setSelectedItems(new Set())
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-6 text-center text-red-600">
        <p>Failed to load content</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="all">All Types</option>
            <option value="blog">Blog Posts</option>
            <option value="project">Projects</option>
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.size > 0 && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-950">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedItems.size} item{selectedItems.size > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkPublish(true)}
              >
                Publish
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkPublish(false)}
              >
                Unpublish
              </Button>
              <Button
                size="sm"
                variant="default"
                onClick={handleBulkDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedItems(new Set())}
              >
                Clear
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Content Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="p-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === filteredAndSortedContent.length && filteredAndSortedContent.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th 
                  className="p-4 text-left cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center gap-1">
                    Title
                    {sortField === 'title' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th className="p-4 text-left">Type</th>
                <th className="p-4 text-left">Category</th>
                <th className="p-4 text-left">Status</th>
                <th 
                  className="p-4 text-left cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-1">
                    Date
                    {sortField === 'date' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedContent.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No content found
                  </td>
                </tr>
              ) : (
                filteredAndSortedContent.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.slug)}
                        onChange={(e) => {
                          const next = new Set(selectedItems)
                          if (e.target.checked) {
                            next.add(item.slug)
                          } else {
                            next.delete(item.slug)
                          }
                          setSelectedItems(next)
                        }}
                        className="rounded"
                      />
                    </td>
                    <td className="p-4">
                      <div>
                        <Link 
                          href={`/content/${item.slug}`} 
                          className="font-medium hover:underline"
                          target="_blank"
                        >
                          {item.title}
                        </Link>
                        <p className="text-sm text-gray-500 truncate max-w-md">
                          {item.excerpt}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline">
                        {item.type}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm">
                      {item.category}
                    </td>
                    <td className="p-4">
                      <Badge 
                        variant={item.published ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => handleTogglePublish(item)}
                      >
                        {item.published ? (
                          <>
                            <Eye className="h-3 w-3 mr-1" />
                            Published
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3 mr-1" />
                            Draft
                          </>
                        )}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/content/${item.slug}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/content/${item.slug}`} target="_blank">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/content/${item.slug}`)}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Copy URL
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(item.slug, false)}
                            className="text-orange-600"
                          >
                            <EyeOff className="h-4 w-4 mr-2" />
                            Unpublish
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(item.slug, true)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Permanently
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Summary */}
      <div className="text-sm text-gray-500 text-center">
        Showing {filteredAndSortedContent.length} of {content.length} items
      </div>
    </div>
  )
}