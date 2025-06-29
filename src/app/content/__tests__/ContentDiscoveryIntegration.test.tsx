import { describe, it, expect, jest } from '@jest/globals'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import ContentPageClient from '../ContentPageClient'
import { createMockContentItems } from '@/test/factories'

// Mock the BlogCard component to make integration testing more focused
jest.mock('@/components/BlogCard', () => ({
  default: jest.fn(({ post }) => (
    <div data-testid={`blog-card-${post.id}`} data-category={post.category} data-type={post.type}>
      <h3>{post.title}</h3>
      <p>{post.excerpt}</p>
      <span data-testid="category">{post.category}</span>
      <span data-testid="type">{post.type}</span>
    </div>
  ))
}))

// Mock UI components to avoid styling dependencies in integration tests
jest.mock('@/components/ui/button', () => {
  const Button = React.forwardRef(({ children, onClick, className, ...props }, ref) => (
    <button ref={ref} onClick={onClick} className={className} {...props}>
      {children}
    </button>
  ))
  Button.displayName = 'Button'
  return { Button }
})

jest.mock('@/components/ui/input', () => {
  const Input = React.forwardRef((props, ref) => <input ref={ref} {...props} />)
  Input.displayName = 'Input'
  return { Input }
})

jest.mock('lucide-react', () => ({
  Search: () => <svg data-testid="search-icon" />
}))

