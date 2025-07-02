'use client'

import { useContentStats } from '@/hooks/useContent'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  FileText, 
  FolderOpen, 
  PenTool, 
  Eye,
  Plus
} from 'lucide-react'

export function AdminDashboard() {
  const { data: stats, isLoading, error } = useContentStats()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-6 text-center text-red-600">
        <p>Failed to load dashboard statistics</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <Button asChild>
          <Link href="/admin/content/new">
            <Plus className="mr-2 h-4 w-4" />
            New Content
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Content</p>
              <p className="text-3xl font-bold">{stats?.total || 0}</p>
            </div>
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Published</p>
              <p className="text-3xl font-bold text-green-600">{stats?.published || 0}</p>
            </div>
            <Eye className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Drafts</p>
              <p className="text-3xl font-bold text-yellow-600">{stats?.drafts || 0}</p>
            </div>
            <PenTool className="h-8 w-8 text-yellow-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Projects</p>
              <p className="text-3xl font-bold text-blue-600">{stats?.byType.project || 0}</p>
            </div>
            <FolderOpen className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/admin/content/new">
                <Plus className="mr-2 h-4 w-4" />
                Create New Blog Post
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/admin/content">
                <FileText className="mr-2 h-4 w-4" />
                Manage All Content
              </Link>
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Content Breakdown</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Blog Posts</span>
              <span className="font-semibold">{stats?.byType.blog || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Projects</span>
              <span className="font-semibold">{stats?.byType.project || 0}</span>
            </div>
            <div className="h-px bg-border my-2" />
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total</span>
              <span className="font-bold">{stats?.total || 0}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}