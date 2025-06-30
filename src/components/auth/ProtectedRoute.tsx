'use client'

import { ReactNode } from 'react'

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
  // TODO: Implement authentication check after DER-62 is merged
  // For now, just render children as placeholder
  
  // Placeholder implementation
  const isAuthenticated = false // Will be replaced with actual auth check
  const userRole = null // Will be replaced with actual user role
  
  if (!isAuthenticated) {
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
  
  if (requiredRole && userRole !== requiredRole && userRole !== 'admin') {
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