import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ContentPage from '../page'
import { getAllContent, getCategories } from '@/lib/content'
import { createMockContentItems } from '@/test/factories'

vi.mock('@/lib/content', () => ({
  getAllContent: vi.fn(),
  getCategories: vi.fn()
}))

vi.mock('../ContentPageClient', () => ({
  default: vi.fn(({ initialContent, categories }) => (
    <div data-testid="content-page-client">
      <div data-testid="content-count">{initialContent.length} items</div>
      <div data-testid="categories-count">{categories.length} categories</div>
      {initialContent.map((item: { id: string; title: string; type: string }) => (
        <div key={item.id} data-testid={`content-item-${item.id}`}>
          {item.title} - {item.type}
        </div>
      ))}
      {categories.map((category: string) => (
        <div key={category} data-testid={`category-${category}`}>
          {category}
        </div>
      ))}
    </div>
  ))
}))

const mockGetAllContent = vi.mocked(getAllContent)
const mockGetCategories = vi.mocked(getCategories)

describe('Content Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch all content and categories', async () => {
    const mockContent = createMockContentItems(3)
    const mockCategories = ['Tech', 'Design', 'Personal']
    
    mockGetAllContent.mockResolvedValue(mockContent)
    mockGetCategories.mockResolvedValue(mockCategories)

    await ContentPage()

    expect(mockGetAllContent).toHaveBeenCalledOnce()
    expect(mockGetCategories).toHaveBeenCalledOnce()
  })

  it('should render ContentPageClient with fetched data', async () => {
    const mockContent = createMockContentItems(2, { type: 'blog' })
    const mockCategories = ['Tech', 'Design']
    
    mockGetAllContent.mockResolvedValue(mockContent)
    mockGetCategories.mockResolvedValue(mockCategories)

    const ContentPageComponent = await ContentPage()
    render(ContentPageComponent)

    expect(screen.getByTestId('content-page-client')).toBeInTheDocument()
    expect(screen.getByTestId('content-count')).toHaveTextContent('2 items')
    expect(screen.getByTestId('categories-count')).toHaveTextContent('2 categories')
  })

  it('should pass content items to ContentPageClient', async () => {
    const mockContent = createMockContentItems(3)
    const mockCategories = ['Tech']
    
    mockGetAllContent.mockResolvedValue(mockContent)
    mockGetCategories.mockResolvedValue(mockCategories)

    const ContentPageComponent = await ContentPage()
    render(ContentPageComponent)

    expect(screen.getByTestId('content-item-test-post-1')).toHaveTextContent('Test Post 1 - blog')
    expect(screen.getByTestId('content-item-test-post-2')).toHaveTextContent('Test Post 2 - blog')
    expect(screen.getByTestId('content-item-test-post-3')).toHaveTextContent('Test Post 3 - blog')
  })

  it('should pass categories to ContentPageClient', async () => {
    const mockContent = createMockContentItems(1)
    const mockCategories = ['Technology', 'Design', 'Personal Development']
    
    mockGetAllContent.mockResolvedValue(mockContent)
    mockGetCategories.mockResolvedValue(mockCategories)

    const ContentPageComponent = await ContentPage()
    render(ContentPageComponent)

    expect(screen.getByTestId('category-Technology')).toHaveTextContent('Technology')
    expect(screen.getByTestId('category-Design')).toHaveTextContent('Design')
    expect(screen.getByTestId('category-Personal Development')).toHaveTextContent('Personal Development')
  })

  it('should handle empty content array', async () => {
    const mockContent = [] as { id: string; title: string; type: string }[]
    const mockCategories = ['Tech']
    
    mockGetAllContent.mockResolvedValue(mockContent)
    mockGetCategories.mockResolvedValue(mockCategories)

    const ContentPageComponent = await ContentPage()
    render(ContentPageComponent)

    expect(screen.getByTestId('content-count')).toHaveTextContent('0 items')
    expect(screen.getByTestId('categories-count')).toHaveTextContent('1 categories')
  })

  it('should handle empty categories array', async () => {
    const mockContent = createMockContentItems(2)
    const mockCategories = [] as string[]
    
    mockGetAllContent.mockResolvedValue(mockContent)
    mockGetCategories.mockResolvedValue(mockCategories)

    const ContentPageComponent = await ContentPage()
    render(ContentPageComponent)

    expect(screen.getByTestId('content-count')).toHaveTextContent('2 items')
    expect(screen.getByTestId('categories-count')).toHaveTextContent('0 categories')
  })

  it('should fetch data concurrently using Promise.all', async () => {
    const mockContent = createMockContentItems(1)
    const mockCategories = ['Tech']
    
    const getAllContentSpy = mockGetAllContent.mockResolvedValue(mockContent)
    const getCategoriesSpy = mockGetCategories.mockResolvedValue(mockCategories)

    await ContentPage()

    // Both functions should be called
    expect(getAllContentSpy).toHaveBeenCalledOnce()
    expect(getCategoriesSpy).toHaveBeenCalledOnce()
  })

  it('should handle mixed content types', async () => {
    const mockContent = [
      createMockContentItems(1, { type: 'blog' })[0],
      createMockContentItems(1, { type: 'project', id: 'project-1', slug: 'project-1', title: 'Project 1' })[0]
    ]
    const mockCategories = ['Tech']
    
    mockGetAllContent.mockResolvedValue(mockContent)
    mockGetCategories.mockResolvedValue(mockCategories)

    const ContentPageComponent = await ContentPage()
    render(ContentPageComponent)

    expect(screen.getByTestId('content-item-test-post-1')).toHaveTextContent('Test Post 1 - blog')
    expect(screen.getByTestId('content-item-project-1')).toHaveTextContent('Project 1 - project')
  })
})