import { z } from 'zod';

// Email validation
const emailSchema = z.string().email('Invalid email address');

// Password validation with security requirements
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Auth input schemas
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// User profile schemas
export const userRoleSchema = z.enum(['admin', 'editor']);

export const userProfileSchema = z.object({
  id: z.string().uuid(),
  email: emailSchema,
  role: userRoleSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const userProfileInsertSchema = z.object({
  id: z.string().uuid(),
  email: emailSchema,
  role: userRoleSchema.default('editor'),
});

export const userProfileUpdateSchema = z.object({
  email: emailSchema.optional(),
  role: userRoleSchema.optional(),
});

// Auth response schemas
export const authUserSchema = z.object({
  id: z.string().uuid(),
  email: emailSchema,
  role: userRoleSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const authSessionSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number(),
  expires_at: z.number().optional(),
  token_type: z.string(),
  user: z.object({
    id: z.string().uuid(),
    email: emailSchema,
    email_confirmed_at: z.string().datetime().nullable(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
  }),
});

// Type exports
export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type UserProfileInsert = z.infer<typeof userProfileInsertSchema>;
export type UserProfileUpdate = z.infer<typeof userProfileUpdateSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
export type AuthSession = z.infer<typeof authSessionSchema>;