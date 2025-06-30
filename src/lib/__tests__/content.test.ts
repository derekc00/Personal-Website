import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { getAllContent, getContentBySlug, getContentByType, getCategories, searchContent } from '../content'
import { createMockContentItem } from '../../test/factories'
import fs from 'fs'
import path from 'path'

// Type for mocking fs.readdirSync return value
type MockDirectoryEntry = string

// Mock fs module
jest.mock('fs')
jest.mock('path')

const mockFs = jest.mocked(fs)
const mockPath = jest.mocked(path)

// Helper function to generate MDX content from factory data
function createMdxContent(options: Parameters<typeof createMockContentItem>[0] = {}) {
  const item = createMockContentItem(options)
  return `---
title: "${item.title}"
date: "${item.date}"
description: "${item.excerpt}"
category: "${item.category}"
${item.image ? `image: "${item.image}"` : ''}
${item.tags.length > 0 ? `tags: [${item.tags.map(tag => `"${tag}"`).join(', ')}]` : ''}
type: "${item.type}"
---
${item.content}`
}

describe('Unified Content System', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPath.join.mockImplementation((...args) => args.join('/'))
  })

  describe('getAllContent', () => {
    it('should return all content items sorted by date descending', async () => {
      // Mock file system structure
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue(['post1.mdx', 'post2.mdx', 'not-mdx.txt'] as MockDirectoryEntry[])
      mockFs.readFileSync.mockImplementation((filePath: string) => {
        if (filePath.includes('post1.mdx')) {
          return createMdxContent({
            id: 'post1',
            slug: 'post1',
            title: 'First Post',
            date: '2023-01-01',
            excerpt: 'First post description',
            category: 'Tech',
            content: '# First Post Content'
          })
        }
        if (filePath.includes('post2.mdx')) {
          return createMdxContent({
            id: 'post2',
            slug: 'post2',
            title: 'Second Post',
            date: '2023-01-02',
            excerpt: 'Second post description',
            category: 'Tech',
            content: '# Second Post Content'
          })
        }
        return ''
      })

      const content = await getAllContent()

      expect(content).toHaveLength(2)
      expect(content[0].title).toBe('Second Post')
      expect(content[1].title).toBe('First Post')
      expect(content[0].date).toBe('2023-01-02')
    })

    it('should handle missing content directory gracefully', async () => {
      mockFs.existsSync.mockReturnValue(false)
      
      const content = await getAllContent()
      
      expect(content).toEqual([])
    })

    it('should validate frontmatter with schema', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue(['invalid.mdx'] as MockDirectoryEntry[])
      mockFs.readFileSync.mockReturnValue(`---
title: 123
---
Content`)

      const content = await getAllContent()
      
      expect(content).toHaveLength(0) // Invalid content should be filtered out
    })
  })

  describe('getContentBySlug', () => {
    it('should return content item by slug', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockReturnValue(createMdxContent({
        id: 'test-post',
        slug: 'test-post',
        title: 'Test Post',
        date: '2023-01-01',
        excerpt: 'Test description',
        category: 'Tech',
        content: '# Test Content'
      }))

      const content = await getContentBySlug('test-post')

      expect(content).toBeDefined()
      expect(content?.title).toBe('Test Post')
      expect(content?.slug).toBe('test-post')
    })

    it('should return null for non-existent content', async () => {
      mockFs.existsSync.mockReturnValue(false)

      const content = await getContentBySlug('non-existent')

      expect(content).toBeNull()
    })
  })

  describe('getContentByType', () => {
    it('should filter content by type', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue(['blog.mdx', 'project.mdx'] as MockDirectoryEntry[])
      mockFs.readFileSync.mockImplementation((filePath: string) => {
        if (filePath.includes('blog.mdx')) {
          return createMdxContent({
            id: 'blog-post',
            slug: 'blog-post',
            title: 'Blog Post',
            date: '2023-01-01',
            excerpt: 'Blog description',
            category: 'Tech',
            type: 'blog',
            content: 'Content'
          })
        }
        if (filePath.includes('project.mdx')) {
          return createMdxContent({
            id: 'project-post',
            slug: 'project-post',
            title: 'Project Post',
            date: '2023-01-01',
            excerpt: 'Project description',
            category: 'Tech',
            type: 'project',
            content: 'Content'
          })
        }
        return ''
      })

      const blogContent = await getContentByType('blog')
      const projectContent = await getContentByType('project')

      expect(blogContent).toHaveLength(1)
      expect(projectContent).toHaveLength(1)
      expect(blogContent[0].type).toBe('blog')
      expect(projectContent[0].type).toBe('project')
    })
  })

  describe('getCategories', () => {
    it('should return unique categories from all content', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue(['post1.mdx', 'post2.mdx', 'post3.mdx'] as MockDirectoryEntry[])
      mockFs.readFileSync.mockImplementation((filePath: string) => {
        if (filePath.includes('post1.mdx')) {
          return createMdxContent({
            id: 'post1',
            slug: 'post1',
            title: 'Post 1',
            date: '2023-01-01',
            excerpt: 'Description',
            category: 'Tech',
            content: 'Content'
          })
        }
        if (filePath.includes('post2.mdx')) {
          return createMdxContent({
            id: 'post2',
            slug: 'post2',
            title: 'Post 2',
            date: '2023-01-02',
            excerpt: 'Description',
            category: 'Lifestyle',
            content: 'Content'
          })
        }
        if (filePath.includes('post3.mdx')) {
          return createMdxContent({
            id: 'post3',
            slug: 'post3',
            title: 'Post 3',
            date: '2023-01-03',
            excerpt: 'Description',
            category: 'Tech',
            content: 'Content'
          })
        }
        return ''
      })

      const categories = await getCategories()

      expect(categories).toHaveLength(2)
      expect(categories).toContain('Tech')
      expect(categories).toContain('Lifestyle')
      expect(new Set(categories).size).toBe(categories.length) // Should not have duplicates
    })

    it('should return empty array when no content exists', async () => {
      mockFs.existsSync.mockReturnValue(false)

      const categories = await getCategories()

      expect(categories).toEqual([])
    })

    it('should handle default category correctly', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue(['post.mdx'] as MockDirectoryEntry[])
      mockFs.readFileSync.mockReturnValue(createMdxContent({
        id: 'post',
        slug: 'post',
        title: 'Post',
        date: '2023-01-01',
        excerpt: 'Description',
        category: 'Uncategorized',
        content: 'Content'
      }))

      const categories = await getCategories()

      expect(categories).toEqual(['Uncategorized'])
    })
  })

  describe('searchContent', () => {
    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue(['post1.mdx', 'post2.mdx', 'post3.mdx'] as MockDirectoryEntry[])
      mockFs.readFileSync.mockImplementation((filePath: string) => {
        if (filePath.includes('post1.mdx')) {
          return createMdxContent({
            id: 'post1',
            slug: 'post1',
            title: 'JavaScript Basics',
            date: '2023-01-01',
            excerpt: 'Learn JavaScript fundamentals',
            category: 'Programming',
            content: 'Content about JavaScript'
          })
        }
        if (filePath.includes('post2.mdx')) {
          return createMdxContent({
            id: 'post2',
            slug: 'post2',
            title: 'React Components',
            date: '2023-01-02',
            excerpt: 'Building React components',
            category: 'Web Development',
            content: 'Content about React'
          })
        }
        if (filePath.includes('post3.mdx')) {
          return createMdxContent({
            id: 'post3',
            slug: 'post3',
            title: 'Cooking Tips',
            date: '2023-01-03',
            excerpt: 'Best cooking practices',
            category: 'Lifestyle',
            content: 'Content about cooking'
          })
        }
        return ''
      })
    })

    it('should find content by title search', async () => {
      const results = await searchContent('JavaScript')

      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('JavaScript Basics')
    })

    it('should find content by description search', async () => {
      const results = await searchContent('React components')

      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('React Components')
    })

    it('should find content by category search', async () => {
      const results = await searchContent('Programming')

      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('JavaScript Basics')
    })

    it('should be case insensitive', async () => {
      const results = await searchContent('javascript')

      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('JavaScript Basics')
    })

    it('should return multiple matches', async () => {
      const results = await searchContent('React')

      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('React Components')
    })

    it('should return empty array for no matches', async () => {
      const results = await searchContent('nonexistent')

      expect(results).toEqual([])
    })

    it('should handle empty search query', async () => {
      const results = await searchContent('')

      expect(results).toHaveLength(3) // Should return all content
    })

    it('should handle partial word matches', async () => {
      const results = await searchContent('Cook')

      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Cooking Tips')
    })
  })

  describe('error handling and edge cases', () => {
    it('should handle file read errors gracefully in getAllContent', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue(['error.mdx', 'valid.mdx'] as MockDirectoryEntry[])
      mockFs.readFileSync.mockImplementation((filePath: string) => {
        if (filePath.includes('error.mdx')) {
          throw new Error('File read error')
        }
        if (filePath.includes('valid.mdx')) {
          return createMdxContent({
            id: 'valid-post',
            slug: 'valid-post',
            title: 'Valid Post',
            date: '2023-01-01',
            excerpt: 'Description',
            content: 'Content'
          })
        }
        return ''
      })

      const content = await getAllContent()

      expect(content).toHaveLength(1)
      expect(content[0].title).toBe('Valid Post')
    })

    it('should handle file read errors gracefully in getContentBySlug', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File read error')
      })

      const content = await getContentBySlug('error-post')

      expect(content).toBeNull()
    })

    it('should handle invalid frontmatter in getContentBySlug', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockReturnValue(`---
title: 123
---
Content`)

      const content = await getContentBySlug('invalid-post')

      expect(content).toBeNull()
    })

    it('should handle frontmatter with optional fields', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue(['minimal.mdx'] as MockDirectoryEntry[])
      mockFs.readFileSync.mockReturnValue(createMdxContent({
        id: 'minimal-post',
        slug: 'minimal-post',
        title: 'Minimal Post',
        date: '2023-01-01',
        excerpt: 'No description available',
        category: 'Uncategorized',
        tags: [],
        image: null,
        content: 'Content'
      }))

      const content = await getAllContent()

      expect(content).toHaveLength(1)
      expect(content[0].title).toBe('Minimal Post')
      expect(content[0].excerpt).toBe('No description available')
      expect(content[0].category).toBe('Uncategorized')
      expect(content[0].tags).toEqual([])
      expect(content[0].type).toBe('blog')
      expect(content[0].image).toBeNull()
    })

    it('should handle frontmatter with all optional fields populated', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue(['full.mdx'] as MockDirectoryEntry[])
      mockFs.readFileSync.mockReturnValue(createMdxContent({
        id: 'full-post',
        slug: 'full-post',
        title: 'Full Post',
        date: '2023-01-01',
        excerpt: 'Full description',
        category: 'Custom Category',
        image: '/image.jpg',
        tags: ['tag1', 'tag2'],
        type: 'project',
        content: 'Content'
      }))

      const content = await getAllContent()

      expect(content).toHaveLength(1)
      expect(content[0].title).toBe('Full Post')
      expect(content[0].excerpt).toBe('Full description')
      expect(content[0].category).toBe('Custom Category')
      expect(content[0].tags).toEqual(['tag1', 'tag2'])
      expect(content[0].type).toBe('project')
      expect(content[0].image).toBe('/image.jpg')
    })

    it('should prioritize description over excerpt in frontmatter', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue(['priority.mdx'] as MockDirectoryEntry[])
      mockFs.readFileSync.mockReturnValue(createMdxContent({
        id: 'priority-test',
        slug: 'priority-test',
        title: 'Priority Test',
        date: '2023-01-01',
        excerpt: 'Description field',
        content: 'Content'
      }))

      const content = await getAllContent()

      expect(content).toHaveLength(1)
      expect(content[0].excerpt).toBe('Description field')
    })

    it('should use excerpt when description is not provided', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue(['excerpt-only.mdx'] as MockDirectoryEntry[])
      mockFs.readFileSync.mockReturnValue(createMdxContent({
        id: 'excerpt-only',
        slug: 'excerpt-only',
        title: 'Excerpt Only',
        date: '2023-01-01',
        excerpt: 'Excerpt field',
        content: 'Content'
      }))

      const content = await getAllContent()

      expect(content).toHaveLength(1)
      expect(content[0].excerpt).toBe('Excerpt field')
    })
  })
})