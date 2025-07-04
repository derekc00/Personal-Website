'use client'

import { useCallback } from 'react'

interface MDXTextareaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  rows?: number
}

export function MDXTextarea({ 
  value, 
  onChange, 
  placeholder = "Write your MDX content here...",
  className = "",
  rows = 20 
}: MDXTextareaProps) {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }, [onChange])

  return (
    <textarea
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      rows={rows}
      className={`w-full px-4 py-3 border rounded-md bg-background font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 ${className}`}
      spellCheck={false}
    />
  )
}