# CLAUDE.md - Repository Guidelines

## Build Commands
- Development: `npm run dev --turbopack`
- Build: `npm run build`
- Start: `npm run start`
- Lint: `npm run lint`

## Code Style
- TypeScript with strict mode enabled
- Next.js App Router structure with React 19
- Use named exports for components, functional components with arrow functions
- Utilize Tailwind CSS for styling with custom color variables when needed
- Path aliases: `@/*` maps to `./src/*`
- Components should have typed props using interfaces
- Embrace async/await for asynchronous operations
- React Server Components preferred where applicable
- Organize imports: React/Next.js imports first, then third-party, then local
- Error handling: Use Suspense for async components, proper error boundaries
- File naming: PascalCase for components, camelCase for utilities
- Image handling: Use Next.js Image component with proper dimensions

## Project Structure
- `/src/app` - Main application code with Next.js App Router
- `/content` - Markdown files for blog posts
- `/public` - Static assets