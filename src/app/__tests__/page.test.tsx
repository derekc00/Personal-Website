import { describe, it, expect, jest } from '@jest/globals'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'

// Mock the components using the default export pattern
jest.mock('@/components/VideoBackgroundClient', () => {
  const MockVideoBackgroundClient = ({ fileName, onVideoReady }: { fileName: string; onVideoReady?: () => void }) => (
    <div data-testid="video-background-client">
      <div>Video: {fileName}</div>
      {onVideoReady && (
        <button onClick={onVideoReady} data-testid="video-ready-trigger">
          Trigger Video Ready
        </button>
      )}
    </div>
  )
  MockVideoBackgroundClient.displayName = 'MockVideoBackgroundClient'
  return {
    __esModule: true,
    default: MockVideoBackgroundClient
  }
})

jest.mock('@/components/ErrorBoundary', () => {
  const MockErrorBoundary = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  )
  MockErrorBoundary.displayName = 'MockErrorBoundary'
  return {
    __esModule: true,
    default: MockErrorBoundary
  }
})

jest.mock('typewriter-effect', () => {
  const MockTypewriter = ({ onInit }: { onInit?: (typewriter: { typeString: jest.Mock; pauseFor: jest.Mock; start: jest.Mock }) => void }) => {
    const mockTypewriter = {
      typeString: jest.fn().mockReturnThis(),
      pauseFor: jest.fn().mockReturnThis(),
      start: jest.fn()
    }
    
    if (onInit) {
      onInit(mockTypewriter)
    }
    
    return <div data-testid="typewriter">Welcome to Derek&apos;s website</div>
  }
  MockTypewriter.displayName = 'MockTypewriter'
  return {
    __esModule: true,
    default: MockTypewriter
  }
})

// Import the component after the mocks are set up
import Home from '../page'

describe('Home', () => {
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

  afterEach(() => {
    consoleSpy.mockClear()
    consoleErrorSpy.mockClear()
  })

  it('should render homepage with video background', () => {
    render(<Home />)
    
    expect(screen.getByTestId('video-background-client')).toBeInTheDocument()
    expect(screen.getByText('Video: derek-in-the-park-FVGcatY5vGoJYmtDg1HDIA207UwXMj.mp4')).toBeInTheDocument()
  })

  it('should render within error boundaries', () => {
    render(<Home />)
    
    const errorBoundaries = screen.getAllByTestId('error-boundary')
    expect(errorBoundaries).toHaveLength(2) // Outer and inner error boundary
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
    
    expect(consoleSpy).toHaveBeenCalledWith('Homepage mounting - client side')
    
    // Trigger video ready to test the video ready log
    const videoReadyTrigger = screen.getByTestId('video-ready-trigger')
    fireEvent.click(videoReadyTrigger)
    
    expect(consoleSpy).toHaveBeenCalledWith('Video ready, starting typewriter animation')
    
    process.env.NODE_ENV = originalEnv
  })

  it('should not log in production', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    
    render(<Home />)
    
    // Trigger video ready
    const videoReadyTrigger = screen.getByTestId('video-ready-trigger')
    fireEvent.click(videoReadyTrigger)
    
    expect(consoleSpy).not.toHaveBeenCalled()
    
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