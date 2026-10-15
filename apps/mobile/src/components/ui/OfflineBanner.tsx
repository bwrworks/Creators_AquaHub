import React from "react";
import { View, Text, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { colors, typography, spacing, radii } from "@cah/design-tokens";

interface OfflineBannerProps {
  message?: string;
  style?: StyleProp<ViewStyle>;
}

export function OfflineBanner({
  message = "Offline Mode • Serving local zero-cost cache • 0 network bytes used",
  style,
}: OfflineBannerProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.dot} />
      <Text style={styles.message} numberOfLines={1} ellipsizeMode="tail">
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radii.full,
    backgroundColor: colors.freshness.aging,
  },
  message: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: typography.sizes.xs,
    color: colors.freshness.aging,
    flex: 1,
  },
});
