import { Metadata } from 'next'
import { AdminDashboard } from './components/AdminDashboard'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Administrative dashboard for content management',
}

export default function AdminPage() {
  return <AdminDashboard />
}