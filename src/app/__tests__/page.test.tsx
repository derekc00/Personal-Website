import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Home from '../(public)/page'
import { cleanupTest, setupConsoleSpy } from '@/test/test-utils'

vi.mock('@/components/VideoBackgroundClient', () => ({
  default: vi.fn(({ fileName, onVideoReady }) => {
    return (
      <div data-testid="video-background-client">
        <div>Video: {fileName}</div>
        {onVideoReady && (
          <button onClick={onVideoReady} data-testid="video-ready-trigger">
            Trigger Video Ready
          </button>
        )}
      </div>
    )
  })
}))

vi.mock('@/components/ErrorBoundary', () => ({
  default: vi.fn(({ children }) => <div data-testid="error-boundary">{children}</div>)
}))

vi.mock('typewriter-effect', () => ({
  default: vi.fn(({ onInit }) => {
    const mockTypewriter = {
      typeString: vi.fn().mockReturnThis(),
      pauseFor: vi.fn().mockReturnThis(),
      start: vi.fn()
    }
    
    if (onInit) {
      onInit(mockTypewriter)
    }
    
    return <div data-testid="typewriter">Welcome to Derek&apos;s website</div>
  })
}))

describe('Home', () => {
  let consoleSpy: ReturnType<typeof setupConsoleSpy>
  let consoleErrorSpy: ReturnType<typeof setupConsoleSpy>

  beforeEach(() => {
    // Set up fresh console spies for each test
    consoleSpy = setupConsoleSpy('log')
    consoleErrorSpy = setupConsoleSpy('error')
  })

  afterEach(() => {
    // Comprehensive cleanup
    cleanupTest()
    consoleSpy.cleanup()
    consoleErrorSpy.cleanup()
  })

  it('should render homepage with video background', () => {
    render(<Home />)
    
    expect(screen.getByTestId('video-background-client')).toBeInTheDocument()
    expect(screen.getByText('Video: derek-in-the-park-FVGcatY5vGoJYmtDg1HDIA207UwXMj.mp4')).toBeInTheDocument()
  })

  it('should render within error boundaries', () => {
    render(<Home />)
    
    // Check that error boundaries are present (there are multiple nested ones)
    const errorBoundaries = screen.getAllByTestId('error-boundary')
    expect(errorBoundaries).toHaveLength(2)
    expect(errorBoundaries[0]).toBeInTheDocument()
  })

  it('should show typewriter animation when video is ready', async () => {
    render(<Home />)
    
    // Initially typewriter should not be visible
    expect(screen.queryByTestId('typewriter')).not.toBeInTheDocument()
    
    // Trigger video ready
    const videoReadyTrigger = screen.getByTestId('video-ready-trigger')
    fireEvent.click(videoReadyTrigger)
    
    // Wait for typewriter to appear
    await waitFor(() => {
      expect(screen.getByTestId('typewriter')).toBeInTheDocument()
    })
  })

  it('should not show typewriter before video is ready', () => {
    render(<Home />)
    
    expect(screen.queryByTestId('typewriter')).not.toBeInTheDocument()
  })

  it('should log debug messages in development', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'
    
    render(<Home />)
    
    expect(consoleSpy.spy).toHaveBeenCalledWith('Homepage mounting - client side')
    
    // Trigger video ready to test the video ready log
    const videoReadyTrigger = screen.getByTestId('video-ready-trigger')
    fireEvent.click(videoReadyTrigger)
    
    expect(consoleSpy.spy).toHaveBeenCalledWith('Video ready, starting typewriter animation')
    
    process.env.NODE_ENV = originalEnv
  })

  it('should not log in production', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    
    render(<Home />)
    
    // Trigger video ready
    const videoReadyTrigger = screen.getByTestId('video-ready-trigger')
    fireEvent.click(videoReadyTrigger)
    
    expect(consoleSpy.spy).not.toHaveBeenCalled()
    
    process.env.NODE_ENV = originalEnv
  })

  it('should render without throwing errors', () => {
    expect(() => {
      render(<Home />)
    }).not.toThrow()
  })

  it('should have expected structure and components', () => {
    render(<Home />)
    
    // Check that VideoBackgroundClient is rendered
    expect(screen.getByTestId('video-background-client')).toBeInTheDocument()
    
    // Check that error boundaries are in place
    expect(screen.getAllByTestId('error-boundary')).toHaveLength(2)
    
    // Check that the video ready trigger exists (part of the interface)
    expect(screen.getByTestId('video-ready-trigger')).toBeInTheDocument()
  })

  it('should manage video ready state correctly', async () => {
    render(<Home />)
    
    // Video should start as not ready
    expect(screen.queryByTestId('typewriter')).not.toBeInTheDocument()
    
    // Trigger video ready
    const videoReadyTrigger = screen.getByTestId('video-ready-trigger')
    fireEvent.click(videoReadyTrigger)
    
    // Typewriter should now be visible
    await waitFor(() => {
      expect(screen.getByTestId('typewriter')).toBeInTheDocument()
    })
  })
})