import { Metadata } from 'next'
import AdminHeader from '@/components/admin/AdminHeader'
import AdminSidebar from '@/components/admin/AdminSidebar'

export const metadata: Metadata = {
  title: {
    template: '%s | Admin Panel',
    default: 'Admin Panel',
  },
  description: 'Administrative dashboard for content management',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* TODO: Wrap with ProtectedRoute after DER-62 is merged */}
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}