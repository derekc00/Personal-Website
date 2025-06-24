import { z } from 'zod'

// Schema for MDX frontmatter
export const FrontmatterSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  description: z.string().optional(),
  excerpt: z.string().optional(),
  category: z.string().default('Uncategorized'),
  image: z.string().optional(),
  tags: z.array(z.string()).default([]),
  type: z.enum(['blog', 'project']).default('blog'),
})

// Schema for processed content item
export const ContentItemSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  date: z.string(),
  category: z.string(),
  image: z.string().nullable(),
  type: z.enum(['blog', 'project']),
  tags: z.array(z.string()),
  content: z.string(),
})

// Derive TypeScript types from schemas
export type Frontmatter = z.infer<typeof FrontmatterSchema>
export type ContentItem = z.infer<typeof ContentItemSchema>