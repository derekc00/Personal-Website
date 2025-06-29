import type { ContentItem } from '@/lib/schemas'
import { ASSET_PATHS, CONTENT_TYPES } from '@/lib/constants'

export type ContentItemOptions = Partial<ContentItem>

export function createMockContentItem(options: ContentItemOptions = {}): ContentItem {
  return {
    id: 'test-post',
    slug: 'test-post',
    title: 'Test Post',
    excerpt: 'Test post excerpt',
    date: '2023-01-01',
    category: 'Tech',
    image: ASSET_PATHS.TEST_IMAGE,
    type: CONTENT_TYPES.BLOG,
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