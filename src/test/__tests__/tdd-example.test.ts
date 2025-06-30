import { describe, it, expect } from '@jest/globals'

/**
 * TDD Example: Implementing a simple blog post formatter
 * 
 * This demonstrates the Red-Green-Refactor cycle:
 * 1. RED: Write a failing test
 * 2. GREEN: Write minimal code to make it pass
 * 3. REFACTOR: Improve the code while keeping tests green
 */

// Step 1: RED - Write failing test first
describe('Blog Post Formatter (TDD Example)', () => {
  it('should format blog post title with proper capitalization', () => {
    // This test will fail initially - we haven't implemented formatTitle yet
    expect(formatTitle('hello world')).toBe('Hello World')
  })

  it('should handle empty strings', () => {
    expect(formatTitle('')).toBe('')
  })

  it('should handle single words', () => {
    expect(formatTitle('javascript')).toBe('Javascript')
  })

  it('should handle mixed case words by capitalizing each word', () => {
    expect(formatTitle('JavaScript and TypeScript')).toBe('Javascript And Typescript')
  })
})

// Step 2: GREEN - Implement minimal code to make tests pass
function formatTitle(title: string): string {
  if (!title) return ''
  
  return title
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// Step 3: REFACTOR - Improve the implementation while keeping tests green
// In a real scenario, we might refactor to handle edge cases, performance, etc.
// For now, our implementation is clean and handles the requirements

/**
 * TDD Workflow Demonstrated:
 * 
 * 1. We wrote tests FIRST (Red phase)
 * 2. We implemented the minimal code to pass (Green phase)  
 * 3. We could refactor if needed (Refactor phase)
 * 
 * This ensures:
 * - All code is tested
 * - We only write code that's needed
 * - Refactoring is safe with test coverage
 */