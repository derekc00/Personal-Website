import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useSearchParams } from 'next/navigation'
import BlogListClient from '@/app/(public)/blog/BlogListClient'
import { createMockContentItems } from '@/test/factories'

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
}))

const mockUseSearchParams = vi.mocked(useSearchParams)

describe('BlogListClient', () => {
  beforeEach(() => {
    mockUseSearchParams.mockReturnValue({
      get: vi.fn().mockReturnValue(null),
    } as ReturnType<typeof useSearchParams>)
  })

  it('should render all posts when no tags selected', () => {
    const posts = createMockContentItems(3)

    render(<BlogListClient posts={posts} />)

    expect(screen.getByText('Test Post 1')).toBeInTheDocument()
    expect(screen.getByText('Test Post 2')).toBeInTheDocument()
    expect(screen.getByText('Test Post 3')).toBeInTheDocument()
  })

  it('should filter posts by selected tags', () => {
    mockUseSearchParams.mockReturnValue({
      get: vi.fn().mockReturnValue('javascript,react'),
    } as ReturnType<typeof useSearchParams>)

    const posts = createMockContentItems(3, { tags: ['javascript'] })
    posts[1].tags = ['react']
    posts[2].tags = ['python']

    render(<BlogListClient posts={posts} />)

    expect(screen.getByText('Test Post 1')).toBeInTheDocument()
    expect(screen.getByText('Test Post 2')).toBeInTheDocument()
    expect(screen.queryByText('Test Post 3')).not.toBeInTheDocument()
  })

  it('should show "no posts found" message when no posts match tags', () => {
    mockUseSearchParams.mockReturnValue({
      get: vi.fn().mockReturnValue('nonexistent'),
    } as ReturnType<typeof useSearchParams>)

    const posts = createMockContentItems(2, { tags: ['javascript'] })

    render(<BlogListClient posts={posts} />)

    expect(screen.getByText('No posts found')).toBeInTheDocument()
    expect(screen.getByText(/No posts found with the selected tags/)).toBeInTheDocument()
  })

  it('should show generic message when no posts available', () => {
    render(<BlogListClient posts={[]} />)

    expect(screen.getByText('No posts found')).toBeInTheDocument()
    expect(screen.getByText('No blog posts available at the moment.')).toBeInTheDocument()
  })

  it('should render posts in grid layout', () => {
    const posts = createMockContentItems(2)

    render(<BlogListClient posts={posts} />)

    const grid = screen.getByText('Test Post 1').closest('.grid')
    expect(grid).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3')
  })
})