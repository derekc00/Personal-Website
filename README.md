# Personal Website

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Features

- **Modern Next.js 15** with App Router
- **TypeScript** with strict mode configuration
- **Tailwind CSS** for styling
- **MDX** support for content management
- **Admin Dashboard** with authentication
- **Supabase** integration for backend services
- **React Three Fiber** for 3D graphics
- **Comprehensive Testing** with Vitest and React Testing Library

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Development

### Testing

The project uses Vitest for testing with comprehensive coverage:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm run test:api        # API and lib tests
npm run test:components # Component tests
```

### MDX Content

Content is managed through MDX files in the `content/` directory. Validate MDX files with:

```bash
npm run validate-mdx
```

### Admin Dashboard

The admin dashboard is available at `/admin` and requires authentication through Supabase. Admin functionality includes:

- Content management
- User authentication
- Protected API routes

## Architecture

### Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Content**: MDX with gray-matter frontmatter
- **Backend**: Supabase (Auth, Database, Storage)
- **Testing**: Vitest, React Testing Library, MSW
- **3D Graphics**: React Three Fiber, Three.js

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (public)/          # Public routes
│   ├── admin/             # Admin dashboard
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utility functions and configurations
├── hooks/                 # Custom React hooks
└── test/                  # Test utilities and mocks
```

## Local Development Setup

### Claude Code Configuration

This project uses Claude Code for AI-assisted development. Local Claude settings are stored in `.claude/settings.local.json` and should not be committed to version control.

To configure your local Claude Code settings:
1. Create `.claude/settings.local.json` in the project root (already gitignored)
2. Configure tools, permissions, and preferences as needed
3. The file is automatically ignored by git to prevent exposing local configurations

### Environment Variables

Copy `.env.local.example` to `.env.local` and configure your environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (server-side only)

## Deployment

### Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Supabase

Ensure your Supabase project is properly configured with:
- Database tables and schemas
- Row Level Security (RLS) policies
- Authentication providers

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Supabase Documentation](https://supabase.com/docs) - learn about Supabase features
- [Tailwind CSS](https://tailwindcss.com/docs) - utility-first CSS framework
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) - React renderer for Three.js

## Contributing

This is a personal website project. For development guidelines and collaboration principles, see `CLAUDE.md`.