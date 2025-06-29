import { describe, it, expect, jest } from '@jest/globals'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContentFilter from '../ContentFilter'

// Mock UI components to avoid styling dependencies
jest.mock('@/components/ui/button', () => {
  const React = require('react')
  return {
    Button: React.forwardRef(({ children, onClick, className, ...props }, ref) => (
      <button ref={ref} onClick={onClick} className={className} {...props}>
        {children}
      </button>
    ))
  }
})

jest.mock('@/components/ui/input', () => {
  const React = require('react')
  return {
    Input: React.forwardRef((props, ref) => <input ref={ref} {...props} />)
  }
})

jest.mock('lucide-react', () => ({
  Search: () => <svg data-testid="search-icon" />
}))

describe('ContentFilter Integration', () => {
  const mockCategories = ['Technology', 'Design', 'Personal']
  const mockOnSearch = jest.fn()
  const mockOnCategorySelect = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render search input and category buttons', () => {
    render(
      <ContentFilter
        categories={mockCategories}
        onSearch={mockOnSearch}
        onCategorySelect={mockOnCategorySelect}
      />
    )

    expect(screen.getByPlaceholderText('Search content...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Technology' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Design' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Personal' })).toBeInTheDocument()
  })

  it('should call onSearch when typing in search input', async () => {
    const user = userEvent.setup()
    render(
      <ContentFilter
        categories={mockCategories}
        onSearch={mockOnSearch}
        onCategorySelect={mockOnCategorySelect}
      />
    )

    const searchInput = screen.getByPlaceholderText('Search content...')
    await user.type(searchInput, 'react')

    expect(mockOnSearch).toHaveBeenCalledWith('r')
    expect(mockOnSearch).toHaveBeenCalledWith('re')
    expect(mockOnSearch).toHaveBeenCalledWith('rea')
    expect(mockOnSearch).toHaveBeenCalledWith('reac')
    expect(mockOnSearch).toHaveBeenCalledWith('react')
  })

  it('should call onCategorySelect when clicking category buttons', async () => {
    const user = userEvent.setup()
    render(
      <ContentFilter
        categories={mockCategories}
        onSearch={mockOnSearch}
        onCategorySelect={mockOnCategorySelect}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Technology' }))
    expect(mockOnCategorySelect).toHaveBeenCalledWith('Technology')

    await user.click(screen.getByRole('button', { name: 'All' }))
    expect(mockOnCategorySelect).toHaveBeenCalledWith(null)
  })

  it('should highlight selected category with correct styling', async () => {
    const user = userEvent.setup()
    render(
      <ContentFilter
        categories={mockCategories}
        onSearch={mockOnSearch}
        onCategorySelect={mockOnCategorySelect}
      />
    )

    // "All" should initially be selected
    const allButton = screen.getByRole('button', { name: 'All' })
    expect(allButton).toHaveClass('bg-gray-900', 'text-white')

    // Click Technology button
    const technologyButton = screen.getByRole('button', { name: 'Technology' })
    await user.click(technologyButton)

    // Technology should now be selected
    expect(technologyButton).toHaveClass('bg-gray-900', 'text-white')
  })

  it('should maintain search input value during category changes', async () => {
    const user = userEvent.setup()
    render(
      <ContentFilter
        categories={mockCategories}
        onSearch={mockOnSearch}
        onCategorySelect={mockOnCategorySelect}
      />
    )

    const searchInput = screen.getByPlaceholderText('Search content...')
    await user.type(searchInput, 'react')
    
    expect(searchInput).toHaveValue('react')

    // Change category
    await user.click(screen.getByRole('button', { name: 'Technology' }))
    
    // Search input should still have the value
    expect(searchInput).toHaveValue('react')
  })
})