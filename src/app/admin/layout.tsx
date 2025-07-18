import { Metadata } from 'next'

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