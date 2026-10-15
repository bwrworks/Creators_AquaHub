import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, typography, spacing, radii } from "@cah/design-tokens";
import { SYNTHETIC_TANKS, TankWaterCategory } from "@cah/domain";
import { LoadingState, EmptyState, ErrorState, OfflineBanner, StatusBadge } from "../../src/components/ui";

type StateMode = "loaded" | "loading" | "empty" | "error" | "offline";
type CategoryFilter = "all" | TankWaterCategory;

export default function TanksScreen() {
  const [stateMode, setStateMode] = useState<StateMode>("loaded");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");

  const filteredTanks = SYNTHETIC_TANKS.filter((tank) => {
    if (categoryFilter === "all") return true;
    return tank.tankType === categoryFilter;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {stateMode === "offline" && (
          <OfflineBanner message="Offline Mode • Tanks cached locally • 0 network requests" />
        )}

        <View style={styles.header}>
          <View>
            <Text style={styles.subtitle}>MY AQUARIUMS</Text>
            <Text style={styles.title}>Living Systems</Text>
          </View>
          <TouchableOpacity style={styles.addButton} activeOpacity={0.85}>
            <Text style={styles.addButtonText}>+ New Tank</Text>
          </TouchableOpacity>
        </View>

        {/* State Preview Switcher */}
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

        {/* Conditional States */}
        {stateMode === "loading" && (
          <LoadingState
            message="Loading aquarium configurations..."
            submessage="Verifying local water volume metrics"
          />
        )}

        {stateMode === "empty" && (
          <EmptyState
            title="No Aquariums Registered"
            description="Register your display tank, nano setup, or breeding aquarium to maintain precise water chemistry and automated dosing bounds."
            actionLabel="+ Create Tank"
            onAction={() => setStateMode("loaded")}
          />
        )}

        {stateMode === "error" && (
          <ErrorState
            title="Failed to Retrieve Aquariums"
            message="Database query could not complete. Using cached offline storage."
            retryLabel="Reload Tanks"
            onRetry={() => setStateMode("loaded")}
          />
        )}

        {(stateMode === "loaded" || stateMode === "offline") && (
          <>
            {/* Category Filter Tabs */}
            <View style={styles.categoryRow}>
              {(
                [
                  { id: "all", label: "All" },
                  { id: "freshwater", label: "Freshwater" },
                  { id: "planted", label: "Planted" },
                  { id: "marine_reef", label: "Marine Reef" },
                ] as const
              ).map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryBadge,
                    categoryFilter === cat.id && styles.activeCategoryBadge,
                  ]}
                  onPress={() => setCategoryFilter(cat.id)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      categoryFilter === cat.id && styles.activeCategoryText,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Tanks List */}
            {filteredTanks.length === 0 ? (
              <EmptyState
                title="No Tanks in Category"
                description={`You have not added any ${categoryFilter} tanks yet.`}
                actionLabel="View All Tanks"
                onAction={() => setCategoryFilter("all")}
              />
            ) : (
              filteredTanks.map((tank) => (
                <View key={tank.id} style={styles.tankCard}>
                  <View style={styles.tankHeader}>
                    <View style={styles.tankTitleArea}>
                      <Text style={styles.tankName}>{tank.name}</Text>
                      <Text style={styles.tankSetupDate}>Setup: {tank.setupDate}</Text>
                    </View>
                    <StatusBadge type="tankType" value={tank.tankType} />
                  </View>

                  <Text style={styles.tankDesc}>{tank.description}</Text>

                  <View style={styles.tankMetricsRow}>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Volume</Text>
                      <Text style={styles.metricValue}>{tank.volumeLiters} L</Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Freshness</Text>
                      <StatusBadge type="freshness" value={tank.parametersSummary.overallFreshness} />
                    </View>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Readings</Text>
                      <Text style={styles.metricValue}>
                        {tank.parametersSummary.freshCount}F / {tank.parametersSummary.agingCount}A / {tank.parametersSummary.staleCount}S
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardActions}>
                    <TouchableOpacity style={styles.actionButtonOutline} activeOpacity={0.75}>
                      <Text style={styles.actionButtonOutlineText}>View History</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButtonSolid} activeOpacity={0.75}>
                      <Text style={styles.actionButtonSolidText}>+ Log Chemistry</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
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
  subtitle: {
    fontFamily: typography.fonts.sansSemiBold,
    fontSize: typography.sizes.xs,
    color: colors.brand.green,
    letterSpacing: typography.letterSpacing.wider,
  },
  title: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes["2xl"],
    color: colors.text.primary,
    marginTop: spacing.xxs,
  },
  addButton: {
    backgroundColor: colors.brand.green,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
  },
  addButtonText: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.xs,
    color: colors.text.inverse,
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
  categoryRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  categoryBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    backgroundColor: colors.surface.base,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  activeCategoryBadge: {
    backgroundColor: "rgba(139, 207, 50, 0.15)",
    borderColor: colors.brand.green,
  },
  categoryText: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  activeCategoryText: {
    color: colors.brand.green,
    fontFamily: typography.fonts.sansSemiBold,
  },
  tankCard: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.base,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.base,
    gap: spacing.sm,
  },
  tankHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  tankTitleArea: {
    flex: 1,
    marginRight: spacing.xs,
  },
  tankName: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
  },
  tankSetupDate: {
    fontFamily: typography.fonts.sans,
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 2,
  },
  tankDesc: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    lineHeight: typography.lineHeights.xs,
  },
  tankMetricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.surface.base,
    borderRadius: radii.sm,
    padding: spacing.xs,
    marginTop: 2,
  },
  metricItem: {
    alignItems: "center",
    flex: 1,
  },
  metricLabel: {
    fontFamily: typography.fonts.sans,
    fontSize: 10,
    color: colors.text.muted,
    marginBottom: 2,
  },
  metricValue: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.xs,
    color: colors.text.primary,
  },
  cardActions: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.xxs,
  },
  actionButtonOutline: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radii.xs,
    paddingVertical: spacing.xs,
    alignItems: "center",
  },
  actionButtonOutlineText: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  actionButtonSolid: {
    flex: 1,
    backgroundColor: "rgba(139, 207, 50, 0.15)",
    borderWidth: 1,
    borderColor: colors.brand.green,
    borderRadius: radii.xs,
    paddingVertical: spacing.xs,
    alignItems: "center",
  },
  actionButtonSolidText: {
    fontFamily: typography.fonts.sansSemiBold,
    fontSize: typography.sizes.xs,
    color: colors.brand.green,
  },
});
