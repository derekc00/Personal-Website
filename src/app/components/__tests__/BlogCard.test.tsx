import { describe, it, expect, vi } from '@jest/globals'
import { render, screen, fireEvent } from '@testing-library/react'
import BlogCard from '../card'
import { createMockBlogCardProps } from '@/test/factories'

describe('BlogCard', () => {
  it('should render blog post information correctly', () => {
    const props = createMockBlogCardProps({
      title: 'Test Blog Post',
      date: '2023-11-30',
      tags: ['javascript', 'testing']
    })

    render(<BlogCard {...props} />)

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
  })

  it('should use fallback image when no image provided', () => {
    const props = createMockBlogCardProps({ image: undefined })

    render(<BlogCard {...props} />)

    const image = screen.getByAltText(props.title)
    expect(image.getAttribute('src')).toMatch(/home\.jpg/)
  })

  it('should call onTagClick when tag is clicked', () => {
    const mockOnTagClick = jest.fn()
    const props = createMockBlogCardProps({
      tags: ['javascript'],
      onTagClick: mockOnTagClick
    })

    render(<BlogCard {...props} />)

    const tag = screen.getByText('javascript')
    fireEvent.click(tag)

    expect(mockOnTagClick).toHaveBeenCalledWith('javascript')
  })

  it('should link to correct blog post URL', () => {
    const props = createMockBlogCardProps({ slug: 'my-test-post' })

    render(<BlogCard {...props} />)

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2) // Image link and title link
    links.forEach(link => {
      expect(link).toHaveAttribute('href', '/blog/my-test-post')
    })
  })

  it('should show loading state for image initially', () => {
    const props = createMockBlogCardProps()

    render(<BlogCard {...props} />)

    // Loading skeleton should be present initially - check for animate-pulse class
    const container = screen.getByRole('img').closest('[class*="relative"]')
    const loadingSkeleton = container?.querySelector('[class*="animate-pulse"]')
    expect(loadingSkeleton).toBeInTheDocument()
  })
})