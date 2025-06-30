import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create New Post',
  description: 'Create a new blog post',
}

export default function NewPost() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Post</h1>
        <p className="mt-2 text-gray-600">Write and publish a new blog post</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">
          <p className="mb-6">Content creation form will be available after authentication is implemented.</p>
          
          <div className="space-y-6 text-left">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <div className="animate-pulse bg-gray-200 h-10 rounded"></div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
              <div className="animate-pulse bg-gray-200 h-10 rounded"></div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <div className="animate-pulse bg-gray-200 h-64 rounded"></div>
            </div>
            
            <div className="flex justify-between">
              <div className="animate-pulse bg-gray-200 h-10 w-24 rounded"></div>
              <div className="animate-pulse bg-gray-200 h-10 w-32 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}