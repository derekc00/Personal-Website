import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Login',
  description: 'Administrator login page',
}

export default function AdminLogin() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Sign In
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access the administrative dashboard
          </p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Authentication will be available after DER-62 is merged.
            </p>
            <div className="animate-pulse bg-gray-200 h-10 rounded mb-4"></div>
            <div className="animate-pulse bg-gray-200 h-10 rounded mb-4"></div>
            <div className="animate-pulse bg-gray-200 h-10 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  )
}