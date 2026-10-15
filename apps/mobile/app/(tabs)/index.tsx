import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, typography, spacing, radii } from "@cah/design-tokens";
import { SYNTHETIC_TANKS, SYNTHETIC_READINGS } from "@cah/domain";
import { LoadingState, EmptyState, ErrorState, OfflineBanner, StatusBadge } from "../../src/components/ui";

type StateMode = "loaded" | "loading" | "empty" | "error" | "offline";

export default function HomeScreen() {
  const [stateMode, setStateMode] = useState<StateMode>("loaded");

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Offline Banner if offline mode is active */}
        {stateMode === "offline" && (
          <OfflineBanner message="Offline Mode • Serving local synthetic cache • 0 network bytes" />
        )}

        {/* Brand Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandSubtitle}>CREATORS AQUARIUM</Text>
            <Text style={styles.brandTitle}>Creators AquaHub</Text>
          </View>
          <Image
            source={require("../../assets/brand/icon-clean.png")}
            style={styles.logoIcon}
            resizeMode="contain"
          />
        </View>

        {/* State Preview Switcher for Brand & Visual Review */}
        <View style={styles.stateSelectorContainer}>
          <Text style={styles.stateSelectorLabel}>UI State Preview:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stateButtonsRow}>
            {(["loaded", "loading", "empty", "error", "offline"] as StateMode[]).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.stateButton,
                  stateMode === mode && styles.stateButtonActive,
                ]}
                onPress={() => setStateMode(mode)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.stateButtonText,
                    stateMode === mode && styles.stateButtonTextActive,
                  ]}
                >
                  {mode.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Conditional Rendering Based on StateMode */}
        {stateMode === "loading" && (
          <LoadingState
            message="Loading tank chemistry records..."
            submessage="Checking analytical freshness against local benchmarks"
          />
        )}

        {stateMode === "empty" && (
          <EmptyState
            title="No Aquariums Active"
            description="Add your first freshwater, planted, or marine reef tank to unlock precise parameter tracking, chemical freshness alerts, and dosing safety checks."
            actionLabel="+ Setup First Tank"
            onAction={() => setStateMode("loaded")}
          />
        )}

        {stateMode === "error" && (
          <ErrorState
            title="Telemetry Sync Failed"
            message="Could not reach the local sync service. Stored parameters remain cached and dosing safety guarantees are active."
            retryLabel="Retry Connection"
            onRetry={() => setStateMode("loaded")}
          />
        )}

        {(stateMode === "loaded" || stateMode === "offline") && (
          <>
            {/* AI Assistant Quick Callout */}
            <TouchableOpacity style={styles.aiCard} activeOpacity={0.85}>
              <View style={styles.aiHeaderRow}>
                <View style={styles.aiBadge}>
                  <Text style={styles.aiBadgeText}>AI COMPANION</Text>
                </View>
                <Text style={styles.freeTierBadge}>₹0 Pre-Launch Quota</Text>
              </View>
              <Text style={styles.aiTitle}>AquaHub AI</Text>
              <Text style={styles.aiDescription}>
                Evidence-grounded assistant for water chemistry, species care, and safe maintenance routines.
              </Text>
              <View style={styles.aiActionRow}>
                <Text style={styles.aiActionText}>Ask AquaHub AI →</Text>
              </View>
            </TouchableOpacity>

            {/* Daily Aquarium Overview */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Daily Overview</Text>
              <Text style={styles.sectionMeta}>Active Tanks: {SYNTHETIC_TANKS.length}</Text>
            </View>

            {/* Synthetic Tanks Quick Cards */}
            <View style={styles.tanksSummaryGrid}>
              {SYNTHETIC_TANKS.map((tank) => (
                <View key={tank.id} style={styles.tankSummaryCard}>
                  <View style={styles.tankCardHeader}>
                    <Text style={styles.tankName} numberOfLines={1}>{tank.name}</Text>
                    <StatusBadge type="tankType" value={tank.tankType} />
                  </View>
                  <Text style={styles.tankMeta}>
                    Volume: {tank.volumeLiters} L • Status: {tank.privacy.toUpperCase()}
                  </Text>
                  <View style={styles.freshnessRow}>
                    <Text style={styles.freshnessLabel}>Freshness:</Text>
                    <StatusBadge type="freshness" value={tank.parametersSummary.overallFreshness} />
                  </View>
                </View>
              ))}
            </View>

            {/* Recent Chemical Readings with 3-State Freshness */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Latest Chemical Readings</Text>
              <Text style={styles.sectionMeta}>{SYNTHETIC_READINGS.length} logged</Text>
            </View>

            <View style={styles.readingsList}>
              {SYNTHETIC_READINGS.slice(0, 3).map((reading) => (
                <View key={reading.id} style={styles.readingCard}>
                  <View style={styles.readingHeader}>
                    <View>
                      <Text style={styles.paramName}>{reading.parameterName}</Text>
                      <Text style={styles.paramKit}>{reading.testKit || "Test Kit"}</Text>
                    </View>
                    <StatusBadge type="freshness" value={reading.freshness} />
                  </View>
                  <View style={styles.readingValueRow}>
                    <Text style={styles.paramValue}>
                      {reading.value} <Text style={styles.paramUnit}>{reading.unit}</Text>
                    </Text>
                    <Text style={styles.idealRange}>Target: {reading.idealRange}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Chemical Freshness Standard Legend */}
            <View style={styles.freshnessLegendCard}>
              <Text style={styles.legendTitle}>Chemical Freshness Standard</Text>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: colors.freshness.fresh }]} />
                <Text style={styles.legendText}>Fresh: Active analytical confidence for dosing</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: colors.freshness.aging }]} />
                <Text style={styles.legendText}>Aging: Approaching expiry; retest advised before changes</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: colors.freshness.stale }]} />
                <Text style={styles.legendText}>Stale: Expired; calculation calculator rejects input</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg.base,
  },
  container: {
    padding: spacing.base,
    gap: spacing.base,
    paddingBottom: spacing["2xl"],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  brandSubtitle: {
    fontFamily: typography.fonts.sansSemiBold,
    fontSize: typography.sizes.xs,
    color: colors.brand.green,
    letterSpacing: typography.letterSpacing.wider,
  },
  brandTitle: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes["2xl"],
    color: colors.text.primary,
    marginTop: spacing.xxs,
  },
  logoIcon: {
    width: 44,
    height: 44,
  },
  stateSelectorContainer: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  stateSelectorLabel: {
    fontFamily: typography.fonts.sansSemiBold,
    fontSize: 10,
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  stateButtonsRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  stateButton: {
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.xs,
    backgroundColor: colors.surface.base,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  stateButtonActive: {
    borderColor: colors.brand.green,
    backgroundColor: "rgba(139, 207, 50, 0.15)",
  },
  stateButtonText: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: 10,
    color: colors.text.secondary,
  },
  stateButtonTextActive: {
    color: colors.brand.green,
    fontFamily: typography.fonts.sansBold,
  },
  aiCard: {
    backgroundColor: colors.surface.elevated,
    borderRadius: radii.base,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.base,
    gap: spacing.xs,
  },
  aiHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  aiBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(139, 207, 50, 0.15)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.xs,
  },
  aiBadgeText: {
    fontFamily: typography.fonts.sansSemiBold,
    fontSize: typography.sizes.xs,
    color: colors.brand.green,
    letterSpacing: 0.5,
  },
  freeTierBadge: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: 10,
    color: colors.text.muted,
  },
  aiTitle: {
    fontFamily: typography.fonts.displayMedium,
    fontSize: typography.sizes.xl,
    color: colors.text.primary,
  },
  aiDescription: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeights.sm,
  },
  aiActionRow: {
    marginTop: spacing.xs,
  },
  aiActionText: {
    fontFamily: typography.fonts.sansSemiBold,
    fontSize: typography.sizes.sm,
    color: colors.brand.green,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
  },
  sectionMeta: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
  },
  tanksSummaryGrid: {
    gap: spacing.xs,
  },
  tankSummaryCard: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  tankCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tankName: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.xs,
  },
  tankMeta: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  freshnessRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: 2,
  },
  freshnessLabel: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: 11,
    color: colors.text.muted,
  },
  readingsList: {
    gap: spacing.xs,
  },
  readingCard: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  readingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  paramName: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
  },
  paramKit: {
    fontFamily: typography.fonts.sans,
    fontSize: 10,
    color: colors.text.muted,
  },
  readingValueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: 2,
  },
  paramValue: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.lg,
    color: colors.brand.green,
  },
  paramUnit: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  idealRange: {
    fontFamily: typography.fonts.sans,
    fontSize: 11,
    color: colors.text.muted,
  },
  freshnessLegendCard: {
    backgroundColor: colors.surface.base,
    borderRadius: radii.base,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.base,
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  legendTitle: {
    fontFamily: typography.fonts.sansSemiBold,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
});
