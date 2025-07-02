import { GET } from '../video/route'
import { list } from '@vercel/blob'
import { HTTP_STATUS, ERROR_MESSAGES } from '@/lib/constants'
import { TEST_URLS, TEST_VIDEO } from '@/test/constants'

jest.mock('@vercel/blob', () => ({
  list: jest.fn(),
}))

const mockList = jest.mocked(list)

describe('/api/video', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('should return video URL when fileName provided and video exists', async () => {
    const mockBlobs = [
      { url: TEST_VIDEO.BLOB_URL }
    ]
    mockList.mockResolvedValue({ blobs: mockBlobs })

    const request = new Request(`${TEST_URLS.API_VIDEO}?fileName=${TEST_VIDEO.FILENAME}`)
    const response = await GET(request)
    const data = await response.json()

    expect(mockList).toHaveBeenCalledWith({
      prefix: TEST_VIDEO.FILENAME,
      limit: 1,
    })
    expect(response.status).toBe(HTTP_STATUS.OK)
    expect(data).toEqual({ url: TEST_VIDEO.BLOB_URL })
    expect(console.log).toHaveBeenCalledWith(`API: Loading video: ${TEST_VIDEO.FILENAME}`)
    expect(console.log).toHaveBeenCalledWith(`API: Video loaded successfully: ${TEST_VIDEO.BLOB_URL}`)
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
    expect(response.status).toBe(HTTP_STATUS.NOT_FOUND)
    expect(data).toEqual({ error: ERROR_MESSAGES.VIDEO_NOT_FOUND })
    expect(console.log).toHaveBeenCalledWith('API: Loading video: nonexistent.mp4')
    expect(console.warn).toHaveBeenCalledWith('API: No video found with filename: nonexistent.mp4')
  })

  it('should return 404 when blobs is null', async () => {
    mockList.mockResolvedValue({ blobs: null })

    const request = new Request(`${TEST_URLS.API_VIDEO}?fileName=test.mp4`)
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(HTTP_STATUS.NOT_FOUND)
    expect(data).toEqual({ error: ERROR_MESSAGES.VIDEO_NOT_FOUND })
  })

  it('should return 500 when Vercel Blob API throws an error', async () => {
    const mockError = new Error('Vercel Blob service unavailable')
    mockList.mockRejectedValue(mockError)

    const request = new Request(`${TEST_URLS.API_VIDEO}?fileName=test.mp4`)
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    expect(data).toEqual({ error: 'Vercel Blob service unavailable' })
    expect(console.error).toHaveBeenCalledWith('API: Error loading video from Vercel Blob:', mockError)
  })

  it('should return 500 with generic error message when error is not Error instance', async () => {
    mockList.mockRejectedValue('String error')

    const request = new Request(`${TEST_URLS.API_VIDEO}?fileName=test.mp4`)
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    expect(data).toEqual({ error: 'Unknown error' })
  })
})