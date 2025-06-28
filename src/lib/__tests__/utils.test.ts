import { describe, it, expect } from '@jest/globals'
import { cn } from '../utils'

describe('utils', () => {
  describe('cn function', () => {
    it('should merge class names correctly', () => {
      const result = cn('text-base', 'text-lg')
      expect(result).toBe('text-lg')
    })

    it('should handle single class name', () => {
      const result = cn('bg-blue-500')
      expect(result).toBe('bg-blue-500')
    })

    it('should handle multiple class names', () => {
      const result = cn('flex', 'items-center', 'justify-center')
      expect(result).toBe('flex items-center justify-center')
    })

    it('should handle conditional classes', () => {
      const isActive = true
      const result = cn('base-class', isActive && 'active-class')
      expect(result).toBe('base-class active-class')
    })

    it('should filter out falsy values', () => {
      const result = cn('valid-class', false, null, undefined, '', 'another-valid-class')
      expect(result).toBe('valid-class another-valid-class')
    })

    it('should handle empty input', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('should handle arrays of classes', () => {
      const result = cn(['class1', 'class2'], 'class3')
      expect(result).toBe('class1 class2 class3')
    })

    it('should handle objects with boolean values', () => {
      const result = cn({
        'active': true,
        'disabled': false,
        'highlighted': true
      })
      expect(result).toBe('active highlighted')
    })

    it('should resolve tailwind conflicts correctly', () => {
      const result = cn('p-4', 'p-8')
      expect(result).toBe('p-8')
    })

    it('should handle complex combinations', () => {
      const isActive = true
      const isDisabled = false
      const result = cn(
        'base-class',
        'flex items-center',
        {
          'active-state': isActive,
          'disabled-state': isDisabled
        },
        isActive && 'conditional-active',
        'final-class'
      )
      expect(result).toBe('base-class flex items-center active-state conditional-active final-class')
    })

    it('should handle nested arrays and objects', () => {
      const result = cn(
        ['base', 'flex'],
        {
          'active': true,
          'hidden': false
        },
        [['nested', 'array'], 'more-classes']
      )
      expect(result).toBe('base flex active nested array more-classes')
    })

    it('should handle string interpolation patterns', () => {
      const variant = 'primary'
      const size = 'lg'
      const result = cn(
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        'rounded'
      )
      expect(result).toBe('btn btn-primary btn-lg rounded')
    })

    it('should prioritize later classes in tailwind conflicts', () => {
      const result = cn(
        'text-sm bg-red-500 p-2',
        'text-lg bg-blue-500 p-4',
        'text-xl'
      )
      expect(result).toBe('bg-blue-500 p-4 text-xl')
    })
  })
})