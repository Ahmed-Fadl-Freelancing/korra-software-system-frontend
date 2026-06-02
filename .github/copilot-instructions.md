# GitHub Copilot Instructions - Korra Frontend

## CRITICAL: GitHub Workflow Rules
- **DO NOT** merge pull requests to the `main` branch automatically.
- After creating a Pull Request, **STOP** and wait for the user to review and merge it manually.
- NEVER use `gh pr merge` or any merge command on the `main` branch.

## Branching & Commits
- Use feature branches: `feat/feature-name-id`.
- Use Conventional Commits: `feat(scope): description`.
- Reference Linear IDs in commits (e.g., `KOR-54`).

## Technical Stack
- React + Vite + Tailwind CSS.
- Supabase for Auth/DB.
- Shadcn UI for components.
