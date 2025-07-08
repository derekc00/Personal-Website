# Claude Collaboration & Development Guidelines

## Shared Standards
@include shared/collaboration-standards.yml#Core_Philosophy
@include shared/collaboration-standards.yml#Intellectual_Engagement
@include shared/collaboration-standards.yml#Communication_Standards
@include shared/collaboration-standards.yml#Anti_Patterns

## Development Philosophy
@include shared/development-practices.yml#Test_Driven_Development
@include shared/development-practices.yml#Code_Quality_Standards

## Technical Context

### Language & Framework Preferences
- **TypeScript**: Strict mode, schema-first development with Zod
- **Java**: Java 17 syntax, use `String.format()` instead of `{}` for logging
- **React**: Next.js App Router for new applications
- **Testing**: Jest/Vitest + React Testing Library, MSW for API mocking

### TypeScript Standards
- **Strict mode always**: No `any`, no type assertions without justification, no `@ts-ignore`
- **Schema-first development**: Use Zod or Standard Schema compliant libraries to create schemas first, derive types from them
- **Prefer `type` over `interface`** in all cases
- Apply strict mode rules to test code as well as production code

### Git Worktree Management
- **Worktree naming convention**: All git worktrees should be prefixed with `worktree-{linear-ticket}` (e.g., `worktree-DER-66`, `worktree-ABC-123`)
- **Base repository**: All worktrees should be created from the `root-project` directory
- **Workspace organization**: Keep all worktrees in the parent directory for Claude Code visibility
- **Environment files**: Copy `.env` files from the root-project directory to new worktrees to ensure consistent environment configuration
- **Isolation**: Each worktree maintains its own git history and can be worked on independently

## Working Together
@include shared/collaboration-standards.yml#Working_Expectations
@include shared/development-practices.yml#Development_Workflow
@include shared/collaboration-standards.yml#Communication_Protocol

## Collaboration Boundaries
- Do not include Claude in the git commits or pull requests or anywhere.
- In git commits and pull requests, do not mention claude