import React from 'react'
import { render, screen } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import AdminBreadcrumbs from '../AdminBreadcrumbs'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

// Mock Heroicons
jest.mock('@heroicons/react/20/solid', () => ({
  ChevronRightIcon: ({ className }: { className: string }) => (
    <span className={className} data-testid="chevron-icon">›</span>
  ),
}))

describe('AdminBreadcrumbs', () => {
  const mockUsePathname = usePathname as jest.Mock

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should not render breadcrumbs for root admin path', () => {
    mockUsePathname.mockReturnValue('/admin')

    const { container } = render(<AdminBreadcrumbs />)

    expect(container.firstChild).toBeNull()
  })

  it('should render breadcrumbs for nested paths', () => {
    mockUsePathname.mockReturnValue('/admin/content')

    render(<AdminBreadcrumbs />)

    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Admin' })).toHaveAttribute('href', '/admin')
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('should render multiple breadcrumb levels', () => {
    mockUsePathname.mockReturnValue('/admin/content/new')

    render(<AdminBreadcrumbs />)

    expect(screen.getByRole('link', { name: 'Admin' })).toHaveAttribute('href', '/admin')
    expect(screen.getByRole('link', { name: 'Content' })).toHaveAttribute('href', '/admin/content')
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('should mark the last breadcrumb as current page', () => {
    mockUsePathname.mockReturnValue('/admin/content/new')

    render(<AdminBreadcrumbs />)

    const newBreadcrumb = screen.getByText('New')
    expect(newBreadcrumb).toHaveAttribute('aria-current', 'page')
    expect(newBreadcrumb).toHaveClass('text-gray-500')
    expect(newBreadcrumb.tagName).not.toBe('A')
  })

  it('should make non-current breadcrumbs clickable links', () => {
    mockUsePathname.mockReturnValue('/admin/content/new')

    render(<AdminBreadcrumbs />)

    const adminLink = screen.getByRole('link', { name: 'Admin' })
    const contentLink = screen.getByRole('link', { name: 'Content' })

    expect(adminLink).toHaveAttribute('href', '/admin')
    expect(adminLink).toHaveClass('text-gray-700', 'hover:text-gray-900')
    
    expect(contentLink).toHaveAttribute('href', '/admin/content')
    expect(contentLink).toHaveClass('text-gray-700', 'hover:text-gray-900')
  })

  it('should render chevron icons between breadcrumbs', () => {
    mockUsePathname.mockReturnValue('/admin/content/new')

    render(<AdminBreadcrumbs />)

    const chevrons = screen.getAllByTestId('chevron-icon')
    expect(chevrons).toHaveLength(2) // Two chevrons for three breadcrumb items
    
    chevrons.forEach(chevron => {
      expect(chevron).toHaveClass('text-gray-400')
    })
  })

  it('should capitalize breadcrumb labels', () => {
    mockUsePathname.mockReturnValue('/admin/content/edit')

    render(<AdminBreadcrumbs />)

    expect(screen.getByText('Admin')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.getByText('Edit')).toBeInTheDocument()
  })

  it('should handle hyphenated path segments', () => {
    mockUsePathname.mockReturnValue('/admin/user-management/edit-profile')

    render(<AdminBreadcrumbs />)

    expect(screen.getByText('User management')).toBeInTheDocument()
    expect(screen.getByText('Edit profile')).toBeInTheDocument()
  })

  it('should handle empty path segments correctly', () => {
    mockUsePathname.mockReturnValue('/admin//content/')

    render(<AdminBreadcrumbs />)

    // Should filter out empty segments
    expect(screen.getByRole('link', { name: 'Admin' })).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.queryByText('//')).not.toBeInTheDocument()
  })

  it('should render correct structure with ordered list', () => {
    mockUsePathname.mockReturnValue('/admin/content/new')

    render(<AdminBreadcrumbs />)

    const list = screen.getByRole('list')
    const listItems = screen.getAllByRole('listitem')

    expect(list.tagName).toBe('OL')
    expect(listItems).toHaveLength(3)
  })
})