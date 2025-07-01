/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render } from '@testing-library/react'
import PublicLayout from '../layout'

// Mock the Header and Footer components
jest.mock('@/app/components/Header', () => ({
  __esModule: true,
  default: () => <header data-testid="public-header">Public Header</header>
}))

jest.mock('@/app/components/Footer', () => ({
  __esModule: true,
  default: () => <footer data-testid="public-footer">Public Footer</footer>
}))

describe('PublicLayout', () => {
  it('should render public site header and footer', () => {
    const { getByTestId, getByText } = render(
      <PublicLayout>
        <div>Test Content</div>
      </PublicLayout>
    )

    // Check that public header and footer ARE present
    expect(getByTestId('public-header')).toBeInTheDocument()
    expect(getByText('Public Header')).toBeInTheDocument()
    
    expect(getByTestId('public-footer')).toBeInTheDocument()
    expect(getByText('Public Footer')).toBeInTheDocument()

    // Check that content is rendered
    expect(getByText('Test Content')).toBeInTheDocument()
  })

  it('should not render admin-specific elements', () => {
    const { queryByTestId, queryByText } = render(
      <PublicLayout>
        <div>Test Content</div>
      </PublicLayout>
    )

    // Check that admin-specific elements are NOT present
    expect(queryByTestId('admin-shell')).not.toBeInTheDocument()
    expect(queryByTestId('admin-nav')).not.toBeInTheDocument()
    expect(queryByText('Admin Panel')).not.toBeInTheDocument()
    expect(queryByText('Dashboard')).not.toBeInTheDocument()
    expect(queryByText('Logout')).not.toBeInTheDocument()
  })
})