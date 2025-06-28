import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getMdxBySlug, getAllMdxFiles } from '../mdx'
import fs from 'fs/promises'
import path from 'path'

// Mock fs/promises and path modules
vi.mock('fs/promises')
vi.mock('path')

const mockFs = vi.mocked(fs)
const mockPath = vi.mocked(path)

describe('MDX Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPath.join.mockImplementation((...args) => args.join('/'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('getMdxBySlug', () => {
    it('should return frontmatter and content for valid MDX file', async () => {
      const mockContent = `---
title: "Test Post"
date: "2023-01-01"
description: "Test description"
category: "Tech"
---
# Test Content`

      mockFs.readFile.mockResolvedValue(mockContent)

      const result = await getMdxBySlug('test-post')

      expect(mockPath.join).toHaveBeenCalledWith(
        process.cwd(),
        'content',
        'blog',
        'test-post.mdx'
      )
      expect(mockFs.readFile).toHaveBeenCalledWith(
        expect.stringContaining('content/blog/test-post.mdx'),
        'utf8'
      )
      expect(result).toEqual({
        frontmatter: {
          title: 'Test Post',
          date: '2023-01-01',
          description: 'Test description',
          category: 'Tech',
          tags: [],
          type: 'blog'
        },
        content: '# Test Content'
      })
    })

    it('should return null when file not found', async () => {
      mockFs.readFile.mockRejectedValue(new Error('ENOENT: no such file or directory'))

      const result = await getMdxBySlug('non-existent')

      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalledWith(
        'Error getting MDX file',
        'non-existent',
        expect.any(Error)
      )
    })

    it('should return null when file has invalid frontmatter', async () => {
      const mockContent = `---
title: 123
date: "invalid-date"
---
# Content`

      mockFs.readFile.mockResolvedValue(mockContent)

      const result = await getMdxBySlug('invalid-frontmatter')

      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalledWith(
        'Error getting MDX file',
        'invalid-frontmatter',
        expect.any(Error)
      )
    })

    it('should use custom directory when provided', async () => {
      const mockContent = `---
title: "Project Post"
date: "2023-01-01"
category: "Projects"
---
# Project Content`

      mockFs.readFile.mockResolvedValue(mockContent)

      await getMdxBySlug('project-slug', 'projects')

      expect(mockPath.join).toHaveBeenCalledWith(
        process.cwd(),
        'content',
        'projects',
        'project-slug.mdx'
      )
    })
  })

  describe('getAllMdxFiles', () => {
    it('should return all MDX files sorted by date descending', async () => {
      const mockFiles = ['post1.mdx', 'post2.mdx', 'not-mdx.txt']
      
      mockFs.readdir.mockResolvedValue(mockFiles as string[])
      mockFs.readFile.mockImplementation((filePath) => {
        if (filePath.toString().includes('post1.mdx')) {
          return Promise.resolve(`---
title: "First Post"
date: "2023-01-01"
category: "Tech"
---
# First Post`)
        }
        if (filePath.toString().includes('post2.mdx')) {
          return Promise.resolve(`---
title: "Second Post"
date: "2023-01-02"
category: "Tech"
---
# Second Post`)
        }
        return Promise.reject(new Error('File not found'))
      })

      const result = await getAllMdxFiles()

      expect(mockPath.join).toHaveBeenCalledWith(process.cwd(), 'content', 'blog')
      expect(mockFs.readdir).toHaveBeenCalledWith(expect.stringContaining('content/blog'))
      expect(result).toHaveLength(2)
      expect(result[0].title).toBe('Second Post')
      expect(result[1].title).toBe('First Post')
      expect(result[0].slug).toBe('post2')
      expect(result[1].slug).toBe('post1')
    })

    it('should return empty array when directory read fails', async () => {
      mockFs.readdir.mockRejectedValue(new Error('Directory not found'))

      const result = await getAllMdxFiles()

      expect(result).toEqual([])
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error getting all MDX files')
      )
    })

    it('should filter out null results from failed file reads', async () => {
      vi.clearAllMocks()
      mockPath.join.mockImplementation((...args) => args.join('/'))
      vi.spyOn(console, 'error').mockImplementation(() => {})

      const mockFiles = ['valid.mdx', 'invalid-frontmatter.mdx']
      
      mockFs.readdir.mockResolvedValue(mockFiles as string[])
      mockFs.readFile.mockImplementation((filePath) => {
        const path = filePath.toString()
        if (path.endsWith('valid.mdx')) {
          return Promise.resolve(`---
title: "Valid Post"
date: "2023-01-01"
category: "Tech"
---
# Valid Content`)
        }
        if (path.endsWith('invalid-frontmatter.mdx')) {
          return Promise.resolve(`---
title: 123
date: "invalid-date"
---
# Invalid Content`)
        }
        return Promise.reject(new Error('File not found'))
      })

      const result = await getAllMdxFiles()

      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Valid Post')
      expect(result[0].slug).toBe('valid')
    })

    it('should use custom directory when provided', async () => {
      mockFs.readdir.mockResolvedValue([] as string[])

      await getAllMdxFiles('projects')

      expect(mockPath.join).toHaveBeenCalledWith(process.cwd(), 'content', 'projects')
      expect(mockFs.readdir).toHaveBeenCalledWith(expect.stringContaining('content/projects'))
    })
  })
})