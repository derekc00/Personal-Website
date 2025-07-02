/**
 * Centralized constants for the application
 * This file consolidates hardcoded values to improve maintainability and consistency
 */

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_MESSAGES = {
  POST_NOT_FOUND: 'Post not found',
  VIDEO_NOT_FOUND: 'Video not found',
  NO_DESCRIPTION: 'No description available',
  FILENAME_REQUIRED: 'fileName parameter is required',
  FAILED_TO_FETCH_POSTS: 'Failed to fetch posts',
  UNAUTHORIZED: 'Authentication required',
  INVALID_REQUEST: 'Invalid request',
  INVALID_CREDENTIALS: 'Invalid credentials provided',
  CONTENT_NOT_FOUND: 'Content not found',
  OPTIMISTIC_LOCK_ERROR: 'Content was modified by another user',
  SLUG_ALREADY_EXISTS: 'A content item with this slug already exists',
  INTERNAL_SERVER_ERROR: 'An unexpected error occurred',
} as const;

export const FILE_EXTENSIONS = {
  MDX: '.mdx',
  MARKDOWN: '.md',
  JPG: '.jpg',
  PNG: '.png',
  SVG: '.svg',
} as const;

export const ASSET_PATHS = {
  FALLBACK_IMAGE: '/placeholder.svg',
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

export const UI_CONSTANTS = {
  SCROLL_THRESHOLD: 10,
  TRANSITION_DELAY: 100,
  BREAKPOINTS: {
    MOBILE: 768,
  },
  DIMENSIONS: {
    PROJECT_CARD_WIDTH: 600,
    PROJECT_CARD_HEIGHT: 300,
  },
} as const;

export const NAVIGATION_ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  PROJECTS: '/projects', 
  BLOG: '/blog',
  WORKSPACE: '/three',
} as const;