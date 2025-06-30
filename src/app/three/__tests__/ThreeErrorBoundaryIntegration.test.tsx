import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

// Mock UI components
jest.mock('@/components/ui/button', () => {
  const Button = React.forwardRef(({ children, onClick, className, ...props }, ref) => (
    <button ref={ref} onClick={onClick} className={className} {...props}>
      {children}
    </button>
  ))
  Button.displayName = 'Button'
  return { Button }
})

import ThreeErrorBoundary from '@/components/ThreeErrorBoundary'

describe('Three.js Error Boundary Integration', () => {
  let consoleSpy: jest.SpyInstance

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  describe('WebGL Error Handling', () => {
    it('should catch and handle WebGL initialization errors', () => {
      const WebGLError = () => {
        throw new Error('WebGL is not supported')
      }

      render(
        <ThreeErrorBoundary>
          <WebGLError />
        </ThreeErrorBoundary>
      )

      expect(screen.getByText('3D Rendering Error')).toBeInTheDocument()
      expect(screen.getByText('Your browser may not support WebGL or 3D graphics rendering.')).toBeInTheDocument()
      expect(screen.getByText('Try Again')).toBeInTheDocument()
      expect(consoleSpy).toHaveBeenCalledWith('3D Rendering Error:', expect.any(Error))
    })

    it('should detect and log specific WebGL errors', () => {
      const SpecificWebGLError = () => {
        throw new Error('WebGL context creation failed')
      }

      render(
        <ThreeErrorBoundary>
          <SpecificWebGLError />
        </ThreeErrorBoundary>
      )

      expect(screen.getByText('3D Rendering Error')).toBeInTheDocument()
      expect(consoleSpy).toHaveBeenCalledWith('WebGL is not supported or failed to initialize')
    })

    it('should detect and log Three.js specific errors', () => {
      const ThreeJSError = () => {
        throw new Error('THREE.WebGLRenderer: Error creating WebGL context')
      }

      render(
        <ThreeErrorBoundary>
          <ThreeJSError />
        </ThreeErrorBoundary>
      )

      expect(screen.getByText('3D Rendering Error')).toBeInTheDocument()
      expect(consoleSpy).toHaveBeenCalledWith('Three.js rendering error occurred')
    })
  })

  describe('Error Recovery Functionality', () => {
    it('should reset error state when retry button is clicked', async () => {
      let shouldThrow = true

      const ConditionalError = () => {
        if (shouldThrow) {
          throw new Error('Temporary WebGL error')
        }
        return <div data-testid="three-content">3D Content Loaded</div>
      }

      render(
        <ThreeErrorBoundary>
          <ConditionalError />
        </ThreeErrorBoundary>
      )

      // Should show error initially
      expect(screen.getByText('3D Rendering Error')).toBeInTheDocument()

      // Simulate error resolution
      shouldThrow = false

      const user = userEvent.setup()
      const retryButton = screen.getByText('Try Again')
      await user.click(retryButton)

      // Should attempt to re-render content
      expect(screen.getByTestId('three-content')).toBeInTheDocument()
    })

    it('should provide helpful recovery instructions', () => {
      const Error3D = () => {
        throw new Error('3D rendering failed')
      }

      render(
        <ThreeErrorBoundary>
          <Error3D />
        </ThreeErrorBoundary>
      )

      expect(screen.getByText('Try updating your browser or enabling hardware acceleration')).toBeInTheDocument()
      expect(screen.getByText('🎯')).toBeInTheDocument() // Error icon
    })
  })

  describe('Custom Fallback Support', () => {
    it('should render custom fallback when provided', () => {
      const Error3D = () => {
        throw new Error('3D error')
      }

      const customFallback = (
        <div data-testid="custom-fallback">
          <h1>Custom 3D Error UI</h1>
          <p>Please try again later</p>
        </div>
      )

      render(
        <ThreeErrorBoundary fallback={customFallback}>
          <Error3D />
        </ThreeErrorBoundary>
      )

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument()
      expect(screen.getByText('Custom 3D Error UI')).toBeInTheDocument()
      expect(screen.getByText('Please try again later')).toBeInTheDocument()
    })

    it('should use default fallback when no custom fallback provided', () => {
      const Error3D = () => {
        throw new Error('3D error')
      }

      render(
        <ThreeErrorBoundary>
          <Error3D />
        </ThreeErrorBoundary>
      )

      // Should render default fallback
      expect(screen.getByText('3D Rendering Error')).toBeInTheDocument()
      expect(screen.getByText('Try Again')).toBeInTheDocument()
    })
  })

  describe('Error Logging and Debugging', () => {
    it('should log comprehensive error information for debugging', () => {
      const DetailedError = () => {
        const error = new Error('Detailed WebGL context error')
        error.stack = 'Error stack trace here'
        throw error
      }

      render(
        <ThreeErrorBoundary>
          <DetailedError />
        </ThreeErrorBoundary>
      )

      expect(consoleSpy).toHaveBeenCalledWith('3D Rendering Error:', expect.any(Error))
      expect(consoleSpy).toHaveBeenCalledWith('Error Info:', expect.objectContaining({
        componentStack: expect.any(String)
      }))
    })

    it('should handle errors during error boundary state updates', () => {
      const RecursiveError = () => {
        throw new Error('Error in error boundary')
      }

      // Should not crash the entire application
      expect(() => {
        render(
          <ThreeErrorBoundary>
            <RecursiveError />
          </ThreeErrorBoundary>
        )
      }).not.toThrow()

      expect(screen.getByText('3D Rendering Error')).toBeInTheDocument()
    })
  })

  describe('Integration with Multiple Error Sources', () => {
    it('should handle errors from different Three.js components', () => {
      const MultipleErrorSources = () => {
        const errors = [
          'THREE.WebGLRenderer: context lost',
          'WebGL: CONTEXT_LOST_WEBGL',
          'THREE.Texture: image load failed'
        ]
        
        const randomError = errors[Math.floor(Math.random() * errors.length)]
        throw new Error(randomError)
      }

      render(
        <ThreeErrorBoundary>
          <MultipleErrorSources />
        </ThreeErrorBoundary>
      )

      expect(screen.getByText('3D Rendering Error')).toBeInTheDocument()
      expect(screen.getByText('Try Again')).toBeInTheDocument()
    })

    it('should maintain error boundary state across multiple error attempts', async () => {
      let retryAttempts = 0

      const PersistentError = () => {
        throw new Error(`Error attempt ${++retryAttempts}`)
      }

      const TestWrapper = () => {
        const [key, setKey] = React.useState(0)
        
        return (
          <ThreeErrorBoundary key={key}>
            <PersistentError />
            <button 
              onClick={() => setKey(k => k + 1)} 
              data-testid="external-retry"
            >
              External Retry
            </button>
          </ThreeErrorBoundary>
        )
      }

      render(<TestWrapper />)

      expect(screen.getByText('3D Rendering Error')).toBeInTheDocument()
      const initialAttempts = retryAttempts // Capture current count

      // Click retry - should maintain error state and allow recovery attempts
      const user = userEvent.setup()
      await user.click(screen.getByText('Try Again'))

      expect(screen.getByText('3D Rendering Error')).toBeInTheDocument() // Still showing error
      expect(retryAttempts).toBeGreaterThan(initialAttempts) // Error count increased
    })
  })

  describe('Accessibility and User Experience', () => {
    it('should provide accessible error UI', () => {
      const AccessibilityError = () => {
        throw new Error('Accessibility test error')
      }

      render(
        <ThreeErrorBoundary>
          <AccessibilityError />
        </ThreeErrorBoundary>
      )

      const retryButton = screen.getByRole('button', { name: 'Try Again' })
      expect(retryButton).toBeInTheDocument()
      expect(retryButton).toHaveClass('bg-white/10', 'border-white/20', 'text-white')
    })

    it('should provide clear visual hierarchy in error state', () => {
      const UIError = () => {
        throw new Error('UI test error')
      }

      render(
        <ThreeErrorBoundary>
          <UIError />
        </ThreeErrorBoundary>
      )

      // Check visual hierarchy elements
      expect(screen.getByText('🎯')).toBeInTheDocument() // Icon at top
      expect(screen.getByText('3D Rendering Error')).toBeInTheDocument() // Main heading
      expect(screen.getByText(/Your browser may not support/)).toBeInTheDocument() // Description
      expect(screen.getByText('Try Again')).toBeInTheDocument() // Action button
      expect(screen.getByText(/Try updating your browser/)).toBeInTheDocument() // Help text
    })

    it('should handle button interactions correctly', async () => {
      let resetCalled = false

      const InteractionError = () => {
        if (!resetCalled) {
          throw new Error('Interactive error')
        }
        return <div data-testid="recovered">Recovered successfully</div>
      }

      render(
        <ThreeErrorBoundary>
          <InteractionError />
        </ThreeErrorBoundary>
      )

      expect(screen.getByText('3D Rendering Error')).toBeInTheDocument()

      const user = userEvent.setup()
      const retryButton = screen.getByText('Try Again')
      
      // Simulate successful recovery
      resetCalled = true
      await user.click(retryButton)

      expect(screen.getByTestId('recovered')).toBeInTheDocument()
    })
  })

  describe('Component Lifecycle Integration', () => {
    it('should handle errors during component mounting', () => {
      const MountError = () => {
        React.useEffect(() => {
          throw new Error('Mount phase error')
        }, [])
        return <div>Component content</div>
      }

      render(
        <ThreeErrorBoundary>
          <MountError />
        </ThreeErrorBoundary>
      )

      expect(screen.getByText('3D Rendering Error')).toBeInTheDocument()
    })

    it('should handle errors during component updates', () => {
      const UpdateError = ({ shouldError }: { shouldError: boolean }) => {
        if (shouldError) {
          throw new Error('Update phase error')
        }
        return <div data-testid="update-content">Update content</div>
      }

      const { rerender } = render(
        <ThreeErrorBoundary>
          <UpdateError shouldError={false} />
        </ThreeErrorBoundary>
      )

      expect(screen.getByTestId('update-content')).toBeInTheDocument()

      // Trigger error on update
      rerender(
        <ThreeErrorBoundary>
          <UpdateError shouldError={true} />
        </ThreeErrorBoundary>
      )

      expect(screen.getByText('3D Rendering Error')).toBeInTheDocument()
    })
  })
})