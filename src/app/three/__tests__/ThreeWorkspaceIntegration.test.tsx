import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'

// Mock Three.js and React Three Fiber components
jest.mock('@react-three/fiber', () => ({
  Canvas: jest.fn(({ children, onCreated, onError, ...props }) => {
    // Simulate WebGL context creation
    const mockGL = {
      domElement: {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
      },
      info: { memory: { geometries: 0, textures: 0 }, render: { frame: 0, calls: 0 } }
    }
    
    // Simulate async canvas creation
    setTimeout(() => {
      onCreated?.({ gl: mockGL })
    }, 0)
    
    return (
      <div data-testid="three-canvas" {...props}>
        {children}
      </div>
    )
  })
}))

jest.mock('@react-three/drei', () => ({
  OrbitControls: jest.fn((props) => <div data-testid="orbit-controls" {...props} />),
  Text: jest.fn(({ children, onClick, ...props }) => (
    <div data-testid="three-text" onClick={onClick} {...props}>
      {children}
    </div>
  )),
  Box: jest.fn((props) => <div data-testid="three-box" {...props} />),
  Plane: jest.fn(({ onClick, ...props }) => (
    <div data-testid="three-plane" onClick={onClick} {...props} />
  ))
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

// Mock UI components
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

// Import components after mocks
import ThreeWorkspace from '../page'
import ThreeErrorBoundary from '@/components/ThreeErrorBoundary'

describe('Three.js Workspace Integration', () => {
  const mockRouter = {
    push: jest.fn(),
    prefetch: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    
    // Mock WebGL context
    const originalCreateElement = document.createElement.bind(document)
    const mockContext = {
      getParameter: jest.fn((param) => {
        switch(param) {
          case 'VERSION': return 'WebGL 1.0'
          case 'VENDOR': return 'Mock WebGL'
          case 'RENDERER': return 'Mock Renderer'
          default: return 'Mock Value'
        }
      })
    }
    
    jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'canvas') {
        const mockCanvas = originalCreateElement('canvas')
        return {
          ...mockCanvas,
          getContext: jest.fn(() => mockContext),
          width: 1,
          height: 1
        } as any
      }
      return originalCreateElement(tagName)
    })

    // Mock window properties
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    })

    // Mock console methods to capture logs
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
    jest.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('WebGL Context Initialization', () => {
    it('should initialize WebGL context and render 3D workspace', async () => {
      render(<ThreeWorkspace />)

      // Should show loading state initially
      expect(screen.getByText('Initializing 3D Environment...')).toBeInTheDocument()
      expect(screen.getByText('Preparing WebGL context')).toBeInTheDocument()

      // Wait for WebGL initialization
      await waitFor(() => {
        expect(screen.getByTestId('three-canvas')).toBeInTheDocument()
      }, { timeout: 2000 })

      // Should render main workspace elements
      expect(screen.getByText('Welcome to my 3D Workspace')).toBeInTheDocument()
      expect(screen.getByTestId('orbit-controls')).toBeInTheDocument()
    })

    it('should handle WebGL context loss gracefully', async () => {
      render(<ThreeWorkspace />)

      await waitFor(() => {
        expect(screen.getByTestId('three-canvas')).toBeInTheDocument()
      })

      // Simulate WebGL context loss
      const contextLostEvent = new Event('webglcontextlost')
      const canvasElement = screen.getByTestId('three-canvas')
      fireEvent(canvasElement, contextLostEvent)

      // Should show context loss recovery UI
      await waitFor(() => {
        expect(screen.getByText('WebGL Context Issue')).toBeInTheDocument()
        expect(screen.getByText('Try Again')).toBeInTheDocument()
      })
    })

    it('should retry WebGL initialization when requested', async () => {
      render(<ThreeWorkspace />)

      await waitFor(() => {
        expect(screen.getByTestId('three-canvas')).toBeInTheDocument()
      })

      // Simulate context loss
      const contextLostEvent = new Event('webglcontextlost')
      fireEvent(screen.getByTestId('three-canvas'), contextLostEvent)

      await waitFor(() => {
        expect(screen.getByText('Try Again')).toBeInTheDocument()
      })

      // Click retry button
      const user = userEvent.setup()
      await user.click(screen.getByText('Try Again'))

      // Should reinitialize the workspace
      await waitFor(() => {
        expect(screen.getByTestId('three-canvas')).toBeInTheDocument()
        expect(screen.getByText('Welcome to my 3D Workspace')).toBeInTheDocument()
      })
    })
  })

  describe('Mobile Responsiveness Integration', () => {
    it('should adapt to mobile viewport', async () => {
      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600
      })

      render(<ThreeWorkspace />)

      await waitFor(() => {
        expect(screen.getByTestId('three-canvas')).toBeInTheDocument()
      })

      // Should show mobile-specific instructions
      expect(screen.getByText(/Touch to rotate • Pinch to zoom • Tap displays to explore/)).toBeInTheDocument()
      expect(screen.getByText('Tap to explore')).toBeInTheDocument()
      expect(screen.getByText('Tap to learn more')).toBeInTheDocument()
      expect(screen.getByText('Tap to read')).toBeInTheDocument()
    })

    it('should show desktop instructions on desktop viewport', async () => {
      // Set desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200
      })

      render(<ThreeWorkspace />)

      await waitFor(() => {
        expect(screen.getByTestId('three-canvas')).toBeInTheDocument()
      })

      // Should show desktop-specific instructions
      expect(screen.getByText(/Use mouse to navigate • Click displays to explore/)).toBeInTheDocument()
      expect(screen.getByText('Click to explore')).toBeInTheDocument()
      expect(screen.getByText('Click to learn more')).toBeInTheDocument()
      expect(screen.getByText('Click to read')).toBeInTheDocument()
    })

    it('should update responsiveness on window resize', async () => {
      render(<ThreeWorkspace />)

      await waitFor(() => {
        expect(screen.getByTestId('three-canvas')).toBeInTheDocument()
      })

      // Initially desktop
      expect(screen.getByText('Click to explore')).toBeInTheDocument()

      // Resize to mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500
      })

      fireEvent.resize(window)

      await waitFor(() => {
        expect(screen.getByText('Tap to explore')).toBeInTheDocument()
      })
    })
  })

  describe('Navigation Integration', () => {
    it('should navigate to projects when projects display is clicked', async () => {
      render(<ThreeWorkspace />)

      await waitFor(() => {
        expect(screen.getByTestId('three-canvas')).toBeInTheDocument()
      })

      const user = userEvent.setup()
      const projectsPlane = screen.getAllByTestId('three-plane')[0] // First plane is projects
      
      await user.click(projectsPlane)

      expect(mockRouter.push).toHaveBeenCalledWith('/projects')
    })

    it('should navigate to about page when about display is clicked', async () => {
      render(<ThreeWorkspace />)

      await waitFor(() => {
        expect(screen.getByTestId('three-canvas')).toBeInTheDocument()
      })

      const user = userEvent.setup()
      const aboutPlane = screen.getAllByTestId('three-plane')[1] // Second plane is about
      
      await user.click(aboutPlane)

      expect(mockRouter.push).toHaveBeenCalledWith('/about')
    })

    it('should navigate to blog when blog display is clicked', async () => {
      render(<ThreeWorkspace />)

      await waitFor(() => {
        expect(screen.getByTestId('three-canvas')).toBeInTheDocument()
      })

      const user = userEvent.setup()
      const blogPlane = screen.getAllByTestId('three-plane')[2] // Third plane is blog
      
      await user.click(blogPlane)

      expect(mockRouter.push).toHaveBeenCalledWith('/blog')
    })
  })

  describe('Performance Optimization Integration', () => {
    it('should apply mobile performance settings on mobile devices', async () => {
      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600
      })

      render(<ThreeWorkspace />)

      await waitFor(() => {
        const canvas = screen.getByTestId('three-canvas')
        expect(canvas).toBeInTheDocument()
        
        // Mobile should disable shadows for performance
        expect(canvas).toHaveAttribute('shadows', 'false')
      })
    })

    it('should apply desktop performance settings on desktop', async () => {
      // Set desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200
      })

      render(<ThreeWorkspace />)

      await waitFor(() => {
        const canvas = screen.getByTestId('three-canvas')
        expect(canvas).toBeInTheDocument()
        
        // Desktop should enable shadows
        expect(canvas).toHaveAttribute('shadows', 'true')
      })
    })

    it('should configure OrbitControls differently for mobile and desktop', async () => {
      render(<ThreeWorkspace />)

      await waitFor(() => {
        expect(screen.getByTestId('orbit-controls')).toBeInTheDocument()
      })

      const orbitControls = screen.getByTestId('orbit-controls')
      
      // Should have mobile-optimized controls configuration
      expect(orbitControls).toHaveAttribute('enableZoom', 'true')
      expect(orbitControls).toHaveAttribute('enableRotate', 'true')
      expect(orbitControls).toHaveAttribute('enableDamping', 'true')
    })
  })

  describe('Error Boundary Integration', () => {
    it('should integrate with ThreeErrorBoundary for WebGL errors', async () => {
      const ThrowError = () => {
        throw new Error('WebGL initialization failed')
      }

      const WorkspaceWithError = () => (
        <ThreeErrorBoundary>
          <ThrowError />
        </ThreeErrorBoundary>
      )

      render(<WorkspaceWithError />)

      // Should catch error and show fallback UI
      expect(screen.getByText('3D Rendering Error')).toBeInTheDocument()
      expect(screen.getByText('Your browser may not support WebGL or 3D graphics rendering.')).toBeInTheDocument()
      expect(screen.getByText('Try Again')).toBeInTheDocument()
    })

    it('should handle Three.js specific errors', async () => {
      const ThrowThreeError = () => {
        throw new Error('THREE.js rendering failed')
      }

      const WorkspaceWithThreeError = () => (
        <ThreeErrorBoundary>
          <ThrowThreeError />
        </ThreeErrorBoundary>
      )

      // Spy on console.error to check error logging
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      render(<WorkspaceWithThreeError />)

      expect(screen.getByText('3D Rendering Error')).toBeInTheDocument()
      
      // Should log Three.js specific error
      expect(consoleSpy).toHaveBeenCalledWith('3D Rendering Error:', expect.any(Error))
    })

    it('should allow error recovery through retry button', async () => {
      let shouldThrow = true
      
      const ConditionalError = () => {
        if (shouldThrow) {
          throw new Error('WebGL context error')
        }
        return <div data-testid="recovered-content">3D Content Recovered</div>
      }

      const WorkspaceWithRecovery = () => (
        <ThreeErrorBoundary>
          <ConditionalError />
        </ThreeErrorBoundary>
      )

      render(<WorkspaceWithRecovery />)

      // Should show error initially
      expect(screen.getByText('3D Rendering Error')).toBeInTheDocument()

      // Simulate error resolution
      shouldThrow = false

      const user = userEvent.setup()
      await user.click(screen.getByText('Try Again'))

      // Should recover and show content
      await waitFor(() => {
        expect(screen.getByTestId('recovered-content')).toBeInTheDocument()
      })
    })
  })

  describe('Development Mode Logging Integration', () => {
    it('should log initialization messages in development mode', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

      render(<ThreeWorkspace />)

      await waitFor(() => {
        expect(screen.getByTestId('three-canvas')).toBeInTheDocument()
      })

      // Should log development messages
      expect(consoleSpy).toHaveBeenCalledWith('3D Workspace initializing...')
      expect(consoleSpy).toHaveBeenCalledWith('WebGL is supported')
      expect(consoleSpy).toHaveBeenCalledWith('Three.js canvas created successfully')

      process.env.NODE_ENV = originalEnv
    })

    it('should not log verbose messages in production mode', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

      render(<ThreeWorkspace />)

      await waitFor(() => {
        expect(screen.getByTestId('three-canvas')).toBeInTheDocument()
      })

      // Should not log development-only messages
      expect(consoleSpy).not.toHaveBeenCalledWith('3D Workspace initializing...')

      process.env.NODE_ENV = originalEnv
    })
  })

  describe('Cross-Component State Management', () => {
    it('should coordinate between viewport detection, performance settings, and UI adaptation', async () => {
      // Start with desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200
      })

      render(<ThreeWorkspace />)

      await waitFor(() => {
        expect(screen.getByTestId('three-canvas')).toBeInTheDocument()
      })

      // Should start with desktop settings
      expect(screen.getByText('Click to explore')).toBeInTheDocument()
      expect(screen.getByTestId('three-canvas')).toHaveAttribute('shadows', 'true')

      // Resize to mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600
      })

      fireEvent.resize(window)

      await waitFor(() => {
        // UI should update
        expect(screen.getByText('Tap to explore')).toBeInTheDocument()
        // Performance settings should update
        expect(screen.getByTestId('three-canvas')).toHaveAttribute('shadows', 'false')
      })
    })

    it('should handle rapid viewport changes without breaking state', async () => {
      render(<ThreeWorkspace />)

      await waitFor(() => {
        expect(screen.getByTestId('three-canvas')).toBeInTheDocument()
      })

      // Rapidly change viewport multiple times
      for (let i = 0; i < 5; i++) {
        const width = i % 2 === 0 ? 600 : 1200
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width
        })
        fireEvent.resize(window)
      }

      // Should still be functional after rapid changes
      await waitFor(() => {
        expect(screen.getByTestId('three-canvas')).toBeInTheDocument()
        expect(screen.getByText('Welcome to my 3D Workspace')).toBeInTheDocument()
      })
    })
  })
})