# Contributing Guide

> **IMPORTANT:** All non-trivial changes (features, bug fixes, refactors, etc.) must be made in a separate branch and submitted as a Pull Request (PR) for review and approval before merging into the main branch. No direct commits to main for significant changes.

Thank you for contributing to this project! Please read and follow these guidelines to ensure a consistent and high-quality workflow.

## 1. Assistant Process and Memory Rules

- The assistant must always check and apply user memory before any action.
- Confirm in your own words: what you'll do, what you won't do, and any assumptions. Wait for explicit go-ahead before proceeding.
- No scope creep. Only change what is explicitly requested.
- Never default to best practices or general conventions—always follow user memory and process.
- Log every assistant-driven change, mistake, or process breakdown in `assistant-fix-log.md`.

## 2. Code Quality and Standards

### Pre-commit Requirements

- **Husky + lint-staged**: All commits automatically run linting and formatting checks.
- **ESLint**: Strict TypeScript and React rules enforced. No console.log, no any types, no unused variables.
- **Prettier**: Consistent code formatting across all files.
- **TypeScript**: Strict type checking with no implicit any.

### Code Quality Rules

- **No console.log statements** (except warn/error in specific contexts)
- **No explicit any types** - use proper TypeScript types
- **No unused variables or imports**
- **Maximum function complexity of 10**
- **Maximum function length of 50 lines**
- **Maximum file length of 300 lines**
- **Maximum 4 function parameters**
- **Maximum 4 levels of nesting**

### Required Checks Before Committing

```bash
# These run automatically via Husky pre-commit hook
pnpm lint          # ESLint check
pnpm format:check  # Prettier check
pnpm test          # Unit tests
```

## 3. How to Propose Changes

- **All non-trivial changes must be made in a separate branch and submitted as a Pull Request (PR) for review and approval.**
- Summarize the planned change, referencing user memory and process.
- Wait for user approval before making any change.
- Use clear, descriptive commit messages (see CHANGELOG.md for format).
- Ensure all linting and formatting checks pass before submitting PR.

## 4. How to Log Incidents

- Use `assistant-fix-log.md` to log every assistant-driven change, mistake, scope violation, or process breakdown.
- Follow the template in that file for each entry.
- Include specific details about what went wrong and how it was fixed.

## 5. Code Review and Approval

- All changes must be reviewed and approved by the user before merging.
- Use pull requests for all non-trivial changes.
- Reference relevant memory, process, and log entries in the PR description.
- Ensure all automated checks pass (linting, formatting, tests).

## 6. General Best Practices

- Use semantic versioning and update CHANGELOG.md with every notable change.
- Write clear, maintainable, and well-documented code.
- Prefer explicitness and transparency over abstraction or optimization unless requested.
- Follow TypeScript best practices and avoid type assertions.
- Use proper error handling and avoid silent failures.

## 7. Development Workflow

1. Create a feature branch from main
2. Make changes following the code quality standards
3. Run `pnpm lint` and `pnpm format` to ensure compliance
4. Commit with descriptive messages
5. Push and create a Pull Request
6. Wait for review and approval
7. Merge only after approval

## 8. Automated Enforcement

- **Husky pre-commit hooks** automatically run linting and formatting
- **ESLint** enforces strict TypeScript and React rules
- **Prettier** ensures consistent code formatting
- **TypeScript** provides strict type checking
- **lint-staged** runs checks only on changed files for efficiency
