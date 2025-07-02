import '@testing-library/jest-dom'
import React from 'react'
import { beforeAll, afterEach, afterAll } from '@jest/globals'
import { server } from './mocks/server'

// Make React available globally for tests
global.React = React

// Establish API mocking before all tests
beforeAll(() => server.listen())

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => server.resetHandlers())

// Clean up after the tests are finished
afterAll(() => server.close())