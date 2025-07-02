import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../button'

describe('Button', () => {
  it('should render button with default variant and size', () => {
    render(<Button>Click me</Button>)
    
    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass(
      'inline-flex',
      'items-center',
      'justify-center',
      'bg-gray-900',
      'text-gray-50',
      'h-9',
      'px-4',
      'py-2'
    )
  })

  it('should render with outline variant', () => {
    render(<Button variant="outline">Outline Button</Button>)
    
    const button = screen.getByRole('button', { name: 'Outline Button' })
    expect(button).toHaveClass(
      'border',
      'border-gray-200',
      'bg-white',
      'shadow-sm'
    )
  })

  it('should render with secondary variant', () => {
    render(<Button variant="secondary">Secondary Button</Button>)
    
    const button = screen.getByRole('button', { name: 'Secondary Button' })
    expect(button).toHaveClass(
      'bg-gray-100',
      'text-gray-900',
      'shadow-sm'
    )
  })

  it('should render with ghost variant', () => {
    render(<Button variant="ghost">Ghost Button</Button>)
    
    const button = screen.getByRole('button', { name: 'Ghost Button' })
    expect(button).toHaveClass('hover:bg-gray-100', 'hover:text-gray-900')
  })

  it('should render with link variant', () => {
    render(<Button variant="link">Link Button</Button>)
    
    const button = screen.getByRole('button', { name: 'Link Button' })
    expect(button).toHaveClass(
      'text-gray-900',
      'underline-offset-4',
      'hover:underline'
    )
  })

  it('should render with small size', () => {
    render(<Button size="sm">Small Button</Button>)
    
    const button = screen.getByRole('button', { name: 'Small Button' })
    expect(button).toHaveClass('h-8', 'px-3', 'text-xs')
  })

  it('should render with large size', () => {
    render(<Button size="lg">Large Button</Button>)
    
    const button = screen.getByRole('button', { name: 'Large Button' })
    expect(button).toHaveClass('h-10', 'px-8')
  })

  it('should render with icon size', () => {
    render(<Button size="icon">🎯</Button>)
    
    const button = screen.getByRole('button', { name: '🎯' })
    expect(button).toHaveClass('h-9', 'w-9')
  })

  it('should handle click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Clickable</Button>)
    
    const button = screen.getByRole('button', { name: 'Clickable' })
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>)
    
    const button = screen.getByRole('button', { name: 'Disabled Button' })
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50')
  })

  it('should accept custom className', () => {
    render(<Button className="custom-class">Custom Button</Button>)
    
    const button = screen.getByRole('button', { name: 'Custom Button' })
    expect(button).toHaveClass('custom-class')
  })

  it('should render as child component when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link as Button</a>
      </Button>
    )
    
    const link = screen.getByRole('link', { name: 'Link as Button' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
    expect(link).toHaveClass('inline-flex', 'items-center', 'justify-center')
  })

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(<Button ref={ref}>Ref Button</Button>)
    
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    expect(ref.current?.textContent).toBe('Ref Button')
  })

  it('should combine variant and size classes correctly', () => {
    render(<Button variant="outline" size="lg">Combined Button</Button>)
    
    const button = screen.getByRole('button', { name: 'Combined Button' })
    expect(button).toHaveClass(
      'border',
      'border-gray-200',
      'bg-white',
      'h-10',
      'px-8'
    )
  })

  it('should pass through other HTML button attributes', () => {
    render(
      <Button type="submit" aria-label="Submit form" data-testid="submit-btn">
        Submit
      </Button>
    )
    
    const button = screen.getByTestId('submit-btn')
    expect(button).toHaveAttribute('type', 'submit')
    expect(button).toHaveAttribute('aria-label', 'Submit form')
  })

  it('should have focus-visible styles', () => {
    render(<Button>Focus Button</Button>)
    
    const button = screen.getByRole('button', { name: 'Focus Button' })
    expect(button).toHaveClass(
      'focus-visible:outline-none',
      'focus-visible:ring-1',
      'focus-visible:ring-gray-950'
    )
  })
})