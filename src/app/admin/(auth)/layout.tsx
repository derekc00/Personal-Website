import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | Admin Auth',
    default: 'Admin Authentication',
  },
  description: 'Admin authentication',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {children}
    </div>
  )
}