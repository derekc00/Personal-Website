import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContentPageClient from '../ContentPageClient';
import { ContentItem } from '@/lib/content';

const mockContent: ContentItem[] = [
  {
    id: '1',
    slug: 'tech-post-1',
    title: 'Tech Post 1',
    excerpt: 'About JavaScript and debugging',
    date: '2025-01-01',
    image: '/test1.jpg',
    content: 'Test content',
    type: 'blog',
    category: 'Tech',
    tags: ['javascript', 'debugging'],
    published: true
  },
  {
    id: '2',
    slug: 'life-post-1',
    title: 'Life Post 1', 
    excerpt: 'About coffee and productivity',
    date: '2025-01-02',
    image: '/test2.jpg',
    content: 'Test content',
    type: 'blog',
    category: 'Life',
    tags: ['coffee', 'productivity'],
    published: true
  },
  {
    id: '3',
    slug: 'tech-post-2',
    title: 'Tech Post 2',
    excerpt: 'About React and testing',
    date: '2025-01-03',
    image: '/test3.jpg',
    content: 'Test content',
    type: 'project',
    category: 'Tech',
    tags: ['react', 'testing'],
    published: true
  }
];

const mockCategories = ['Tech', 'Life', 'Science'];

describe('ContentPageClient Component', () => {
  it('renders page title and description', () => {
    render(<ContentPageClient initialContent={mockContent} categories={mockCategories} />);
    
    expect(screen.getByText('Projects & Blog Posts')).toBeInTheDocument();
    expect(screen.getByText(/Exploring technology, design, and development/)).toBeInTheDocument();
  });

  it('renders all content items initially', () => {
    render(<ContentPageClient initialContent={mockContent} categories={mockCategories} />);
    
    expect(screen.getByText('Tech Post 1')).toBeInTheDocument();
    expect(screen.getByText('Life Post 1')).toBeInTheDocument();
    expect(screen.getByText('Tech Post 2')).toBeInTheDocument();
  });

  it('filters content based on search query', async () => {
    render(<ContentPageClient initialContent={mockContent} categories={mockCategories} />);
    
    const searchInput = screen.getByPlaceholderText('Search content...');
    fireEvent.change(searchInput, { target: { value: 'coffee' } });
    
    await waitFor(() => {
      expect(screen.getByText('Life Post 1')).toBeInTheDocument();
      expect(screen.queryByText('Tech Post 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Tech Post 2')).not.toBeInTheDocument();
    });
  });

  it('filters content by category', async () => {
    render(<ContentPageClient initialContent={mockContent} categories={mockCategories} />);
    
    const techButton = screen.getByRole('button', { name: 'Tech' });
    fireEvent.click(techButton);
    
    await waitFor(() => {
      expect(screen.getByText('Tech Post 1')).toBeInTheDocument();
      expect(screen.getByText('Tech Post 2')).toBeInTheDocument();
      expect(screen.queryByText('Life Post 1')).not.toBeInTheDocument();
    });
  });

  it('resets filter when All button is clicked', async () => {
    render(<ContentPageClient initialContent={mockContent} categories={mockCategories} />);
    
    // First filter by category
    const techButton = screen.getByRole('button', { name: 'Tech' });
    fireEvent.click(techButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Life Post 1')).not.toBeInTheDocument();
    });
    
    // Then click All to reset
    const allButton = screen.getByRole('button', { name: 'All' });
    fireEvent.click(allButton);
    
    await waitFor(() => {
      expect(screen.getByText('Tech Post 1')).toBeInTheDocument();
      expect(screen.getByText('Life Post 1')).toBeInTheDocument();
      expect(screen.getByText('Tech Post 2')).toBeInTheDocument();
    });
  });

  it('does not show load more button when all content is visible', () => {
    render(<ContentPageClient initialContent={mockContent} categories={mockCategories} />);
    
    expect(screen.queryByText('Load More')).not.toBeInTheDocument();
  });

  it('shows and handles load more button for large content lists', async () => {
    // Create 12 items to trigger pagination
    const manyItems = Array.from({ length: 12 }, (_, i) => ({
      ...mockContent[0],
      id: `${i}`,
      slug: `post-${i}`,
      title: `Post ${i}`,
    }));
    
    render(<ContentPageClient initialContent={manyItems} categories={mockCategories} />);
    
    // Should show first 9 items
    expect(screen.getByText('Post 0')).toBeInTheDocument();
    expect(screen.getByText('Post 8')).toBeInTheDocument();
    expect(screen.queryByText('Post 9')).not.toBeInTheDocument();
    
    // Should show Load More button
    const loadMoreButton = screen.getByText('Load More');
    expect(loadMoreButton).toBeInTheDocument();
    
    // Click Load More
    fireEvent.click(loadMoreButton);
    
    await waitFor(() => {
      expect(screen.getByText('Post 9')).toBeInTheDocument();
      expect(screen.getByText('Post 11')).toBeInTheDocument();
    });
    
    // Load More should be hidden now
    expect(screen.queryByText('Load More')).not.toBeInTheDocument();
  });

  it('resets visible count when filtering', async () => {
    // Create 12 Tech items and 3 Life items
    const manyItems = [
      ...Array.from({ length: 12 }, (_, i) => ({
        ...mockContent[0],
        id: `tech-${i}`,
        slug: `tech-post-${i}`,
        title: `Tech Post ${i}`,
        category: 'Tech',
      })),
      ...Array.from({ length: 3 }, (_, i) => ({
        ...mockContent[1],
        id: `life-${i}`,
        slug: `life-post-${i}`,
        title: `Life Post ${i}`,
        category: 'Life',
      }))
    ];
    
    render(<ContentPageClient initialContent={manyItems} categories={mockCategories} />);
    
    // Load more to show all Tech posts
    const loadMoreButton = screen.getByText('Load More');
    fireEvent.click(loadMoreButton);
    
    await waitFor(() => {
      expect(screen.getByText('Tech Post 10')).toBeInTheDocument();
    });
    
    // Filter by Life category
    const lifeButton = screen.getByRole('button', { name: 'Life' });
    fireEvent.click(lifeButton);
    
    await waitFor(() => {
      // Should show all 3 Life posts without Load More
      expect(screen.getByText('Life Post 0')).toBeInTheDocument();
      expect(screen.getByText('Life Post 2')).toBeInTheDocument();
      expect(screen.queryByText('Load More')).not.toBeInTheDocument();
      // Tech posts should be hidden
      expect(screen.queryByText('Tech Post 0')).not.toBeInTheDocument();
    });
  });
});