# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Observations Wizard Flow Enhancement**: Comprehensive overhaul of the observations creation process
  - **New TargetSelector Component**: Added first step for selecting individual vs team context
  - **Back Navigation**: Implemented back button navigation throughout all wizard steps
  - **Dark Theme Styling**: Added dark theme styling for observation textarea with high contrast
  - **Mobile Voice-to-Text Support**: Updated placeholder text to guide mobile users for voice input
  - **Context-Aware Filtering**: Team and player selector components now filter based on selected context
  - **Role-Based Access**: Proper user permission checking throughout the wizard flow
  - **API Integration**: Updated POST endpoint to save observations with context field in database

### Changed

- **Empty State Card Layout Consistency**: Improved empty state handling across all pages
  - **Consistent Positioning**: Empty state cards now maintain the same layout position and sizing as populated cards
  - **No Layout Shifts**: Eliminated layout shifts when transitioning between empty and populated states
  - **Title Consistency**: Page titles are always visible outside cards regardless of content state
  - **List Empty States**: Removed empty state cards from lists (only show for "not selected" scenarios)
  - **Proper Sizing**: Added `min-height` classes to ensure empty state cards match populated card dimensions
  - **Universal Components**: Updated players, teams, and coaches pages to use proper `UniversalCard` empty state variants

- **API Endpoints**: Updated observations API to handle context field and improved error handling
- **Component Architecture**: Enhanced ObservationStepper with back navigation and context-aware filtering
- **User Experience**: Improved mobile experience with voice-to-text guidance and better navigation flow
- **Sidebar now uses a literal, hardcoded navigation list for SuperAdmin based on `personType === 'superadmin'`, with no config or backend dependency. All other roles remain config-driven. This guarantees SuperAdmin always sees the full navigation, following the KISS principle and schema as the source of truth.**

### Fixed

- **Layout Consistency**: Ensured all pages follow the universal dashboard layout with consistent three-column structure
- **Component Reusability**: Standardized empty state usage across all pages using universal components
- **Type Safety**: Fixed TypeScript errors and improved type definitions throughout the observations flow

### Security

- **Type Safety**: Stricter TypeScript rules prevent type-related security issues
- **Code Quality**: Automated checks catch potential security vulnerabilities

---

## Instructions

- Update this file with every notable change, feature, fix, or improvement.
- Use the sections above to categorize changes.
- Reference pull requests, issues, or commits where relevant.
- Include specific details about process improvements and their impact.
