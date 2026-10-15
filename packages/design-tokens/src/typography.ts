/**
 * Creators AquaHub Official Typography Tokens
 * Matches exact fonts imported by Creators Aquarium:
 * - Playfair Display for headings and editorial moments
 * - Plus Jakarta Sans for UI, navigation, body, forms, and chemical/numeric data
 */

export const typography = {
  fonts: {
    display: "PlayfairDisplay_700Bold",
    displayMedium: "PlayfairDisplay_600SemiBold",
    displayRegular: "PlayfairDisplay_400Regular",
    sans: "PlusJakartaSans_400Regular",
    sansMedium: "PlusJakartaSans_500Medium",
    sansSemiBold: "PlusJakartaSans_600SemiBold",
    sansBold: "PlusJakartaSans_700Bold",
  },
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    "2xl": 28,
    "3xl": 34,
    "4xl": 40,
  },
  lineHeights: {
    xs: 14,
    sm: 18,
    base: 22,
    md: 24,
    lg: 28,
    xl: 32,
    "2xl": 36,
    "3xl": 42,
    "4xl": 48,
  },
  letterSpacing: {
    tighter: -0.8,
    tight: -0.4,
    normal: 0,
    wide: 0.4,
    wider: 0.8,
  },
} as const;

export type Typography = typeof typography;
