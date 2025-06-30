'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

export default function AdminHeader() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  
  const handleSignOut = async () => {
    await signOut()
    router.push('/admin/auth/login')
  }
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{user.email}</span>
                  <span className="mx-2">•</span>
                  <span className="text-gray-500">{user.role}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-700 hover:text-gray-900 font-medium px-3 py-1 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}