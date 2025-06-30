import React from 'react';
import { render, screen } from '@testing-library/react';
import BlogListClient from '../BlogListClient';
import { ContentItem } from '@/lib/schemas';

// Mock Next.js navigation
const mockSearchParams = new URLSearchParams();
jest.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams
}));

const mockPosts: ContentItem[] = [
  {
    slug: 'test-post-1',
    title: 'Test Post 1',
    excerpt: 'This is a test post about coffee',
    date: '2025-01-01',
    image: '/test.jpg',
    content: 'Test content',
    type: 'blog',
    category: 'Tech',
    tags: ['javascript', 'testing'],
    published: true
  },
  {
    slug: 'test-post-2', 
    title: 'Test Post 2',
    excerpt: 'This is another test post',
    date: '2025-01-02',
    image: '/test2.jpg',
    content: 'More test content',
    type: 'blog',
    category: 'Life',
    tags: ['productivity'],
    published: true
  },
  {
    slug: 'test-post-3',
    title: 'Test Post 3',
    excerpt: 'A post with multiple tags',
    date: '2025-01-03',
    image: '/test3.jpg',
    content: 'Test content',
    type: 'blog',
    category: 'Tech',
    tags: ['javascript', 'react', 'testing'],
    published: true
  }
];

describe('BlogListClient Component', () => {
  beforeEach(() => {
    // Clear search params before each test
    mockSearchParams.forEach((_, key) => mockSearchParams.delete(key));
  });

  it('renders all blog posts when no tags are selected', () => {
    render(<BlogListClient posts={mockPosts} />);
    
    expect(screen.getByText('Test Post 1')).toBeInTheDocument();
    expect(screen.getByText('Test Post 2')).toBeInTheDocument();
    expect(screen.getByText('Test Post 3')).toBeInTheDocument();
  });

  it('filters posts by single tag', () => {
    mockSearchParams.set('tags', 'productivity');
    render(<BlogListClient posts={mockPosts} />);
    
    expect(screen.queryByText('Test Post 1')).not.toBeInTheDocument();
    expect(screen.getByText('Test Post 2')).toBeInTheDocument();
    expect(screen.queryByText('Test Post 3')).not.toBeInTheDocument();
  });

  it('filters posts by multiple tags', () => {
    mockSearchParams.set('tags', 'javascript,react');
    render(<BlogListClient posts={mockPosts} />);
    
    // Posts with either javascript OR react tag should show
    expect(screen.getByText('Test Post 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Post 2')).not.toBeInTheDocument();
    expect(screen.getByText('Test Post 3')).toBeInTheDocument();
  });

  it('shows no posts message when filtered results are empty', () => {
    mockSearchParams.set('tags', 'nonexistent');
    render(<BlogListClient posts={mockPosts} />);
    
    expect(screen.getByText('No posts found')).toBeInTheDocument();
    expect(screen.getByText(/No posts found with the selected tags/)).toBeInTheDocument();
  });

  it('shows no posts message when posts array is empty', () => {
    render(<BlogListClient posts={[]} />);
    
    expect(screen.getByText('No posts found')).toBeInTheDocument();
    expect(screen.getByText('No blog posts available at the moment.')).toBeInTheDocument();
  });

  it('handles empty tag values in query params', () => {
    mockSearchParams.set('tags', 'javascript,,testing');
    render(<BlogListClient posts={mockPosts} />);
    
    // Should filter out empty strings and show posts with javascript OR testing
    expect(screen.getByText('Test Post 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Post 2')).not.toBeInTheDocument();
    expect(screen.getByText('Test Post 3')).toBeInTheDocument();
  });
});