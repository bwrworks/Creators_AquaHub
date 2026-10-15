import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from "react-native";
import { colors, typography, spacing, radii } from "@cah/design-tokens";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onAction ? (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onAction}
          activeOpacity={0.85}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
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
    gap: spacing.sm,
  },
  iconContainer: {
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
    textAlign: "center",
  },
  description: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: typography.lineHeights.base,
    paddingHorizontal: spacing.sm,
  },
  actionButton: {
    backgroundColor: colors.brand.green,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.sm,
    marginTop: spacing.xs,
  },
  actionText: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.xs,
    color: colors.text.inverse,
    letterSpacing: typography.letterSpacing.wide,
  },
});
