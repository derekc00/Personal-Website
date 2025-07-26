-- 
-- Seed data for DER-69 local testing environment
-- This creates test admin user and sample content for E2E testing
--

-- Create test admin user in auth.users
-- Note: In production, this would be handled by Supabase Auth
-- For local testing, we create the user directly
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '12345678-1234-5678-9abc-123456789012',
    'authenticated',
    'authenticated',
    'admin@test.local',
    crypt('test123', gen_salt('bf')),
    NOW(),
    NOW(),
    '',
    NOW(),
    '',
    NULL,
    '',
    '',
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    NOW(),
    NOW(),
    NULL,
    NULL,
    '',
    '',
    NULL,
    '',
    0,
    NULL,
    '',
    NULL,
    false,
    NULL
) ON CONFLICT (id) DO NOTHING;

-- Create corresponding user profile
INSERT INTO public.user_profiles (
    id,
    email,
    role,
    created_at,
    updated_at
) VALUES (
    '12345678-1234-5678-9abc-123456789012',
    'admin@test.local',
    'admin',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create sample content for CRUD testing
INSERT INTO public.content (
    id,
    slug,
    title,
    excerpt,
    date,
    category,
    image,
    type,
    tags,
    content,
    published,
    comments_enabled,
    created_at,
    updated_at,
    author_id
) VALUES 
(
    '11111111-1111-1111-1111-111111111111',
    'test-blog-post',
    'Test Blog Post for CRUD Testing',
    'This is a test blog post excerpt used for validating CRUD operations in the admin dashboard.',
    NOW(),
    'Technology',
    NULL,
    'blog',
    '["test", "crud", "admin"]'::jsonb,
    '# Test Blog Post

This is a comprehensive test blog post created for DER-69 E2E testing.

## Purpose

This content is used to validate:
- Content listing in admin dashboard
- Content editing functionality
- Content deletion operations
- Publishing/unpublishing workflows

## Test Scenarios

1. **Read Operations**: This post should appear in the admin content list
2. **Update Operations**: Admin should be able to edit this content
3. **Delete Operations**: Admin should be able to delete this content
4. **Publish Operations**: Admin should be able to toggle publish status

This content is automatically seeded for local testing and should not appear in production.',
    true,
    true,
    NOW(),
    NOW(),
    '12345678-1234-5678-9abc-123456789012'
),
(
    '22222222-2222-2222-2222-222222222222',
    'test-draft-post',
    'Test Draft Post (Unpublished)',
    'This is a test draft post that should appear as unpublished in the admin dashboard.',
    NOW(),
    'Development',
    NULL,
    'blog',
    '["test", "draft", "unpublished"]'::jsonb,
    '# Test Draft Post

This is a draft post used for testing unpublished content workflows.

## Purpose

This draft content validates:
- Unpublished content visibility in admin
- Draft-to-published workflow testing
- Content status management

This content should appear as "Draft" in the admin dashboard and not be visible on the public site.',
    false,
    true,
    NOW(),
    NOW(),
    '12345678-1234-5678-9abc-123456789012'
),
(
    '33333333-3333-3333-3333-333333333333',
    'test-project',
    'Test Project for Portfolio',
    'A sample project entry for testing project-type content management.',
    NOW(),
    'Projects',
    NULL,
    'project',
    '["test", "project", "portfolio"]'::jsonb,
    '# Test Project

This is a sample project entry for testing project content management.

## Features

- Project-specific content type testing
- Portfolio section validation
- Project categorization testing

## Technical Details

This project entry validates that the admin dashboard can handle different content types (blog vs project) correctly.',
    true,
    false,
    NOW(),
    NOW(),
    '12345678-1234-5678-9abc-123456789012'
) ON CONFLICT (id) DO NOTHING;

-- Create a test comment for comments-enabled content (if comments table exists)
-- Note: This will be added when we pull the actual schema from production