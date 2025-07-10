// design-tokens.ts
// Centralized design system values for the MP Basketball System

export const colors = {
  // Primary brand colors
  gold: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#C2B56B', // Primary brand gold
    600: '#d8cc97',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
  },
  
  // Semantic colors
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#A22828', // Brand red
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  // Success colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  // Warning colors
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  // Neutral colors
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Archive colors
  archive: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },

  // Background colors
  background: {
    primary: '#09090B', // zinc-950
    secondary: '#18181B', // zinc-900
    tertiary: '#27272A', // zinc-800
  },

  // Text colors
  text: {
    primary: '#FFFFFF',
    secondary: '#A1A1AA', // zinc-400
    tertiary: '#71717A', // zinc-500
    gold: '#C2B56B',
  },

  // Border colors
  border: {
    primary: '#27272A', // zinc-800
    secondary: '#3F3F46', // zinc-700
    gold: '#C2B56B',
  }
};

export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
};

export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px',
};

export const typography = {
  fontFamily: {
    sans: 'var(--font-sans), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    heading: 'var(--font-heading), var(--font-sans)',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  size: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
  },
  weight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  styles: {
    h1: 'text-3xl font-bold tracking-tight',
    h2: 'text-2xl font-semibold tracking-tight',
    h3: 'text-xl font-medium tracking-tight',
    h4: 'text-lg font-medium',
    body: 'text-base',
    caption: 'text-sm text-muted-foreground',
    button: 'text-sm font-medium',
    label: 'text-sm font-medium leading-none',
  }
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  ring: '0 0 0 3px rgba(194, 181, 107, 0.35)', // Gold ring for focus states
};

export const transitions = {
  fast: '150ms ease-in-out',
  normal: '200ms ease-in-out',
  slow: '300ms ease-in-out',
};

// Semantic color mappings for easy use
export const semanticColors = {
  primary: colors.gold[500],
  primaryLight: colors.gold[400],
  primaryDark: colors.gold[600],
  
  danger: colors.danger[500],
  dangerLight: colors.danger[400],
  dangerDark: colors.danger[600],
  
  success: colors.success[500],
  successLight: colors.success[400],
  successDark: colors.success[600],
  
  warning: colors.warning[500],
  warningLight: colors.warning[400],
  warningDark: colors.warning[600],
  
  archive: colors.archive[500],
  archiveLight: colors.archive[400],
  archiveDark: colors.archive[600],
  
  gray: colors.gray[500],
  grayLight: colors.gray[400],
  grayDark: colors.gray[600],

  // Background colors
  background: colors.background.primary,
  backgroundSecondary: colors.background.secondary,
  backgroundTertiary: colors.background.tertiary,

  // Text colors
  text: colors.text.primary,
  textSecondary: colors.text.secondary,
  textTertiary: colors.text.tertiary,
  textGold: colors.text.gold,

  // Border colors
  border: colors.border.primary,
  borderSecondary: colors.border.secondary,
  borderGold: colors.border.gold,
};

// CSS custom properties for use in CSS
export const cssVariables = {
  '--color-gold': colors.gold[500],
  '--color-gold-light': colors.gold[400],
  '--color-gold-dark': colors.gold[600],
  '--color-danger': colors.danger[500],
  '--color-danger-light': colors.danger[400],
  '--color-danger-dark': colors.danger[600],
  '--color-success': colors.success[500],
  '--color-success-light': colors.success[400],
  '--color-success-dark': colors.success[600],
  '--color-warning': colors.warning[500],
  '--color-warning-light': colors.warning[400],
  '--color-warning-dark': colors.warning[600],
  '--color-archive': colors.archive[500],
  '--color-archive-light': colors.archive[400],
  '--color-archive-dark': colors.archive[600],
  '--color-gray': colors.gray[500],
  '--color-gray-light': colors.gray[400],
  '--color-gray-dark': colors.gray[600],
  '--color-background': colors.background.primary,
  '--color-background-secondary': colors.background.secondary,
  '--color-background-tertiary': colors.background.tertiary,
  '--color-text': colors.text.primary,
  '--color-text-secondary': colors.text.secondary,
  '--color-text-tertiary': colors.text.tertiary,
  '--color-text-gold': colors.text.gold,
  '--color-border': colors.border.primary,
  '--color-border-secondary': colors.border.secondary,
  '--color-border-gold': colors.border.gold,
  '--shadow-sm': shadows.sm,
  '--shadow-md': shadows.md,
  '--shadow-lg': shadows.lg,
  '--shadow-xl': shadows.xl,
  '--shadow-ring': shadows.ring,
  '--transition-fast': transitions.fast,
  '--transition-normal': transitions.normal,
  '--transition-slow': transitions.slow,
};

// Export everything for easy importing
export default {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  transitions,
  semanticColors,
  cssVariables,
};
