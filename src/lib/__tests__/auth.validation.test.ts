import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import {
  signInSchema,
  signUpSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  userRoleSchema,
  userProfileSchema,
  supabaseJWTSchema,
} from '../schemas/auth'

describe('Auth Validation Schemas', () => {
  describe('signInSchema', () => {
    it('should validate valid sign in data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      }
      
      expect(() => signInSchema.parse(validData)).not.toThrow()
    })

    it('should normalize email to lowercase', () => {
      const data = {
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
      }
      
      const result = signInSchema.parse(data)
      expect(result.email).toBe('test@example.com')
    })

    it('should trim whitespace from email', () => {
      const data = {
        email: '  test@example.com  ',
        password: 'password123',
      }
      
      const result = signInSchema.parse(data)
      expect(result.email).toBe('test@example.com')
    })

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'password123',
      }
      
      expect(() => signInSchema.parse(invalidData)).toThrow(z.ZodError)
    })

    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
      }
      
      expect(() => signInSchema.parse(invalidData)).toThrow(z.ZodError)
    })
  })

  describe('signUpSchema', () => {
    it('should validate valid sign up data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      }
      
      expect(() => signUpSchema.parse(validData)).not.toThrow()
    })

    it('should reject weak password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'weak',
        confirmPassword: 'weak',
      }
      
      expect(() => signUpSchema.parse(invalidData)).toThrow(z.ZodError)
    })

    it('should reject password without uppercase', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123!',
        confirmPassword: 'password123!',
      }
      
      expect(() => signUpSchema.parse(invalidData)).toThrow(z.ZodError)
    })

    it('should reject password without lowercase', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'PASSWORD123!',
        confirmPassword: 'PASSWORD123!',
      }
      
      expect(() => signUpSchema.parse(invalidData)).toThrow(z.ZodError)
    })

    it('should reject password without number', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'SecurePass!',
        confirmPassword: 'SecurePass!',
      }
      
      expect(() => signUpSchema.parse(invalidData)).toThrow(z.ZodError)
    })

    it('should reject password without special character', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'SecurePass123',
        confirmPassword: 'SecurePass123',
      }
      
      expect(() => signUpSchema.parse(invalidData)).toThrow(z.ZodError)
    })

    it('should reject mismatched passwords', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'DifferentPass123!',
      }
      
      expect(() => signUpSchema.parse(invalidData)).toThrow(z.ZodError)
    })
  })

  describe('resetPasswordSchema', () => {
    it('should validate valid email', () => {
      const validData = {
        email: 'test@example.com',
      }
      
      expect(() => resetPasswordSchema.parse(validData)).not.toThrow()
    })

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
      }
      
      expect(() => resetPasswordSchema.parse(invalidData)).toThrow(z.ZodError)
    })
  })

  describe('updatePasswordSchema', () => {
    it('should validate valid password update', () => {
      const validData = {
        currentPassword: 'OldPass123!',
        newPassword: 'NewSecurePass123!',
        confirmPassword: 'NewSecurePass123!',
      }
      
      expect(() => updatePasswordSchema.parse(validData)).not.toThrow()
    })

    it('should reject mismatched new passwords', () => {
      const invalidData = {
        currentPassword: 'OldPass123!',
        newPassword: 'NewSecurePass123!',
        confirmPassword: 'DifferentPass123!',
      }
      
      expect(() => updatePasswordSchema.parse(invalidData)).toThrow(z.ZodError)
    })
  })

  describe('userRoleSchema', () => {
    it('should accept admin role', () => {
      expect(() => userRoleSchema.parse('admin')).not.toThrow()
    })

    it('should accept editor role', () => {
      expect(() => userRoleSchema.parse('editor')).not.toThrow()
    })

    it('should reject invalid role', () => {
      expect(() => userRoleSchema.parse('viewer')).toThrow(z.ZodError)
    })
  })

  describe('userProfileSchema', () => {
    it('should validate valid user profile', () => {
      const validProfile = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        role: 'admin',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }
      
      expect(() => userProfileSchema.parse(validProfile)).not.toThrow()
    })

    it('should reject invalid uuid', () => {
      const invalidProfile = {
        id: 'not-a-uuid',
        email: 'test@example.com',
        role: 'admin',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }
      
      expect(() => userProfileSchema.parse(invalidProfile)).toThrow(z.ZodError)
    })

    it('should reject invalid role', () => {
      const invalidProfile = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        role: 'superadmin',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }
      
      expect(() => userProfileSchema.parse(invalidProfile)).toThrow(z.ZodError)
    })
  })

  describe('supabaseJWTSchema', () => {
    it('should validate valid JWT payload', () => {
      const validJWT = {
        sub: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        role: 'authenticated',
        app_metadata: {
          provider: 'email',
          providers: ['email']
        },
        user_metadata: {},
        exp: 1700000000,
        iat: 1699999000
      }
      
      expect(() => supabaseJWTSchema.parse(validJWT)).not.toThrow()
    })

    it('should reject JWT with invalid sub UUID', () => {
      const invalidJWT = {
        sub: 'not-a-uuid',
        role: 'authenticated',
        exp: 1700000000,
        iat: 1699999000
      }
      
      expect(() => supabaseJWTSchema.parse(invalidJWT)).toThrow(z.ZodError)
    })

    it('should accept JWT without optional fields', () => {
      const minimalJWT = {
        sub: '123e4567-e89b-12d3-a456-426614174000',
        role: 'authenticated',
        exp: 1700000000,
        iat: 1699999000
      }
      
      expect(() => supabaseJWTSchema.parse(minimalJWT)).not.toThrow()
    })
  })
})