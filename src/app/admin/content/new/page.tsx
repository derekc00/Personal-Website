import { Metadata } from 'next'
import { ContentEditor } from '../../components/ContentEditor'

export const metadata: Metadata = {
  title: 'Create New Post',
  description: 'Create a new blog post',
}

export default function NewPost() {
  return <ContentEditor />
}