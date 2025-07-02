import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import BlogCard from '@/components/BlogCard'
import { createMockContentItem } from '@/test/factories'

describe('BlogCard', () => {
  it('should render blog post information correctly', () => {
    const post = createMockContentItem({
      title: 'Test Blog Post',
      date: '2023-11-30',
      tags: ['javascript', 'testing'],
      category: 'Tech',
      excerpt: 'This is a test excerpt'
    })

    render(<BlogCard post={post} />)

    expect(screen.getByText('Test Blog Post')).toBeInTheDocument()
    
    // Test date formatting more reliably by checking the actual formatted output
    const expectedDate = new Date('2023-11-30').toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
    expect(screen.getByText(expectedDate)).toBeInTheDocument()
    
    expect(screen.getByText('javascript')).toBeInTheDocument()
    expect(screen.getByText('testing')).toBeInTheDocument()
    expect(screen.getByText('Tech')).toBeInTheDocument()
    expect(screen.getByText('This is a test excerpt')).toBeInTheDocument()
  })

  it('should use fallback image when no image provided', () => {
    const post = createMockContentItem({ image: null })

    render(<BlogCard post={post} />)

    const image = screen.getByAltText(post.title)
    expect(image.getAttribute('src')).toMatch(/home\.jpg/)
  })

  it('should call onTagClick when tag is clicked', () => {
    const mockOnTagClick = jest.fn()
    const post = createMockContentItem({
      tags: ['javascript']
    })

    render(<BlogCard post={post} onTagClick={mockOnTagClick} />)

    const tag = screen.getByText('javascript')
    fireEvent.click(tag)

    expect(mockOnTagClick).toHaveBeenCalledWith('javascript')
  })

  it('should link to correct blog post URL for blog type', () => {
    const post = createMockContentItem({ 
      slug: 'my-test-post',
      type: 'blog'
    })

    render(<BlogCard post={post} />)

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2) // Image link and title link
    links.forEach(link => {
      expect(link).toHaveAttribute('href', '/blog/my-test-post')
    })
  })

  it('should link to correct project URL for project type', () => {
    const post = createMockContentItem({ 
      slug: 'my-test-project',
      type: 'project'
    })

    render(<BlogCard post={post} />)

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2) // Image link and title link
    links.forEach(link => {
      expect(link).toHaveAttribute('href', '/projects/my-test-project')
    })
  })

  it('should show loading state for image initially', () => {
    const post = createMockContentItem()

    render(<BlogCard post={post} />)

    // Loading skeleton should be present initially - check for animate-pulse class
    const container = screen.getByRole('img').closest('[class*="relative"]')
    const loadingSkeleton = container?.querySelector('[class*="animate-pulse"]')
    expect(loadingSkeleton).toBeInTheDocument()
  })

  it('should display type and category information', () => {
    const post = createMockContentItem({
      type: 'project',
      category: 'Development'
    })

    render(<BlogCard post={post} />)

    expect(screen.getByText('Development')).toBeInTheDocument()
    expect(screen.getByText('project')).toBeInTheDocument()
  })
})