import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getAllContent, getContentBySlug, getContentByType } from '../content'
import fs from 'fs'
import path from 'path'

// Mock fs module
vi.mock('fs')
vi.mock('path')

const mockFs = vi.mocked(fs)
const mockPath = vi.mocked(path)

describe('Unified Content System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPath.join.mockImplementation((...args) => args.join('/'))
  })

  describe('getAllContent', () => {
    it('should return all content items sorted by date descending', async () => {
      // Mock file system structure
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue(['post1.mdx', 'post2.mdx', 'not-mdx.txt'])
      mockFs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('post1.mdx')) {
          return `---
title: "First Post"
date: "2023-01-01"
description: "First post description"
category: "Tech"
---
# First Post Content`
        }
        if (filePath.includes('post2.mdx')) {
          return `---
title: "Second Post"
date: "2023-01-02"
description: "Second post description"
category: "Tech"
---
# Second Post Content`
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
      mockFs.readdirSync.mockReturnValue(['invalid.mdx'])
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
      mockFs.readFileSync.mockReturnValue(`---
title: "Test Post"
date: "2023-01-01"
description: "Test description"
category: "Tech"
---
# Test Content`)

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
      mockFs.readdirSync.mockReturnValue(['blog.mdx', 'project.mdx'])
      mockFs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('blog.mdx')) {
          return `---
title: "Blog Post"
date: "2023-01-01"
description: "Blog description"
category: "Tech"
type: "blog"
---
Content`
        }
        if (filePath.includes('project.mdx')) {
          return `---
title: "Project Post"
date: "2023-01-01"
description: "Project description"
category: "Tech"
type: "project"
---
Content`
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
})