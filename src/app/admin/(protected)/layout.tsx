import { Metadata } from 'next'
import { AdminProtectedRoute } from './components/AdminProtectedRoute'
import { AdminShell } from './components/AdminShell'

export const metadata: Metadata = {
  title: {
    template: '%s | Admin Panel',
    default: 'Admin Panel',
  },
  description: 'Administrative dashboard for content management',
}

export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminProtectedRoute>
      <AdminShell>
        {children}
      </AdminShell>
    </AdminProtectedRoute>
  )
}