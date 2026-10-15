import React from "react";
import { View, Text, ActivityIndicator, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { colors, typography, spacing, radii } from "@cah/design-tokens";

interface LoadingStateProps {
  message?: string;
  submessage?: string;
  fullScreen?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function LoadingState({
  message = "Loading aquarium data...",
  submessage = "Serving from local zero-cost cache",
  fullScreen = false,
  style,
}: LoadingStateProps) {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreenContainer, style]}>
      <View style={styles.indicatorWrapper}>
        <ActivityIndicator size="large" color={colors.brand.green} />
      </View>
      <Text style={styles.messageText}>{message}</Text>
      {submessage ? <Text style={styles.submessageText}>{submessage}</Text> : null}

      {/* Shimmer Placeholder Skeletons */}
      <View style={styles.skeletonGroup}>
        <View style={[styles.skeletonLine, { width: "85%" }]} />
        <View style={[styles.skeletonLine, { width: "65%" }]} />
        <View style={[styles.skeletonLine, { width: "45%" }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.base,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: colors.bg.base,
    borderWidth: 0,
    borderRadius: 0,
    padding: spacing["2xl"],
  },
  indicatorWrapper: {
    marginBottom: spacing.xs,
  },
  messageText: {
    fontFamily: typography.fonts.sansSemiBold,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    textAlign: "center",
  },
  submessageText: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  skeletonGroup: {
    width: "100%",
    gap: spacing.xs,
    alignItems: "center",
  },
  skeletonLine: {
    height: 10,
    backgroundColor: colors.surface.elevated,
    borderRadius: radii.full,
  },
});
