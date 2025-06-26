import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Mock dependencies
jest.mock('fs');
jest.mock('gray-matter');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockMatter = matter as jest.Mocked<typeof matter>;

// Mock the posts module after mocking fs
jest.mock('../lib/posts', () => {
  const originalModule = jest.requireActual('../lib/posts');
  return {
    ...originalModule,
  };
});

// Import after mocking
import { getAllPosts, getPostBySlug } from '../lib/posts';
import { Post, PostMetadata } from '../utils/types';

// Factory functions for test data
function createMockPostMetadata(overrides: Partial<PostMetadata> = {}): PostMetadata {
  return {
    title: 'Test Post',
    date: '2025-01-01',
    tags: ['test', 'post'],
    image: 'test-image.jpg',
    ...overrides,
  };
}

function createMockPost(overrides: Partial<Post> = {}): Post {
  return {
    slug: 'test-post',
    metadata: createMockPostMetadata(),
    content: 'Test content',
    ...overrides,
  };
}

function createMockMatterResult(data: Partial<PostMetadata> = {}, content = 'Test content') {
  return {
    data: createMockPostMetadata(data),
    content,
  };
}

describe('Posts Library', () => {
  const mockPostsDirectory = path.join(process.cwd(), 'content/blog');
  
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getAllPosts()', () => {
    it('should return empty array when directory does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);
      
      const result = getAllPosts();
      
      expect(result).toEqual([]);
      expect(mockFs.existsSync).toHaveBeenCalledWith(mockPostsDirectory);
      expect(console.warn).toHaveBeenCalledWith('Content directory does not exist:', mockPostsDirectory);
    });

    it('should return empty array when readdir throws error', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });
      
      const result = getAllPosts();
      
      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith('Error getting posts:', expect.any(Error));
    });

    it('should filter and process MDX files correctly', () => {
      const mockFiles = ['post1.mdx', 'post2.md', 'post3.mdx', 'image.jpg'];
      const mockFileContent = 'mock content';
      const mockMatterResult = createMockMatterResult();

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(mockFiles as any);
      mockFs.readFileSync.mockReturnValue(mockFileContent);
      mockMatter.mockReturnValue(mockMatterResult as any);

      const result = getAllPosts();

      expect(result).toHaveLength(2); // Only 2 .mdx files
      expect(mockFs.readFileSync).toHaveBeenCalledTimes(2);
      expect(mockMatter).toHaveBeenCalledTimes(2);
      
      // Check first post structure
      expect(result[0]).toEqual(createMockPost({ slug: 'post1' }));
    });

    it('should handle missing metadata with defaults', () => {
      const mockFiles = ['incomplete.mdx'];
      const mockFileContent = 'mock content';
      const mockMatterResult = createMockMatterResult({}, 'Test content');
      mockMatterResult.data = {}; // No metadata

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(mockFiles as any);
      mockFs.readFileSync.mockReturnValue(mockFileContent);
      mockMatter.mockReturnValue(mockMatterResult as any);

      const result = getAllPosts();

      expect(result[0].metadata).toEqual(
        createMockPostMetadata({
          title: 'Untitled Post',
          date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/), // Current date format
          tags: [],
          image: undefined
        })
      );
    });

    it('should handle invalid tags by defaulting to empty array', () => {
      const mockFiles = ['invalid-tags.mdx'];
      const mockFileContent = 'mock content';
      const mockMatterResult = {
        data: {
          title: 'Test',
          date: '2025-01-01',
          tags: 'not-an-array' // Invalid tags
        },
        content: 'Test content'
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(mockFiles as any);
      mockFs.readFileSync.mockReturnValue(mockFileContent);
      mockMatter.mockReturnValue(mockMatterResult as any);

      const result = getAllPosts();

      expect(result[0].metadata.tags).toEqual([]);
    });

    it('should handle readFileSync errors gracefully', () => {
      const mockFiles = ['error.mdx'];
      
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(mockFiles as any);
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File read error');
      });

      const result = getAllPosts();

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith('Error getting posts:', expect.any(Error));
    });
  });

  describe('getPostBySlug()', () => {
    it('should return null when file does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);
      
      const result = getPostBySlug('nonexistent');
      
      expect(result).toBeNull();
      expect(mockFs.existsSync).toHaveBeenCalledWith(path.join(mockPostsDirectory, 'nonexistent.mdx'));
    });

    it('should return post when file exists and is valid', () => {
      const mockFileContent = 'mock content';
      const mockMatterResult = createMockMatterResult(
        {
          title: 'Test Post',
          date: '2025-01-01',
          tags: ['test'],
          image: 'image.jpg'
        },
        'Post content'
      );

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(mockFileContent);
      mockMatter.mockReturnValue(mockMatterResult as any);

      const result = getPostBySlug('test-post');

      expect(result).toEqual(
        createMockPost({
          slug: 'test-post',
          metadata: createMockPostMetadata({
            title: 'Test Post',
            date: '2025-01-01',
            tags: ['test'],
            image: 'image.jpg'
          }),
          content: 'Post content'
        })
      );
    });

    it('should handle missing metadata with defaults', () => {
      const mockFileContent = 'mock content';
      const mockMatterResult = {
        data: {
          title: undefined,
          date: undefined,
          tags: undefined
        },
        content: 'Post content'
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(mockFileContent);
      mockMatter.mockReturnValue(mockMatterResult as any);

      const result = getPostBySlug('test-post');

      expect(result?.metadata).toEqual({
        title: 'Untitled Post',
        date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        tags: [],
        image: undefined
      });
    });

    it('should return null and log error when readFileSync throws', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File read error');
      });

      const result = getPostBySlug('error-post');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Error getting post with slug "error-post":', expect.any(Error));
    });

    it('should return null and log error when matter parsing throws', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('content');
      mockMatter.mockImplementation(() => {
        throw new Error('Matter parsing error');
      });

      const result = getPostBySlug('malformed-post');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Error getting post with slug "malformed-post":', expect.any(Error));
    });

    it('should handle empty slug gracefully', () => {
      mockFs.existsSync.mockReturnValue(false);
      
      const result = getPostBySlug('');
      
      expect(result).toBeNull();
      expect(mockFs.existsSync).toHaveBeenCalledWith(path.join(mockPostsDirectory, '.mdx'));
    });

    it('should handle slug with special characters', () => {
      mockFs.existsSync.mockReturnValue(false);
      
      const result = getPostBySlug('post-with-special-chars!@#');
      
      expect(result).toBeNull();
      expect(mockFs.existsSync).toHaveBeenCalledWith(path.join(mockPostsDirectory, 'post-with-special-chars!@#.mdx'));
    });
  });

  describe('Real MDX Content Integration', () => {
    it('should handle real MDX sample content correctly', () => {
      const realMdxContent = `---
title: "Test"
description: "Wtest"
date: "2025-02-01"
tags: ["coffee", "tech", "humor"]
image: "https://picsum.photos/600/400"
published: true
comments_enabled: true
---

test`;

      const mockFiles = ['test.mdx'];
      
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(mockFiles as any);
      mockFs.readFileSync.mockReturnValue(realMdxContent);
      mockMatter.mockReturnValue({
        data: {
          title: "Test",
          description: "Wtest",
          date: "2025-02-01",
          tags: ["coffee", "tech", "humor"],
          image: "https://picsum.photos/600/400",
          published: true,
          comments_enabled: true
        },
        content: 'test'
      } as any);

      const result = getAllPosts();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        createMockPost({
          slug: 'test',
          metadata: createMockPostMetadata({
            title: "Test",
            date: "2025-02-01",
            tags: ["coffee", "tech", "humor"],
            image: "https://picsum.photos/600/400"
          }),
          content: 'test'
        })
      );
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty directory gracefully', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue([]);

      const result = getAllPosts();

      expect(result).toEqual([]);
      expect(mockFs.readdirSync).toHaveBeenCalledWith(mockPostsDirectory);
    });

    it('should handle directory with no MDX files', () => {
      const mockFiles = ['readme.txt', 'image.jpg', 'data.json'];
      
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(mockFiles as any);

      const result = getAllPosts();

      expect(result).toEqual([]);
      expect(mockFs.readFileSync).not.toHaveBeenCalled();
    });

    it('should handle malformed frontmatter gracefully', () => {
      const mockFiles = ['malformed.mdx'];
      
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(mockFiles as any);
      mockFs.readFileSync.mockReturnValue('content');
      mockMatter.mockImplementation(() => {
        throw new Error('Invalid frontmatter');
      });

      const result = getAllPosts();

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith('Error getting posts:', expect.any(Error));
    });
  });
});