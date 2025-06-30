import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ContentFilter from '../ContentFilter';

describe('ContentFilter Component', () => {
  const mockCategories = ['Tech', 'Life', 'Science', 'Adventure'];
  const mockOnSearch = jest.fn();
  const mockOnCategorySelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input with correct placeholder', () => {
    render(
      <ContentFilter 
        categories={mockCategories}
        onSearch={mockOnSearch}
        onCategorySelect={mockOnCategorySelect}
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search content...');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('type', 'search');
  });

  it('renders All button and category buttons', () => {
    render(
      <ContentFilter 
        categories={mockCategories}
        onSearch={mockOnSearch}
        onCategorySelect={mockOnCategorySelect}
      />
    );
    
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    mockCategories.forEach(category => {
      expect(screen.getByRole('button', { name: category })).toBeInTheDocument();
    });
  });

  it('calls onSearch when typing in search input', () => {
    render(
      <ContentFilter 
        categories={mockCategories}
        onSearch={mockOnSearch}
        onCategorySelect={mockOnCategorySelect}
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search content...');
    fireEvent.change(searchInput, { target: { value: 'react' } });
    
    expect(mockOnSearch).toHaveBeenCalledWith('react');
    expect(searchInput).toHaveValue('react');
  });

  it('calls onCategorySelect when clicking category button', () => {
    render(
      <ContentFilter 
        categories={mockCategories}
        onSearch={mockOnSearch}
        onCategorySelect={mockOnCategorySelect}
      />
    );
    
    const techButton = screen.getByRole('button', { name: 'Tech' });
    fireEvent.click(techButton);
    
    expect(mockOnCategorySelect).toHaveBeenCalledWith('Tech');
  });

  it('calls onCategorySelect with null when clicking All button', () => {
    render(
      <ContentFilter 
        categories={mockCategories}
        onSearch={mockOnSearch}
        onCategorySelect={mockOnCategorySelect}
      />
    );
    
    const allButton = screen.getByRole('button', { name: 'All' });
    fireEvent.click(allButton);
    
    expect(mockOnCategorySelect).toHaveBeenCalledWith(null);
  });

  it('highlights selected category button', () => {
    render(
      <ContentFilter 
        categories={mockCategories}
        onSearch={mockOnSearch}
        onCategorySelect={mockOnCategorySelect}
      />
    );
    
    // All should be selected by default
    const allButton = screen.getByRole('button', { name: 'All' });
    expect(allButton).toHaveClass('bg-gray-900', 'text-white');
    
    // Click Tech button
    const techButton = screen.getByRole('button', { name: 'Tech' });
    fireEvent.click(techButton);
    
    // Tech should now be highlighted
    expect(techButton).toHaveClass('bg-gray-900', 'text-white');
    expect(allButton).not.toHaveClass('bg-gray-900', 'text-white');
  });

  it('maintains search value during re-renders', () => {
    const { rerender } = render(
      <ContentFilter 
        categories={mockCategories}
        onSearch={mockOnSearch}
        onCategorySelect={mockOnCategorySelect}
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search content...') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'javascript' } });
    
    // Re-render with same props
    rerender(
      <ContentFilter 
        categories={mockCategories}
        onSearch={mockOnSearch}
        onCategorySelect={mockOnCategorySelect}
      />
    );
    
    expect(searchInput.value).toBe('javascript');
  });

  it('clears search when input is cleared', () => {
    render(
      <ContentFilter 
        categories={mockCategories}
        onSearch={mockOnSearch}
        onCategorySelect={mockOnCategorySelect}
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search content...');
    
    // Type something
    fireEvent.change(searchInput, { target: { value: 'test' } });
    expect(mockOnSearch).toHaveBeenCalledWith('test');
    
    // Clear the input
    fireEvent.change(searchInput, { target: { value: '' } });
    expect(mockOnSearch).toHaveBeenCalledWith('');
  });

  it('renders search icon in search input', () => {
    render(
      <ContentFilter 
        categories={mockCategories}
        onSearch={mockOnSearch}
        onCategorySelect={mockOnCategorySelect}
      />
    );
    
    // Check for Search icon by looking for the svg with specific classes
    const searchIcon = screen.getByPlaceholderText('Search content...').parentElement?.querySelector('svg');
    expect(searchIcon).toBeInTheDocument();
    expect(searchIcon).toHaveClass('h-4', 'w-4');
  });
});