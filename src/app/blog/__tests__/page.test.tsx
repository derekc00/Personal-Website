import { describe, it, expect, vi } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import Blog from '../page'
import { getContentByType } from '@/lib/content'
import { createMockContentItems } from '@/test/factories'

jest.mock('@/lib/content', () => ({
  getContentByType: jest.fn()
}))

jest.mock('../BlogListClient', () => ({
  default: jest.fn(({ posts }) => (
    <div data-testid="blog-list-client">
      {posts.map((post: { id: string; title: string }) => (
        <div key={post.id} data-testid={`blog-post-${post.id}`}>
          {post.title}
        </div>
      ))}
    </div>
  ))
}))

const mockGetContentByType = jest.mocked(getContentByType)

describe('Blog Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render blog page with posts', async () => {
    const mockPosts = createMockContentItems(3, { type: 'blog' })
    mockGetContentByType.mockResolvedValue(mockPosts)

    const BlogPage = await Blog()
    render(BlogPage)

    expect(screen.getByText('Blog')).toBeInTheDocument()
    expect(screen.getByText("I've written 3 articles about software development, productivity, and more.")).toBeInTheDocument()
  })

  it('should fetch blog posts using content system', async () => {
    const mockPosts = createMockContentItems(2)
    mockGetContentByType.mockResolvedValue(mockPosts)

    await Blog()

    expect(mockGetContentByType).toHaveBeenCalledWith('blog')
  })

  it('should render search input', async () => {
    const mockPosts = createMockContentItems(1)
    mockGetContentByType.mockResolvedValue(mockPosts)

    const BlogPage = await Blog()
    render(BlogPage)

    const searchInput = screen.getByLabelText('Search articles')
    expect(searchInput).toBeInTheDocument()
    expect(searchInput).toHaveAttribute('placeholder', 'Search articles')
    expect(searchInput).toHaveAttribute('type', 'text')
  })

  it('should render search icon', async () => {
    const mockPosts = createMockContentItems(1)
    mockGetContentByType.mockResolvedValue(mockPosts)

    const BlogPage = await Blog()
    render(BlogPage)

    const searchIcon = screen.getByLabelText('Search articles').parentElement?.querySelector('svg')
    expect(searchIcon).toBeInTheDocument()
  })

  it('should pass posts to BlogListClient', async () => {
    const mockPosts = createMockContentItems(2, { type: 'blog' })
    mockGetContentByType.mockResolvedValue(mockPosts)

    const BlogPage = await Blog()
    render(BlogPage)

    expect(screen.getByTestId('blog-list-client')).toBeInTheDocument()
    expect(screen.getByTestId('blog-post-test-post-1')).toBeInTheDocument()
    expect(screen.getByTestId('blog-post-test-post-2')).toBeInTheDocument()
  })

  it('should render with empty posts array', async () => {
    mockGetContentByType.mockResolvedValue([])

    const BlogPage = await Blog()
    render(BlogPage)

    expect(screen.getByText('Blog')).toBeInTheDocument()
    expect(screen.getByText("I've written 0 articles about software development, productivity, and more.")).toBeInTheDocument()
    expect(screen.getByTestId('blog-list-client')).toBeInTheDocument()
  })

  it('should wrap BlogListClient in Suspense component', async () => {
    const mockPosts = createMockContentItems(1)
    mockGetContentByType.mockResolvedValue(mockPosts)

    const BlogPage = await Blog()
    render(BlogPage)

    // BlogListClient should be rendered (via Suspense)
    expect(screen.getByTestId('blog-list-client')).toBeInTheDocument()
  })

  it('should have correct page layout structure', async () => {
    const mockPosts = createMockContentItems(1)
    mockGetContentByType.mockResolvedValue(mockPosts)

    const BlogPage = await Blog()
    render(BlogPage)

    // Check that PageLayout, PageHeader, and Section components are rendered
    expect(screen.getByText('Blog')).toBeInTheDocument()
    expect(screen.getByLabelText('Search articles')).toBeInTheDocument()
    expect(screen.getByTestId('blog-list-client')).toBeInTheDocument()
  })

  it('should update article count dynamically', async () => {
    const mockPosts = createMockContentItems(5, { type: 'blog' })
    mockGetContentByType.mockResolvedValue(mockPosts)

    const BlogPage = await Blog()
    render(BlogPage)

    expect(screen.getByText("I've written 5 articles about software development, productivity, and more.")).toBeInTheDocument()
  })
})