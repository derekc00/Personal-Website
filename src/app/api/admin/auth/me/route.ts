import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/middleware'

// GET /api/admin/auth/me - Get current user info
export async function GET(req: NextRequest) {
  return withAuth(async (req: NextRequest, user) => {
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email
      }
    })
  })(req)
}