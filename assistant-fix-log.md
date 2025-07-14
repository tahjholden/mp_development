# Assistant Fix Log

A running log of all assistant-driven changes, mistakes, scope violations, and process breakdowns. This log must be updated **every time** the assistant makes a change, encounters an error, or violates process/memory. Use this to spot patterns, inform process improvements, and hold the assistant accountable.

---

## Instructions

- **Every assistant session or incident must be logged here.**
- Use the template below for each entry.
- Be explicit and thorough—capture what happened, why, and how it was fixed or improved.
- Review this log regularly to update memory, process, and onboarding docs.

---

## Entry Template

### YYYY-MM-DD

- **Type:** (Change, Mistake, Scope Violation, Process Breakdown, etc.)
- **Description:** (What happened? Be specific.)
- **Root Cause:** (Why did it happen? Was memory ignored? Was there a technical error?)
- **Fix/Resolution:** (How was it fixed or reverted?)
- **Process Improvement:** (What will be done to prevent this in the future? Was memory updated? Was a new rule added?)

---

## Log

### 2024-12-19

- **Type:** TypeScript/Drizzle ORM Schema Fixes (RESOLVED)
- **Description:** Successfully resolved multiple TypeScript errors related to Drizzle ORM schema definitions. Fixed `securityInvoker` type error (expected boolean, got string 'on'), resolved missing `users` table references in foreign key constraints, and corrected array field definitions in `mpbcPersonRole` table.
- **Root Cause:**
  1. **securityInvoker Type Error:** Drizzle ORM's `ViewWithConfig` type expects `securityInvoker` to be a boolean, but the schema was using the string `'on'` instead of `true`.
  2. **Missing users Table:** Foreign key constraints were referencing `users.id` but the `users` table wasn't defined in the schema files.
  3. **Array Field Definition Error:** `permissions` and `scopeIds` fields in `mpbcPersonRole` were incorrectly defined as single values instead of arrays.
- **Fix/Resolution:**
  1. **Fixed securityInvoker:** Changed `.with({ securityInvoker: 'on' })` to `.with({ securityInvoker: true })` in both `lib/db/schema.ts` and `lib/db/migrations/schema.ts`.
  2. **Commented Out users References:** Commented out foreign key constraints referencing `users.id` with TODO notes in both schema files, matching the pattern used in the main schema.
  3. **Fixed Array Fields:** Changed `permissions: text().default([''])` to `permissions: text().array().default([''])` and `scopeIds: uuid('scope_ids')` to `scopeIds: uuid('scope_ids').array()` in both schema files.
- **Process Improvement:**
  - Always verify Drizzle ORM type definitions match the actual usage in schema files.
  - When encountering foreign key errors, check if referenced tables exist and comment out with TODO notes if they don't.
  - For array fields, ensure proper `.array()` modifier is used in field definitions.
  - Reduced lint error count from 355 to 353 problems.

### 2024-12-19

- **Type:** API Route Debugging / Database Schema Alignment (RESOLVED)
- **Description:** Successfully resolved the persistent 500 error in the `/api/development-plans` endpoint. The error was caused by a mismatch between the Drizzle schema definition and the actual database table structure. The API was trying to select a `title` column that did not exist in the real `mpbc_development_plan` table. Additionally, there was a temporary database connection limit issue that was resolved by restarting the development server.
- **Root Cause:**
  1. **Schema Mismatch:** The Drizzle schema defined a `title` column for `mpbcDevelopmentPlan`, but the actual database table did not have this column. The API code was trying to select `mpbcDevelopmentPlan.title` which caused a Postgres error: "column mpbc_development_plan.title does not exist".
  2. **Database Connection Limit:** After fixing the schema, a temporary "remaining connection slots are reserved for non-replication superuser connections" error occurred, which was resolved by killing all dev processes and restarting.
