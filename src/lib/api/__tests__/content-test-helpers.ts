import type { ContentRow } from '@/lib/schemas/auth'

export function createMockContent(overrides?: Partial<ContentRow>): ContentRow {
  return {
    id: 'content-123',
    slug: 'test-post',
    title: 'Test Post',
    excerpt: 'Test excerpt',
    date: '2024-01-01T00:00:00Z',
    category: 'Tech',
    image: null,
    type: 'blog',
    tags: ['test'],
    content: 'Test content',
    published: true,
    comments_enabled: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    author_id: 'user-123',
    ...overrides
  }
}

export type MockSupabaseQuery = {
  select: jest.Mock
  insert: jest.Mock
  update: jest.Mock
  delete: jest.Mock
  eq: jest.Mock
  single: jest.Mock
  order: jest.Mock
}

export function createMockSupabaseQuery(): MockSupabaseQuery {
  const singleMock = jest.fn()
  const eqMock = jest.fn(() => ({ single: singleMock }))
  const selectMock = jest.fn(() => ({ eq: eqMock }))
  const orderMock = jest.fn(() => ({ eq: eqMock }))
  
  return {
    select: selectMock,
    insert: jest.fn(() => ({ select: selectMock })),
    update: jest.fn(() => ({ eq: eqMock })),
    delete: jest.fn(() => ({ eq: eqMock })),
    eq: eqMock,
    single: singleMock,
    order: orderMock
  }
}

export function setupSupabaseMock(supabase: jest.Mocked<typeof import('@/lib/supabase').supabase>, mockQuery: MockSupabaseQuery) {
  supabase.from = jest.fn(() => mockQuery) as typeof supabase.from
}