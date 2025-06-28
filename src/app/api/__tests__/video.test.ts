import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '../video/route'
import { list } from '@vercel/blob'

vi.mock('@vercel/blob', () => ({
  list: vi.fn(),
}))

const mockList = vi.mocked(list)

describe('/api/video', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('should return video URL when fileName provided and video exists', async () => {
    const mockBlobs = [
      { url: 'https://blob.vercel-storage.com/test-video.mp4' }
    ]
    mockList.mockResolvedValue({ blobs: mockBlobs })

    const request = new Request('http://localhost:3000/api/video?fileName=test-video.mp4')
    const response = await GET(request)
    const data = await response.json()

    expect(mockList).toHaveBeenCalledWith({
      prefix: 'test-video.mp4',
      limit: 1,
    })
    expect(response.status).toBe(200)
    expect(data).toEqual({ url: 'https://blob.vercel-storage.com/test-video.mp4' })
    expect(console.log).toHaveBeenCalledWith('API: Loading video: test-video.mp4')
    expect(console.log).toHaveBeenCalledWith('API: Video loaded successfully: https://blob.vercel-storage.com/test-video.mp4')
  })

  it('should return 400 when fileName parameter is missing', async () => {
    const request = new Request('http://localhost:3000/api/video')
    const response = await GET(request)
    const data = await response.json()

    expect(mockList).not.toHaveBeenCalled()
    expect(response.status).toBe(400)
    expect(data).toEqual({ error: 'fileName parameter is required' })
  })

  it('should return 404 when video not found', async () => {
    mockList.mockResolvedValue({ blobs: [] })

    const request = new Request('http://localhost:3000/api/video?fileName=nonexistent.mp4')
    const response = await GET(request)
    const data = await response.json()

    expect(mockList).toHaveBeenCalledWith({
      prefix: 'nonexistent.mp4',
      limit: 1,
    })
    expect(response.status).toBe(404)
    expect(data).toEqual({ error: 'Video not found' })
    expect(console.log).toHaveBeenCalledWith('API: Loading video: nonexistent.mp4')
    expect(console.warn).toHaveBeenCalledWith('API: No video found with filename: nonexistent.mp4')
  })

  it('should return 404 when blobs is null', async () => {
    mockList.mockResolvedValue({ blobs: null })

    const request = new Request('http://localhost:3000/api/video?fileName=test.mp4')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data).toEqual({ error: 'Video not found' })
  })

  it('should return 500 when Vercel Blob API throws an error', async () => {
    const mockError = new Error('Vercel Blob service unavailable')
    mockList.mockRejectedValue(mockError)

    const request = new Request('http://localhost:3000/api/video?fileName=test.mp4')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Vercel Blob service unavailable' })
    expect(console.error).toHaveBeenCalledWith('API: Error loading video from Vercel Blob:', mockError)
  })

  it('should return 500 with generic error message when error is not Error instance', async () => {
    mockList.mockRejectedValue('String error')

    const request = new Request('http://localhost:3000/api/video?fileName=test.mp4')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Unknown error' })
  })
})