import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BlogListClient from '../BlogListClient';
import { ContentItem } from '@/lib/schemas';

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
  }
];

describe('BlogListClient Component', () => {
  it('renders all blog posts initially', () => {
    render(<BlogListClient posts={mockPosts} />);
    
    expect(screen.getByText('Test Post 1')).toBeInTheDocument();
    expect(screen.getByText('Test Post 2')).toBeInTheDocument();
  });

  it('filters posts based on search input', async () => {
    render(<BlogListClient posts={mockPosts} />);
    
    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'coffee' } });
    
    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Post 2')).not.toBeInTheDocument();
    });
  });

  it('shows no results message when search has no matches', async () => {
    render(<BlogListClient posts={mockPosts} />);
    
    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    
    await waitFor(() => {
      expect(screen.getByText(/No articles found/i)).toBeInTheDocument();
    });
  });

  it('clears search and shows all posts', async () => {
    render(<BlogListClient posts={mockPosts} />);
    
    const searchInput = screen.getByRole('searchbox');
    
    // Filter first
    fireEvent.change(searchInput, { target: { value: 'coffee' } });
    await waitFor(() => {
      expect(screen.queryByText('Test Post 2')).not.toBeInTheDocument();
    });
    
    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      expect(screen.getByText('Test Post 2')).toBeInTheDocument();
    });
  });

  it('maintains search state during re-renders', () => {
    const { rerender } = render(<BlogListClient posts={mockPosts} />);
    
    const searchInput = screen.getByRole('searchbox') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'coffee' } });
    
    // Re-render component
    rerender(<BlogListClient posts={mockPosts} />);
    
    // Search value should persist
    expect(searchInput.value).toBe('coffee');
  });
});