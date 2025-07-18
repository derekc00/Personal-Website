import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import VideoBackgroundClient from '../VideoBackgroundClient'
import { cleanupTest, setupConsoleSpy } from '@/test/test-utils'

vi.mock('../VideoBackground', () => ({
  default: vi.fn(({ fileName, onVideoReady }) => {
    return (
      <div data-testid="video-background">
        Video: {fileName}
        {onVideoReady && (
          <button onClick={onVideoReady} data-testid="video-ready-trigger">
            Trigger Ready
          </button>
        )}
      </div>
    )
  })
}))

describe('VideoBackgroundClient', () => {
  let consoleSpy: ReturnType<typeof setupConsoleSpy>

  beforeEach(() => {
    consoleSpy = setupConsoleSpy('log')
  })

  afterEach(() => {
    cleanupTest()
    consoleSpy.cleanup()
  })

  it('should render video background with correct filename', () => {
    render(<VideoBackgroundClient fileName="test-video.mp4" />)
    
    expect(screen.getByTestId('video-background')).toBeInTheDocument()
    expect(screen.getByText('Video: test-video.mp4')).toBeInTheDocument()
  })

  it('should call onVideoReady callback when provided', () => {
    const mockOnVideoReady = vi.fn()
    
    render(<VideoBackgroundClient fileName="test-video.mp4" onVideoReady={mockOnVideoReady} />)
    
    const readyTrigger = screen.getByTestId('video-ready-trigger')
    readyTrigger.click()
    
    expect(mockOnVideoReady).toHaveBeenCalledOnce()
  })

  it('should handle missing onVideoReady callback gracefully', () => {
    expect(() => {
      render(<VideoBackgroundClient fileName="test-video.mp4" />)
    }).not.toThrow()
  })

  it('should log debug message in development', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'
    
    render(<VideoBackgroundClient fileName="test-video.mp4" />)
    
    expect(consoleSpy.spy).toHaveBeenCalledWith('VideoBackgroundClient mounting')
    
    process.env.NODE_ENV = originalEnv
  })

  it('should not log in production', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    
    render(<VideoBackgroundClient fileName="test-video.mp4" />)
    
    expect(consoleSpy.spy).not.toHaveBeenCalled()
    
    process.env.NODE_ENV = originalEnv
  })

  it('should wrap VideoBackground in Suspense', () => {
    render(<VideoBackgroundClient fileName="test-video.mp4" />)
    
    expect(screen.getByTestId('video-background')).toBeInTheDocument()
  })

  it('should pass props correctly to VideoBackground component', () => {
    const mockOnVideoReady = vi.fn()
    render(<VideoBackgroundClient fileName="custom-video.mp4" onVideoReady={mockOnVideoReady} />)
    
    expect(screen.getByText('Video: custom-video.mp4')).toBeInTheDocument()
    expect(screen.getByTestId('video-ready-trigger')).toBeInTheDocument()
  })
})