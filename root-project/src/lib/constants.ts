/**
 * Centralized constants for the application
 * This file consolidates hardcoded values to improve maintainability and consistency
 */

export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_MESSAGES = {
  POST_NOT_FOUND: 'Post not found',
  VIDEO_NOT_FOUND: 'Video not found',
  NO_DESCRIPTION: 'No description available',
  FILENAME_REQUIRED: 'fileName parameter is required',
  FAILED_TO_FETCH_POSTS: 'Failed to fetch posts',
} as const;

export const FILE_EXTENSIONS = {
  MDX: '.mdx',
  MARKDOWN: '.md',
  JPG: '.jpg',
  PNG: '.png',
  SVG: '.svg',
} as const;

export const ASSET_PATHS = {
  FALLBACK_IMAGE: '/home.jpg',
  TEST_IMAGE: '/test-image.jpg',
} as const;

export const API_ENDPOINTS = {
  POSTS: '/api/posts',
  VIDEO: '/api/video',
} as const;

export const CONTENT_TYPES = {
  BLOG: 'blog',
  PROJECT: 'project',
} as const;

export const DEFAULT_VALUES = {
  CATEGORY: 'Uncategorized',
  CONTENT_TYPE: 'blog',
} as const;