/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render } from '@testing-library/react'
import AdminLayout from '../layout'

// Mock the admin components
jest.mock('../components/AdminProtectedRoute', () => ({
  AdminProtectedRoute: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

jest.mock('../components/AdminShell', () => ({
  AdminShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="admin-shell">
      <nav data-testid="admin-nav">Admin Navigation</nav>
      {children}
    </div>
  )
}))

describe('AdminLayout', () => {
  it('should render admin shell without public header/footer', () => {
    const { getByTestId, queryByTestId } = render(
      <AdminLayout>
        <div data-testid="test-content">Test Content</div>
      </AdminLayout>
    )

    // Check that admin shell is rendered
    expect(getByTestId('admin-shell')).toBeInTheDocument()
    expect(getByTestId('admin-nav')).toBeInTheDocument()
    expect(getByTestId('test-content')).toBeInTheDocument()

    // Public header/footer should NOT be present
    // These would be identified by specific test IDs if they were rendered
    expect(queryByTestId('public-header')).not.toBeInTheDocument()
    expect(queryByTestId('public-footer')).not.toBeInTheDocument()
  })
})