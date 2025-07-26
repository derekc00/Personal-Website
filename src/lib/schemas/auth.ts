import { z } from 'zod';

// Email validation with normalization
const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Invalid email address');

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

// JWT validation schemas
export const supabaseJWTSchema = z.object({
  sub: z.string().uuid(),
  email: emailSchema.optional(),
  phone: z.string().optional(),
  role: z.string(),
  app_metadata: z.object({
    provider: z.string(),
    providers: z.array(z.string())
  }).optional(),
  user_metadata: z.record(z.any()).optional(),
  aal: z.string().optional(),
  amr: z.array(z.object({
    method: z.string(),
    timestamp: z.number()
  })).optional(),
  session_id: z.string().optional(),
  exp: z.number(),
  iat: z.number(),
  iss: z.string().optional()
});

// Database schema validation (synced with actual database structure)
export const contentRowSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  title: z.string().min(1).max(200),
  excerpt: z.string().max(500),
  date: z.string(),
  category: z.string(),
  image: z.string().url().nullable(),
  type: z.enum(['blog', 'project']),
  tags: z.array(z.string()),
  content: z.string(),
  published: z.boolean(),
  comments_enabled: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  author_id: z.string().uuid().nullable()
});

export const contentInsertSchema = contentRowSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
}).partial({
  date: true,
  category: true,
  image: true,
  type: true,
  tags: true,
  published: true,
  comments_enabled: true,
  author_id: true
});

export const contentUpdateSchema = contentInsertSchema.partial();

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
export type SupabaseJWT = z.infer<typeof supabaseJWTSchema>;
export type ContentRow = z.infer<typeof contentRowSchema>;
export type ContentInsert = z.infer<typeof contentInsertSchema>;
export type ContentUpdate = z.infer<typeof contentUpdateSchema>;