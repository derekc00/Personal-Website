import { Metadata } from 'next'
import { ContentEditor } from '../../components/ContentEditor'

export const metadata: Metadata = {
  title: 'Create New Content',
  description: 'Create new content',
}

export default function NewContentPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Create New Content</h1>
      <ContentEditor />
    </div>
  )
}