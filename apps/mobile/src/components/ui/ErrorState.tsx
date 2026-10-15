import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from "react-native";
import { colors, typography, spacing, radii } from "@cah/design-tokens";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function ErrorState({
  title = "Something went wrong",
  message = "Unable to fetch data. Local cached records remain intact and safe.",
  onRetry,
  retryLabel = "Try Again",
  style,
}: ErrorStateProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>NOTICE</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.85}>
          <Text style={styles.retryText}>{retryLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(239, 68, 68, 0.06)",
    borderRadius: radii.base,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.25)",
    padding: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  badge: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.full,
    marginBottom: spacing.xxs,
  },
  badgeText: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.xs,
    color: colors.status.danger,
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    textAlign: "center",
  },
  message: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: typography.lineHeights.xs,
    paddingHorizontal: spacing.sm,
  },
  retryButton: {
    borderWidth: 1,
    borderColor: colors.status.danger,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    marginTop: spacing.xs,
  },
  retryText: {
    fontFamily: typography.fonts.sansSemiBold,
    fontSize: typography.sizes.xs,
    color: colors.status.danger,
  },
});
