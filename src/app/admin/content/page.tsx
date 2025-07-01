import { Metadata } from 'next'
import { ContentList } from '../components/ContentList'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Content Management',
  description: 'Manage blog posts and content',
}

export default function ContentManagement() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Content Management</h1>
          <p className="mt-2 text-muted-foreground">Create and manage your blog posts and projects</p>
        </div>
        <Button asChild>
          <Link href="/admin/content/new">
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>
      
      <ContentList />
    </div>
  )
}