import { NextRequest, NextResponse } from 'next/server'
import { GET } from '../route'
import * as middleware from '@/lib/api/middleware'
import type { AuthenticatedUser } from '@/lib/api/middleware'

jest.mock('@/lib/api/middleware')

describe('/api/admin/auth/me', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    role: 'editor' as const
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return current user info', async () => {
    jest.spyOn(middleware, 'withAuth').mockImplementation(
      (handler: (req: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>) => 
        (req: NextRequest) => handler(req, mockUser)
    )

    const req = new NextRequest('http://localhost:3000/api/admin/auth/me')
    const response = await GET(req)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({
      success: true,
      data: {
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role
      }
    })
  })
})