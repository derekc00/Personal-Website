import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import AdminHeader from '@/components/admin/AdminHeader'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { getServerAuthenticatedUser } from '@/lib/auth-server'

export const metadata: Metadata = {
  title: {
    template: '%s | Admin Dashboard',
    default: 'Admin Dashboard',
  },
  description: 'Administrative dashboard',
}

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getServerAuthenticatedUser()
  
  if (!user) {
    redirect('/admin/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 antialiased">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}