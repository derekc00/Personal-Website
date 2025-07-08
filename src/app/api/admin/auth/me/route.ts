import { NextRequest, NextResponse } from 'next/server'
import { withAuth, type AuthenticatedRequest } from '@/lib/api/middleware'

// GET /api/admin/auth/me - Get current user info
export async function GET(req: NextRequest) {
  return withAuth(async (req: AuthenticatedRequest) => {
    return NextResponse.json({
      success: true,
      data: {
        id: req.user!.id,
        email: req.user!.email
      }
    })
  })(req)
}