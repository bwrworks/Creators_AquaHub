/**
 * Creators AquaHub Official Color Tokens
 * Derived directly from the parent Creators Aquarium website design system (app/globals.css)
 */

export const colors = {
  // Base dark backgrounds
  bg: {
    base: "#050505",
    soft: "#0A0C0A",
  },
  // Surface layers
  surface: {
    base: "#101310",
    elevated: "#151915",
    card: "#121612",
  },
  // Typography neutrals
  text: {
    primary: "#F4F4EF",
    secondary: "#A3A69F",
    muted: "#70756D",
    inverse: "#050505",
  },
  // Brand accents (Creators Aquarium identity)
  brand: {
    green: "#8BCF32",
    greenLight: "#B4E35A",
    greenDark: "#638F24",
  },
  // Structural borders & dividers
  border: {
    subtle: "#242824",
    hover: "#353D35",
    active: "#8BCF32",
  },
  // Functional semantic statuses
  status: {
    success: "#8BCF32",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#0EA5E9",
  },
  // Tank Category Markers
  tankType: {
    freshwater: "#10B981", // Emerald
    planted: "#8BCF32",    // Creators Green
    marine_reef: "#0284C7",// Reef Blue
  },
  // Parameter Freshness Visual Tokens
  freshness: {
    fresh: "#8BCF32",
    aging: "#F59E0B",
    stale: "#EF4444",
  },
} as const;

export type Colors = typeof colors;
