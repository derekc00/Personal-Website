import { Metadata } from 'next'
import { ContentEditor } from '../../../components/ContentEditor'

export const metadata: Metadata = {
  title: 'Edit Content',
  description: 'Edit existing content',
}

export default async function EditContentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Content</h1>
      <ContentEditor slug={slug} />
    </div>
  )
}