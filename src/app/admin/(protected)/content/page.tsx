import { Metadata } from 'next'
import Link from 'next/link'
import { ContentList } from '../components/ContentList'

export const metadata: Metadata = {
  title: 'Content Management',
  description: 'Manage blog posts and content',
}

export default function ContentManagementPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Content Management</h1>
          <p className="text-gray-600 mt-1">Create and manage your blog posts and projects</p>
        </div>
        <Link 
          href="/admin/content/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          New Content
        </Link>
      </div>
      
      <ContentList />
    </div>
  )
}