import type { ContentItem } from '@/lib/schemas'

export type ContentItemOptions = Partial<ContentItem>

export function createMockContentItem(options: ContentItemOptions = {}): ContentItem {
  return {
    id: 'test-post',
    slug: 'test-post',
    title: 'Test Post',
    excerpt: 'Test post excerpt',
    date: '2023-01-01',
    category: 'Tech',
    image: '/test-image.jpg',
    type: 'blog',
    tags: ['test'],
    content: '# Test Post\nTest content',
    ...options,
  }
}

export function createMockContentItems(count: number, options: ContentItemOptions = {}): ContentItem[] {
  return Array.from({ length: count }, (_, index) =>
    createMockContentItem({
      id: `test-post-${index + 1}`,
      slug: `test-post-${index + 1}`,
      title: `Test Post ${index + 1}`,
      date: `2023-01-${String(index + 1).padStart(2, '0')}`,
      ...options,
    })
  )
}

export type BlogCardProps = {
  title: string
  date: string
  image?: string
  tags: string[]
  slug: string
  onTagClick?: (tag: string) => void
}

export function createMockBlogCardProps(options: Partial<BlogCardProps> = {}): BlogCardProps {
  return {
    title: 'Test Blog Post',
    date: '2023-01-01',
    image: '/test-image.jpg',
    tags: ['test', 'blog'],
    slug: 'test-blog-post',
    ...options,
  }
}