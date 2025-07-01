'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { hasRole } from '@/lib/auth'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: 'admin' | 'editor'
  fallback?: ReactNode
}

export default function ProtectedRoute({ 
  children, 
  requiredRole = 'admin',
  fallback 
}: ProtectedRouteProps) {
  const router = useRouter()
  const { user, loading } = useAuth()
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/auth/login')
    }
  }, [user, loading, router])
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  if (!user) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to access this area.</p>
          <a 
            href="/admin/auth/login"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    )
  }
  
  if (requiredRole && !hasRole(user, requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don&apos;t have permission to access this area.</p>
        </div>
      </div>
    )
  }
  
  return <>{children}</>
}