export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen" role="status" aria-live="polite">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" aria-label="Loading"></div>
      <span className="sr-only">Loading admin dashboard...</span>
    </div>
  )
}