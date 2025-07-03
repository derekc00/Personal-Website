import { Metadata } from 'next'
import AdminHeader from '@/components/admin/AdminHeader'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

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
  // Don't wrap auth pages with protection
  return <>{children}</>
}