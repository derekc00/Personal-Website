import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Edit Content',
  description: 'Edit existing content',
}

export default async function EditContentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Content</h1>
      <p className="text-gray-600">Editing content: {slug}</p>
      <div className="mt-8 p-4 border border-gray-200 rounded">
        <p className="text-sm text-gray-500">Content editor will be implemented here</p>
      </div>
    </div>
  )
}