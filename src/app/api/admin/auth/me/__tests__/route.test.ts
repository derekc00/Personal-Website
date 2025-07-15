import { NextRequest, NextResponse } from 'next/server'
import { GET } from '../route'
import * as middleware from '@/lib/api/middleware'
import type { ApiAuthenticatedUser } from '@/lib/types/auth'
import { TEST_USERS, TEST_URLS } from '@/test/constants'
import { HTTP_STATUS } from '@/lib/constants'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/api/middleware')

describe('/api/admin/auth/me', () => {
  const mockUser: ApiAuthenticatedUser = TEST_USERS.EDITOR

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return current user info', async () => {
    vi.spyOn(middleware, 'withAuth').mockImplementation(
      (handler: any) => 
        (req: NextRequest) => {
          // Create extended request with user property like the real withAuth does
          const extendedReq = Object.assign(req, { user: mockUser })
          return handler(extendedReq)
        }
    )

    const req = new NextRequest(TEST_URLS.ADMIN_AUTH_ME)
    const response = await GET(req)
    const body = await response.json()

    expect(response.status).toBe(HTTP_STATUS.OK)
    expect(body).toEqual({
      success: true,
      data: {
        id: mockUser.id,
        email: mockUser.email
      }
    })
  })
})