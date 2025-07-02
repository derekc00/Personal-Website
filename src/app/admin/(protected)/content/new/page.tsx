import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create New Content',
  description: 'Create new content',
}

export default function NewContentPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Create New Content</h1>
      <div className="mt-8 p-4 border border-gray-200 rounded">
        <p className="text-sm text-gray-500">Content creation form will be implemented here</p>
      </div>
    </div>
  )
}