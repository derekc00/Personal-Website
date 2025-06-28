import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useTheme } from 'next-themes'
import ThemeSwitcher from '../ThemeSwitcher'

jest.mock('next-themes', () => ({
  useTheme: jest.fn()
}))

const mockUseTheme = jest.mocked(useTheme)

describe('ThemeSwitcher', () => {
  const mockSetTheme = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
      resolvedTheme: 'light',
      themes: ['light', 'dark', 'system'],
      systemTheme: 'light'
    })
  })

  it('should render theme switcher button', () => {
    render(<ThemeSwitcher />)
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument()
  })

  it('should show sun icon for light theme', () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
      resolvedTheme: 'light',
      themes: ['light', 'dark', 'system'],
      systemTheme: 'light'
    })

    render(<ThemeSwitcher />)
    
    const button = screen.getByRole('button', { name: /toggle theme/i })
    const sunIcon = button.querySelector('svg')
    expect(sunIcon).toBeInTheDocument()
    expect(sunIcon).toHaveClass('lucide-sun')
  })

  it('should show moon icon for dark theme', () => {
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
      resolvedTheme: 'dark',
      themes: ['light', 'dark', 'system'],
      systemTheme: 'dark'
    })

    render(<ThemeSwitcher />)
    
    const button = screen.getByRole('button', { name: /toggle theme/i })
    const moonIcon = button.querySelector('svg')
    expect(moonIcon).toBeInTheDocument()
    expect(moonIcon).toHaveClass('lucide-moon')
  })

  it('should access setTheme function from useTheme hook', () => {
    render(<ThemeSwitcher />)
    
    expect(mockUseTheme).toHaveBeenCalled()
    const { setTheme } = mockUseTheme.mock.results[0].value
    expect(setTheme).toBe(mockSetTheme)
  })

  it('should handle system theme correctly', () => {
    mockUseTheme.mockReturnValue({
      theme: 'system',
      setTheme: mockSetTheme,
      resolvedTheme: 'dark',
      themes: ['light', 'dark', 'system'],
      systemTheme: 'dark'
    })

    render(<ThemeSwitcher />)
    
    const button = screen.getByRole('button', { name: /toggle theme/i })
    expect(button).toBeInTheDocument()
  })

  it('should render with different theme states', () => {
    const themes = ['light', 'dark', 'system']
    
    themes.forEach(theme => {
      mockUseTheme.mockReturnValue({
        theme,
        setTheme: mockSetTheme,
        resolvedTheme: theme === 'system' ? 'light' : theme,
        themes: ['light', 'dark', 'system'],
        systemTheme: 'light'
      })

      const { unmount } = render(<ThemeSwitcher />)
      expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument()
      unmount()
    })
  })
})