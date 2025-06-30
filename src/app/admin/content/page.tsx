import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Content Management',
  description: 'Manage blog posts and content',
}

export default function ContentManagement() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
          <p className="mt-2 text-gray-600">Create and manage your blog posts</p>
        </div>
        <a 
          href="/admin/content/new" 
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          New Post
        </a>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Posts</h2>
        </div>
        <div className="p-6">
          <div className="text-center text-gray-500">
            <p className="mb-4">Content management will be available after authentication is implemented.</p>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-gray-200 h-16 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}