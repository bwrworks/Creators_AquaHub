/**
 * Creators AquaHub Spacing, Border Radius & Elevation Tokens
 */

export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  "4xl": 48,
  "5xl": 64,
} as const;

export const radii = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  base: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export type Spacing = typeof spacing;
export type Radii = typeof radii;
