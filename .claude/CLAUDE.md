## New Feature Workflow

**IMPORTANT**: Always run Claude Code from the parent directory (`/Users/derek/Documents/Personal Website/my-website`) to have visibility to all git worktrees.

When starting a new feature, follow this workflow:

1. **Navigate to parent directory**: `cd /Users/derek/Documents/Personal Website/my-website`
2. **Update main branch**: Ensure main branch is up to date with latest commits
3. **Create new git worktree**: Create worktree with format `my-website-der-[issue-number]`
4. **Create branch**: Create branch off updated main with format `derekchangc00/der-[issue-number]`
5. **Install Linear MCP**: In the new worktree directory, install Linear MCP integration

### Commands to run:
```bash
# Ensure we're in the parent directory for full worktree visibility
cd /Users/derek/Documents/Personal Website/my-website

# Update main branch to latest commits before branching
cd my-website && git checkout main && git pull origin main

# Create new worktree and branch (replace [issue-number] with actual number)
git worktree add ../my-website-der-[issue-number] -b derekchangc00/der-[issue-number]

# Navigate to new worktree and install Linear MCP
cd ../my-website-der-[issue-number]
claude mcp add linear npx -- -y mcp-remote https://mcp.linear.app/sse

# Return to parent directory for Claude Code session
cd ..
```