import { isAdmin, canEdit, hasRole, type AuthUser } from '../auth'

describe('auth helpers', () => {
  const mockAdminUser: AuthUser = {
    id: 'admin-id',
    email: 'admin@example.com',
    aud: 'authenticated',
    created_at: '2023-01-01T00:00:00Z',
    profile: {
      id: 'admin-id',
      email: 'admin@example.com',
      role: 'admin',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    }
  }

  const mockEditorUser: AuthUser = {
    id: 'editor-id',
    email: 'editor@example.com',
    aud: 'authenticated',
    created_at: '2023-01-01T00:00:00Z',
    profile: {
      id: 'editor-id',
      email: 'editor@example.com',
      role: 'editor',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    }
  }

  describe('hasRole', () => {
    it('returns true when user has admin role and admin is required', () => {
      expect(hasRole(mockAdminUser, 'admin')).toBe(true)
    })

    it('returns true when user has admin role and editor is required', () => {
      expect(hasRole(mockAdminUser, 'editor')).toBe(true)
    })

    it('returns false when user has editor role and admin is required', () => {
      expect(hasRole(mockEditorUser, 'admin')).toBe(false)
    })

    it('returns true when user has editor role and editor is required', () => {
      expect(hasRole(mockEditorUser, 'editor')).toBe(true)
    })

    it('returns false when user is null', () => {
      expect(hasRole(null, 'admin')).toBe(false)
      expect(hasRole(null, 'editor')).toBe(false)
    })

    it('returns false when user has no profile', () => {
      const userWithoutProfile: AuthUser = {
        id: 'no-profile-id',
        email: 'noprofile@example.com',
        aud: 'authenticated',
        created_at: '2023-01-01T00:00:00Z'
      }
      expect(hasRole(userWithoutProfile, 'admin')).toBe(false)
    })
  })

  describe('isAdmin', () => {
    it('returns true for admin user', () => {
      expect(isAdmin(mockAdminUser)).toBe(true)
    })

    it('returns false for editor user', () => {
      expect(isAdmin(mockEditorUser)).toBe(false)
    })

    it('returns false for null user', () => {
      expect(isAdmin(null)).toBe(false)
    })
  })

  describe('canEdit', () => {
    it('returns true for admin user', () => {
      expect(canEdit(mockAdminUser)).toBe(true)
    })

    it('returns true for editor user', () => {
      expect(canEdit(mockEditorUser)).toBe(true)
    })

    it('returns false for null user', () => {
      expect(canEdit(null)).toBe(false)
    })
  })
})