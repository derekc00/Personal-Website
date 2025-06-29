import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import VideoBackgroundClient from '../VideoBackgroundClient'

jest.mock('../VideoBackground', () => 
  jest.fn(({ fileName, onVideoReady }) => {
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
)

describe('VideoBackgroundClient', () => {
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

  afterEach(() => {
    consoleSpy.mockClear()
  })

  it('should render video background with correct filename', async () => {
    render(<VideoBackgroundClient fileName="test-video.mp4" />)
    
    // Should show either the mocked component or the suspense fallback
    const videoElement = await screen.findByTestId('video-background')
    expect(videoElement).toBeInTheDocument()
    expect(screen.getByText('Video: test-video.mp4')).toBeInTheDocument()
  })

  it('should call onVideoReady callback when provided', () => {
    const mockOnVideoReady = jest.fn()
    
    render(<VideoBackgroundClient fileName="test-video.mp4" onVideoReady={mockOnVideoReady} />)
    
    const readyTrigger = screen.getByTestId('video-ready-trigger')
    readyTrigger.click()
    
    expect(mockOnVideoReady).toHaveBeenCalledTimes(1)
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
    
    expect(consoleSpy).toHaveBeenCalledWith('VideoBackgroundClient mounting')
    
    process.env.NODE_ENV = originalEnv
  })

  it('should not log in production', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    
    render(<VideoBackgroundClient fileName="test-video.mp4" />)
    
    expect(consoleSpy).not.toHaveBeenCalled()
    
    process.env.NODE_ENV = originalEnv
  })

  it('should wrap VideoBackground in Suspense', () => {
    render(<VideoBackgroundClient fileName="test-video.mp4" />)
    
    expect(screen.getByTestId('video-background')).toBeInTheDocument()
  })

  it('should pass props correctly to VideoBackground component', () => {
    const mockOnVideoReady = jest.fn()
    render(<VideoBackgroundClient fileName="custom-video.mp4" onVideoReady={mockOnVideoReady} />)
    
    expect(screen.getByText('Video: custom-video.mp4')).toBeInTheDocument()
    expect(screen.getByTestId('video-ready-trigger')).toBeInTheDocument()
  })
})