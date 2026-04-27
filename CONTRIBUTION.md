# Contributing to TCG Store

Thank you for contributing! Please read this guide before submitting any work.

## Getting Started

1. Fork or clone the repository
2. Read the README.md for local setup instructions
3. Always branch off from `develop` — never work directly on `main` or `develop`

## Branch Naming

- feature/short-description
- fix/short-description
- hotfix/short-description
- chore/short-description
- docs/short-description

## Commit Messages

Follow Conventional Commits:
feat(scope): description
fix(scope): description
docs(scope): description

## Pull Request Rules

- All PRs must target the `develop` branch
- PRs to `main` are only opened by the project lead for releases
- Include a clear description of what you changed and why
- Link to the relevant GitHub Issue if applicable
- Must pass all CI checks before merging
- Requires at least 1 approval (develop) or 2 approvals (main)

## Code Style

- Backend: PEP 8, run `flake8` before pushing
- Frontend: ESLint + Prettier, run `npm run lint` before pushing

## Running Tests

- Backend: cd backend && pytest
- Frontend: cd frontend && npm run test

## Need Help?

Open a GitHub Issue or start a Discussion.