describe('Content Discovery Integration', () => {
  const mockContentItems = [
    ...createMockContentItems(3, { 
      type: 'blog', 
      category: 'Technology',
      title: 'Tech Blog Post',
      excerpt: 'This is a technology blog post about web development'
    }),
    ...createMockContentItems(2, { 
      type: 'project', 
      category: 'Design',
      title: 'Design Project',
      excerpt: 'This is a design project showcasing UI patterns',
      id: 'design-project',
      slug: 'design-project'
    }),
    ...createMockContentItems(4, { 
      type: 'blog', 
      category: 'Personal',
      title: 'Personal Blog',
      excerpt: 'Personal thoughts and experiences in development',
      id: 'personal-blog',
      slug: 'personal-blog'
    })
  ]

  const mockCategories = ['Technology', 'Design', 'Personal']

  describe('Search Functionality Integration', () => {
    it('should filter content by search query across title, excerpt, and category', async () => {
      const user = userEvent.setup()
      render(
        <ContentPageClient 
          initialContent={mockContentItems} 
          categories={mockCategories} 
        />
      )

      // Verify all content is initially displayed
      expect(screen.getAllByTestId(/^blog-card-/)).toHaveLength(9)

      // Search for "technology" - should match title, excerpt, and category
      const searchInput = screen.getByPlaceholderText('Search content...')
      await user.type(searchInput, 'technology')

      await waitFor(() => {
        const visibleCards = screen.getAllByTestId(/^blog-card-/)
        expect(visibleCards).toHaveLength(3) // Only Technology category items
        
        visibleCards.forEach(card => {
          expect(card).toHaveAttribute('data-category', 'Technology')
        })
      })
    })

    it('should search case-insensitively and reset visible count', async () => {
      const user = userEvent.setup()
      render(
        <ContentPageClient 
          initialContent={mockContentItems} 
          categories={mockCategories} 
        />
      )

      // Search with mixed case
      const searchInput = screen.getByPlaceholderText('Search content...')
      await user.type(searchInput, 'DESIGN')

      await waitFor(() => {
        const visibleCards = screen.getAllByTestId(/^blog-card-/)
        expect(visibleCards).toHaveLength(2) // Only Design category items
        
        visibleCards.forEach(card => {
          expect(card).toHaveAttribute('data-category', 'Design')
        })
      })
    })

    it('should clear search and show all content when search is empty', async () => {
      const user = userEvent.setup()
      render(
        <ContentPageClient 
          initialContent={mockContentItems} 
          categories={mockCategories} 
        />
      )

      // First search to filter content
      const searchInput = screen.getByPlaceholderText('Search content...')
      await user.type(searchInput, 'design')
      
      await waitFor(() => {
        expect(screen.getAllByTestId(/^blog-card-/)).toHaveLength(2)
      })

      // Clear search
      await user.clear(searchInput)

      await waitFor(() => {
        expect(screen.getAllByTestId(/^blog-card-/)).toHaveLength(9) // All content restored
      })
    })
  })

  describe('Category Filter Integration', () => {
    it('should filter content by selected category', async () => {
      const user = userEvent.setup()
      render(
        <ContentPageClient 
          initialContent={mockContentItems} 
          categories={mockCategories} 
        />
      )

      // Click on Technology category
      const technologyButton = screen.getByRole('button', { name: 'Technology' })
      await user.click(technologyButton)

      await waitFor(() => {
        const visibleCards = screen.getAllByTestId(/^blog-card-/)
        expect(visibleCards).toHaveLength(3)
        
        visibleCards.forEach(card => {
          expect(card).toHaveAttribute('data-category', 'Technology')
        })
      })

      // Verify button styling reflects selection
      expect(technologyButton).toHaveClass('bg-gray-900', 'text-white')
    })

    it('should reset to all content when "All" category is selected', async () => {
      const user = userEvent.setup()
      render(
        <ContentPageClient 
          initialContent={mockContentItems} 
          categories={mockCategories} 
        />
      )

      // First select a specific category
      const designButton = screen.getByRole('button', { name: 'Design' })
      await user.click(designButton)

      await waitFor(() => {
        expect(screen.getAllByTestId(/^blog-card-/)).toHaveLength(2)
      })

      // Then select "All"
      const allButton = screen.getByRole('button', { name: 'All' })
      await user.click(allButton)

      await waitFor(() => {
        expect(screen.getAllByTestId(/^blog-card-/)).toHaveLength(9) // All content restored
      })

      // Verify "All" button styling
      expect(allButton).toHaveClass('bg-gray-900', 'text-white')
    })

    it('should reset visible count when category changes', async () => {
      const user = userEvent.setup()
      // Create more content to test pagination
      const manyItems = createMockContentItems(15, { category: 'Technology' })
      
      render(
        <ContentPageClient 
          initialContent={manyItems} 
          categories={['Technology']} 
        />
      )

      // Verify initial load shows 9 items
      expect(screen.getAllByTestId(/^blog-card-/)).toHaveLength(9)

      // Load more to show more items
      const loadMoreButton = screen.getByRole('button', { name: 'Load More' })
      await user.click(loadMoreButton)

      await waitFor(() => {
        expect(screen.getAllByTestId(/^blog-card-/)).toHaveLength(15)
      })

      // Filter by category (should reset to 9 visible)
      const technologyButton = screen.getByRole('button', { name: 'Technology' })
      await user.click(technologyButton)

      await waitFor(() => {
        expect(screen.getAllByTestId(/^blog-card-/)).toHaveLength(9) // Reset to initial count
      })
    })
  })

  describe('Search and Category Filter Integration', () => {
    it('should combine search and category filters correctly', async () => {
      const user = userEvent.setup()
      const mixedContent = [
        ...createMockContentItems(2, { 
          category: 'Technology', 
          title: 'React Development',
          excerpt: 'Advanced React patterns'
        }),
        ...createMockContentItems(1, { 
          category: 'Technology', 
          title: 'Vue.js Guide',
          excerpt: 'Getting started with Vue'
        }),
        ...createMockContentItems(1, { 
          category: 'Design', 
          title: 'React Design Systems',
          excerpt: 'Building scalable design systems'
        })
      ]

      render(
        <ContentPageClient 
          initialContent={mixedContent} 
          categories={['Technology', 'Design']} 
        />
      )

      // First filter by category
      const technologyButton = screen.getByRole('button', { name: 'Technology' })
      await user.click(technologyButton)

      await waitFor(() => {
        expect(screen.getAllByTestId(/^blog-card-/)).toHaveLength(3) // All Technology items
      })

      // Then search within that category
      const searchInput = screen.getByPlaceholderText('Search content...')
      await user.type(searchInput, 'react')

      await waitFor(() => {
        const visibleCards = screen.getAllByTestId(/^blog-card-/)
        expect(visibleCards).toHaveLength(2) // Only Technology items with "react" in title
        
        visibleCards.forEach(card => {
          expect(card).toHaveAttribute('data-category', 'Technology')
        })
      })
    })

    it('should maintain search when switching categories', async () => {
      const user = userEvent.setup()
      const searchableContent = [
        ...createMockContentItems(1, { 
          category: 'Technology', 
          title: 'React Best Practices',
          excerpt: 'Modern React development'
        }),
        ...createMockContentItems(1, { 
          category: 'Design', 
          title: 'React UI Components',
          excerpt: 'Building reusable components'
        })
      ]

      render(
        <ContentPageClient 
          initialContent={searchableContent} 
          categories={['Technology', 'Design']} 
        />
      )

      // First search for "react"
      const searchInput = screen.getByPlaceholderText('Search content...')
      await user.type(searchInput, 'react')

      await waitFor(() => {
        expect(screen.getAllByTestId(/^blog-card-/)).toHaveLength(2) // Both items match
      })

      // Switch to Technology category - should still apply search
      const technologyButton = screen.getByRole('button', { name: 'Technology' })
      await user.click(technologyButton)

      await waitFor(() => {
        const visibleCards = screen.getAllByTestId(/^blog-card-/)
        expect(visibleCards).toHaveLength(1) // Only Technology item with "react"
        expect(visibleCards[0]).toHaveAttribute('data-category', 'Technology')
      })

      // Search input should still show "react"
      expect(searchInput).toHaveValue('react')
    })
  })

  describe('Load More Functionality Integration', () => {
    it('should load more content and hide button when all content is shown', async () => {
      const user = userEvent.setup()
      const manyItems = createMockContentItems(15, { category: 'Technology' })
      
      render(
        <ContentPageClient 
          initialContent={manyItems} 
          categories={['Technology']} 
        />
      )

      // Initially shows 9 items
      expect(screen.getAllByTestId(/^blog-card-/)).toHaveLength(9)
      expect(screen.getByRole('button', { name: 'Load More' })).toBeInTheDocument()

      // Load more to show 15 items
      const loadMoreButton = screen.getByRole('button', { name: 'Load More' })
      await user.click(loadMoreButton)

      await waitFor(() => {
        expect(screen.getAllByTestId(/^blog-card-/)).toHaveLength(15)
        expect(screen.queryByRole('button', { name: 'Load More' })).not.toBeInTheDocument()
      })
    })

    it('should respect load more with filtered content', async () => {
      const user = userEvent.setup()
      const manyFilteredItems = [
        ...createMockContentItems(12, { category: 'Technology' }),
        ...createMockContentItems(5, { category: 'Design' })
      ]
      
      render(
        <ContentPageClient 
          initialContent={manyFilteredItems} 
          categories={['Technology', 'Design']} 
        />
      )

      // Filter by Technology category
      const technologyButton = screen.getByRole('button', { name: 'Technology' })
      await user.click(technologyButton)

      await waitFor(() => {
        expect(screen.getAllByTestId(/^blog-card-/)).toHaveLength(9) // First 9 Technology items
      })

      // Load more within filtered results
      const loadMoreButton = screen.getByRole('button', { name: 'Load More' })
      await user.click(loadMoreButton)

      await waitFor(() => {
        expect(screen.getAllByTestId(/^blog-card-/)).toHaveLength(12) // All Technology items
        expect(screen.queryByRole('button', { name: 'Load More' })).not.toBeInTheDocument()
      })
    })
  })

  describe('Cross-Component State Synchronization', () => {
    it('should synchronize state between ContentFilter and ContentPageClient', async () => {
      const user = userEvent.setup()
      render(
        <ContentPageClient 
          initialContent={mockContentItems} 
          categories={mockCategories} 
        />
      )

      // Verify initial state
      expect(screen.getAllByTestId(/^blog-card-/)).toHaveLength(9)
      expect(screen.getByRole('button', { name: 'All' })).toHaveClass('bg-gray-900', 'text-white')

      // Interact with filter components
      const personalButton = screen.getByRole('button', { name: 'Personal' })
      await user.click(personalButton)

      // Verify state synchronization
      await waitFor(() => {
        const visibleCards = screen.getAllByTestId(/^blog-card-/)
        expect(visibleCards).toHaveLength(4) // Personal category items
        expect(personalButton).toHaveClass('bg-gray-900', 'text-white')
        expect(screen.getByRole('button', { name: 'All' })).not.toHaveClass('bg-gray-900', 'text-white')
      })
    })

    it('should handle rapid state changes without race conditions', async () => {
      const user = userEvent.setup()
      render(
        <ContentPageClient 
          initialContent={mockContentItems} 
          categories={mockCategories} 
        />
      )

      // Rapidly change filters
      const searchInput = screen.getByPlaceholderText('Search content...')
      const technologyButton = screen.getByRole('button', { name: 'Technology' })
      const designButton = screen.getByRole('button', { name: 'Design' })

      await user.type(searchInput, 'project')
      await user.click(technologyButton)
      await user.click(designButton)
      await user.clear(searchInput)
      await user.type(searchInput, 'blog')

      // Final state should be consistent
      await waitFor(() => {
        const visibleCards = screen.getAllByTestId(/^blog-card-/)
        // Should show Design items with "blog" in title/excerpt
        expect(visibleCards.length).toBeGreaterThan(0)
        expect(designButton).toHaveClass('bg-gray-900', 'text-white')
      })
    })
  })

  describe('Accessibility Integration', () => {
    it('should maintain proper ARIA labels and roles during filtering', async () => {
      const user = userEvent.setup()
      render(
        <ContentPageClient 
          initialContent={mockContentItems} 
          categories={mockCategories} 
        />
      )

      // Search input should have proper ARIA attributes
      const searchInput = screen.getByRole('searchbox')
      expect(searchInput).toHaveAttribute('placeholder', 'Search content...')

      // Category buttons should have button role
      mockCategories.forEach(category => {
        expect(screen.getByRole('button', { name: category })).toBeInTheDocument()
      })

      // Load more button should be accessible
      const loadMoreButton = screen.getByRole('button', { name: 'Load More' })
      expect(loadMoreButton).toBeInTheDocument()

      // Filter content and verify accessibility is maintained
      await user.click(screen.getByRole('button', { name: 'Technology' }))
      
      await waitFor(() => {
        // All interactive elements should still be accessible
        expect(screen.getByRole('searchbox')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Technology' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
      })
    })
  })
})