- **Fix/Resolution:**
  1. **Updated API Code:** Removed all references to the non-existent `title` column and replaced with `initialObservation` field which exists in the real table.
  2. **Updated Drizzle Schema:** Modified `lib/db/schema.ts` to match the actual database table structure exactly, removing the `title` field and ensuring all column definitions match the real table.
  3. **Fixed Join Logic:** Simplified the database join to use `mpbcPerson.firstName` and `mpbcPerson.lastName` directly instead of joining through `mpCorePerson`.
  4. **Resolved Connection Issue:** Killed all development processes and restarted the dev server to clear database connections.
  5. **Added Error Logging:** Enhanced error logging to provide detailed error messages for future debugging.
- **Process Improvement:**
  - Always verify that Drizzle schema definitions match the actual database table structure before implementing API routes.
  - When encountering database errors, check both the schema alignment and connection limits.
  - Use explicit error logging to quickly identify the root cause of API failures.
  - The development-plans API now works correctly and returns data as expected.

### 2024-12-19

- **Type:** Lint/Type Error Cleanup / API Route Debugging
- **Description:** Successfully reduced lint error count from 382 to 280 through systematic cleanup of unused variables, imports, and type issues across dashboard and API files. Cleaned up files including players/page.tsx, sessions/page.tsx, teams/page.tsx, pricing/page.tsx, and app/api/development-plans/route.ts. Restored necessary imports and state (e.g., `z`, `setShowAddTeamModal`) to resolve new errors introduced by earlier cleanups. Identified a persistent 500 error in the development-plans API route that requires debugging.
- **Root Cause:** User requested continued cleanup of critical lint/type errors while maintaining literal, incremental approach. The 500 error was discovered during API route cleanup and requires investigation.
- **Fix/Resolution:**
  - Removed unused imports and variables from multiple dashboard pages
  - Cleaned up API route by removing unused imports/variables
  - Restored necessary imports and state that were accidentally removed
  - Confirmed all changes were incremental, literal, and logged per user preferences
  - Next step: Add enhanced error logging to development-plans API route to debug 500 error
- **Process Improvement:** Continued following user memory for literal, stepwise, and memory-driven work. All changes documented and logged. Ready to proceed with 500 error debugging once error details are available.

## [Date: YYYY-MM-DD] Assistant Fix Log Update

### Accomplished

- Systematically removed unused variables, imports, and fixed type issues in dashboard and API files (players, sessions, teams, pricing, etc.).
- Reduced lint error count from 382 to 280, focusing only on critical errors.
- Restored necessary imports and state (e.g., `z`, `setShowAddTeamModal`) to resolve new errors.
- Cleaned up `app/api/development-plans/route.ts` by removing unused imports/variables.
- Confirmed all changes were incremental, literal, and logged per user preferences.

### In Progress

- Debugging a persistent 500 error in the `development-plans` API route. No error logs found in standard locations; next step is to add/enhance error logging and check terminal/server output.
- Continuing to address remaining critical lint/type errors in other files, only making literal, necessary changes.

### Next Steps

1. Add or enhance error logging in the `development-plans` API route and check terminal/server output for error details.
2. Analyze and fix the root cause of the 500 error once error details are available.
3. Continue systematic cleanup of remaining critical lint/type errors.

---

## [DATE: YYYY-MM-DD] Systematic Manual Lint Cleanup (Dashboard Pages & Shared Components)

### Summary

- Manually removed or commented out truly unused variables and imports in all main dashboard pages:
  - analytics, coaches, development-plans, drills, observations, players, sessions, teams
- Applied the same process to shared components in `components/basketball/` and `components/ui/`
- Left all used state and logic intact; commented out (not deleted) variables that may be needed for future implementation
- Did not touch test/dev/defunct code or migration files
- Did not address structural/complexity/length warnings (pending user instruction)

### Error Count Progress

- Start of cleanup: 408 errors
- After dashboard pages: 267 errors
- After shared components: 208 errors

### Process Notes

- All changes were literal, line-by-line, and only affected truly unused code
- Any mistakes (e.g., earlier pattern-script mistake and revert) were logged previously
- Logging will continue for all assistant-driven codebase changes affecting quality, structure, or process

---
