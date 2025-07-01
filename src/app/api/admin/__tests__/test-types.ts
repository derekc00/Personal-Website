import { NextRequest, NextResponse } from 'next/server'
import type { AuthenticatedUser } from '@/lib/api/middleware'

export type RouteHandler = (req: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>
export type MockWithRoleImplementation = () => (handler: RouteHandler) => (req: NextRequest) => Promise<NextResponse>