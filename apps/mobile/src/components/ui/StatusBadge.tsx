import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, typography, spacing, radii } from "@cah/design-tokens";

interface StatusBadgeProps {
  type: "freshness" | "tankType";
  value: string;
}

export function StatusBadge({ type, value }: StatusBadgeProps) {
  let badgeColor: string = colors.brand.green;
  let label = value;

  if (type === "freshness") {
    switch (value.toLowerCase()) {
      case "fresh":
        badgeColor = colors.freshness.fresh;
        label = "FRESH";
        break;
      case "aging":
        badgeColor = colors.freshness.aging;
        label = "AGING";
        break;
      case "stale":
        badgeColor = colors.freshness.stale;
        label = "STALE";
        break;
    }
  } else if (type === "tankType") {
    switch (value.toLowerCase()) {
      case "planted":
        badgeColor = colors.tankType.planted;
        label = "PLANTED";
        break;
      case "marine_reef":
      case "reef":
        badgeColor = colors.tankType.marine_reef;
        label = "MARINE REEF";
        break;
      case "freshwater":
      default:
        badgeColor = colors.tankType.freshwater;
        label = "FRESHWATER";
        break;
    }
  }

  return (
    <View style={[styles.badge, { borderColor: badgeColor, backgroundColor: `${badgeColor}18` }]}>
      <View style={[styles.dot, { backgroundColor: badgeColor }]} />
      <Text style={[styles.text, { color: badgeColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.full,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: radii.full,
  },
  text: {
    fontFamily: typography.fonts.sansBold,
    fontSize: 9,
    letterSpacing: 0.6,
  },
});
