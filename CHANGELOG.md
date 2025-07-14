# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- **TypeScript/Drizzle ORM Schema Issues**: Resolved multiple critical TypeScript errors in database schema definitions
  - Fixed `securityInvoker` type error: Changed from string `'on'` to boolean `true` in PostgreSQL view configurations
  - Resolved missing `users` table references: Commented out foreign key constraints with TODO notes for future auth integration
  - Corrected array field definitions: Fixed `permissions` and `scopeIds` fields in `mpbcPersonRole` table to use proper `.array()` modifiers
  - Reduced lint error count from 355 to 353 problems through systematic type fixes
- **Process and Documentation Standards**: Comprehensive process tracking and documentation system
  - `assistant-fix-log.md`: Logs all assistant-driven changes, mistakes, and process breakdowns
  - Enhanced `CONTRIBUTING.md`: Detailed process rules, code quality standards, and workflow requirements
  - Updated `README.md`: Includes process and standards documentation
- **Stricter Code Quality Standards**: Industry-standard linting and formatting enforcement
  - Enhanced ESLint configuration with strict TypeScript and React rules
  - Comprehensive Prettier configuration for consistent formatting
  - Automated pre-commit hooks via Husky and lint-staged
  - Code quality rules: no console.log, no any types, complexity limits, line limits

### Added

- **Process and Documentation Standards**: Comprehensive process tracking and documentation system
  - `assistant-fix-log.md`: Logs all assistant-driven changes, mistakes, and process breakdowns
  - Enhanced `CONTRIBUTING.md`: Detailed process rules, code quality standards, and workflow requirements
  - Updated `README.md`: Includes process and standards documentation
- **Stricter Code Quality Standards**: Industry-standard linting and formatting enforcement
  - Enhanced ESLint configuration with strict TypeScript and React rules
  - Comprehensive Prettier configuration for consistent formatting
  - Automated pre-commit hooks via Husky and lint-staged
  - Code quality rules: no console.log, no any types, complexity limits, line limits

### Changed

- **ESLint Configuration**: Upgraded to strict industry standards
  - No explicit `any` types (error instead of warning)
  - No console.log statements (error instead of warning)
  - Added comprehensive code quality rules (complexity, depth, line limits)
  - Enhanced TypeScript-specific rules for better type safety
- **Prettier Configuration**: Added comprehensive formatting options
  - JSX single quotes, quote props handling, prose wrapping
  - HTML whitespace sensitivity and embedded language formatting
- **Development Workflow**: Enforced PR-based workflow for all non-trivial changes
  - Pre-commit hooks automatically run linting and formatting
  - All changes must pass automated checks before merging
  - Explicit code review and approval process

### Security

- **Type Safety**: Stricter TypeScript rules prevent type-related security issues
- **Code Quality**: Automated checks catch potential security vulnerabilities

---

## Instructions

- Update this file with every notable change, feature, fix, or improvement.
- Use the sections above to categorize changes.
- Reference pull requests, issues, or commits where relevant.
- Include specific details about process improvements and their impact.
