import type { NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Only match admin routes for authentication
     * This improves performance by not running middleware on public routes
     */
    '/(admin|api/admin)/:path*'
  ],
}