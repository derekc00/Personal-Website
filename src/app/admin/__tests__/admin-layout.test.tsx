/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render } from '@testing-library/react'
import AdminLayout from '../layout'

describe('AdminLayout', () => {
  it('should render children without any wrapping', () => {
    const { getByTestId } = render(
      <AdminLayout>
        <div data-testid="test-content">Test Content</div>
      </AdminLayout>
    )

    // The layout simply renders children
    expect(getByTestId('test-content')).toBeInTheDocument()
  })

  it('should render multiple children', () => {
    const { getByTestId } = render(
      <AdminLayout>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </AdminLayout>
    )

    expect(getByTestId('child-1')).toBeInTheDocument()
    expect(getByTestId('child-2')).toBeInTheDocument()
  })
})