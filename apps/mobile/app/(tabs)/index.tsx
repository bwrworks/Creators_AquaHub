import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { colors, typography, spacing, radii } from "@cah/design-tokens";
import { useTanks, Tank } from "../../src/context/TankContext";
import { getTankImage } from "../../src/utils/tankAssets";
import { AddTankModal } from "../../src/components/modals/AddTankModal";
import { TankDetailModal } from "../../src/components/modals/TankDetailModal";
import { LoadingState, EmptyState, ErrorState, OfflineBanner } from "../../src/components/ui";

type StateMode = "loaded" | "loading" | "empty" | "error" | "offline";

export default function HomeScreen() {
  const { tanks, user } = useTanks();

  const [stateMode, setStateMode] = useState<StateMode>("loaded");
  const [isAddTankOpen, setIsAddTankOpen] = useState(false);
  const [selectedTank, setSelectedTank] = useState<Tank | null>(null);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Offline Banner if offline mode is active */}
        {stateMode === "offline" && (
          <OfflineBanner message="Offline Mode • Serving local encrypted cache • 0 network bytes" />
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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.stateButtonsRow}
          >
            {(["loaded", "loading", "empty", "error", "offline"] as StateMode[]).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[styles.stateButton, stateMode === mode && styles.stateButtonActive]}
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
            onAction={() => {
              setStateMode("loaded");
              setIsAddTankOpen(true);
            }}
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
            {/* Quick Hero Banner: ReefBay Style Tank Showcase */}
            <View style={styles.heroTankCard}>
              {tanks.length > 0 ? (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setSelectedTank(tanks[0])}
                  style={styles.heroInnerTouch}
                >
                  <Image
                    source={getTankImage(tanks[0])}
                    style={styles.heroTankImage}
                    resizeMode="cover"
                  />
                  <View style={styles.heroTankScrim} />

                  <View style={styles.heroTankTop}>
                    <View style={styles.heroPill}>
                      <Text style={styles.heroPillText}>PRIMARY DISPLAY</Text>
                    </View>
                    <View style={styles.heroVolumePill}>
                      <Text style={styles.heroVolumeText}>
                        {tanks[0].volumeLiters} L • {tanks[0].volumeGallons} gal
                      </Text>
                    </View>
                  </View>

                  <View style={styles.heroTankBottom}>
                    <Text style={styles.heroTankTitle}>{tanks[0].name}</Text>
                    <Text style={styles.heroTankCategory}>{tanks[0].categoryLabel}</Text>
                    <View style={styles.heroTelemetryBar}>
                      {tanks[0].parameters.slice(0, 3).map((p) => (
                        <View key={p.id} style={styles.heroTelemItem}>
                          <Text style={styles.heroTelemLabel}>{p.name}</Text>
                          <Text style={styles.heroTelemValue}>
                            {p.value} <Text style={styles.heroTelemUnit}>{p.unit}</Text>
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </TouchableOpacity>
              ) : (
                <View style={styles.heroEmptyBanner}>
                  <Text style={styles.heroEmptyTitle}>No Aquariums Added</Text>
                  <TouchableOpacity
                    style={styles.setupTankBtn}
                    onPress={() => setIsAddTankOpen(true)}
                  >
                    <Text style={styles.setupTankBtnText}>+ Add Your First Tank</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Quick Action Bar */}
            <View style={styles.quickActionsRow}>
              <TouchableOpacity
                style={styles.actionTile}
                onPress={() => setIsAddTankOpen(true)}
                activeOpacity={0.8}
              >
                <View style={styles.actionTileIcon}>
                  <Feather name="plus-circle" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.actionTileTitle}>Add Tank</Text>
                <Text style={styles.actionTileSub}>Setup & photos</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionTile}
                onPress={() => {
                  if (tanks.length > 0) {
                    setSelectedTank(tanks[0]);
                  } else {
                    setIsAddTankOpen(true);
                  }
                }}
                activeOpacity={0.8}
              >
                <View style={styles.actionTileIcon}>
                  <Feather name="activity" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.actionTileTitle}>Log Test</Text>
                <Text style={styles.actionTileSub}>Water chemistry</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionTile}
                activeOpacity={0.8}
              >
                <View style={styles.actionTileIcon}>
                  <Feather name="cpu" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.actionTileTitle}>AquaHub AI</Text>
                <Text style={styles.actionTileSub}>Assistant</Text>
              </TouchableOpacity>
            </View>

            {/* Living Systems Overview */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Living Systems</Text>
              <Text style={styles.sectionMeta}>{tanks.length} Registered</Text>
            </View>

            <View style={styles.tanksSummaryGrid}>
              {tanks.map((tank) => (
                <TouchableOpacity
                  key={tank.id}
                  style={styles.tankSummaryCard}
                  onPress={() => setSelectedTank(tank)}
                  activeOpacity={0.85}
                >
                  <Image source={getTankImage(tank)} style={styles.tankThumb} resizeMode="cover" />
                  <View style={styles.tankSummaryMeta}>
                    <View style={styles.tankCardHeader}>
                      <Text style={styles.tankName} numberOfLines={1}>
                        {tank.name}
                      </Text>
                      <Feather name="chevron-right" size={16} color={colors.text.muted} />
                    </View>
                    <Text style={styles.tankMeta}>
                      {tank.categoryLabel} • {tank.volumeLiters} L ({tank.volumeGallons} gal)
                    </Text>
                    <View style={styles.freshnessRow}>
                      <View style={styles.greenDot} />
                      <Text style={styles.freshnessValue}>
                        {tank.parameters.length} Parameters Tracked
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Recent Chemical Readings with 3-State Freshness */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Key Chemistry Telemetry</Text>
              <Text style={styles.sectionMeta}>
                {tanks[0]?.name ? `Display: ${tanks[0].name}` : "Local Cache"}
              </Text>
            </View>

            <View style={styles.readingsList}>
              {(tanks[0]?.parameters || []).slice(0, 4).map((reading) => {
                const dotColor =
                  reading.freshness === "fresh"
                    ? colors.brand.green
                    : reading.freshness === "aging"
                    ? colors.status.warning
                    : colors.status.danger;

                return (
                  <View key={reading.id} style={styles.readingCard}>
                    <View style={styles.readingHeader}>
                      <View>
                        <Text style={styles.paramName}>{reading.name}</Text>
                        <Text style={styles.paramKit}>{reading.testKit || "Digital Meter"}</Text>
                      </View>
                      <View style={styles.freshnessChip}>
                        <View style={[styles.freshnessIndicatorDot, { backgroundColor: dotColor }]} />
                        <Text style={styles.freshnessChipText}>
                          {reading.freshness.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    {/* Crisp pure white reading */}
                    <View style={styles.readingValueRow}>
                      <Text style={styles.paramValue}>
                        {reading.value} <Text style={styles.paramUnit}>{reading.unit}</Text>
                      </Text>
                      <Text style={styles.idealRange}>Target: {reading.idealRange}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* AI Assistant Quick Callout */}
            <View style={styles.aiCard}>
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

      {/* Modals */}
      <AddTankModal visible={isAddTankOpen} onClose={() => setIsAddTankOpen(false)} />
      <TankDetailModal
        visible={!!selectedTank}
        tank={selectedTank}
        onClose={() => setSelectedTank(null)}
      />
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
    fontSize: 10,
    color: colors.text.secondary,
    letterSpacing: 1.5,
  },
  brandTitle: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes["2xl"],
    color: "#FFFFFF",
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
    borderColor: colors.border.hover,
    backgroundColor: colors.surface.elevated,
  },
  stateButtonText: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: 10,
    color: colors.text.secondary,
  },
  stateButtonTextActive: {
    color: "#FFFFFF",
    fontFamily: typography.fonts.sansBold,
  },
  heroTankCard: {
    height: 200,
    borderRadius: radii.base,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    overflow: "hidden",
    position: "relative",
    backgroundColor: colors.surface.card,
  },
  heroInnerTouch: {
    flex: 1,
    justifyContent: "space-between",
    padding: spacing.md,
  },
  heroTankImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  heroTankScrim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(5, 5, 5, 0.55)",
  },
  heroTankTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroPill: {
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  heroPillText: {
    fontFamily: typography.fonts.sansSemiBold,
    fontSize: 9,
    color: "#FFFFFF",
    letterSpacing: 0.8,
  },
  heroVolumePill: {
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  heroVolumeText: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: 10,
    color: "#FFFFFF",
  },
  heroTankBottom: {
    gap: 3,
  },
  heroTankTitle: {
    fontFamily: typography.fonts.displayMedium,
    fontSize: typography.sizes.xl,
    color: "#FFFFFF",
  },
  heroTankCategory: {
    fontFamily: typography.fonts.sans,
    fontSize: 11,
    color: colors.text.secondary,
  },
  heroTelemetryBar: {
    flexDirection: "row",
    gap: spacing.lg,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.15)",
  },
  heroTelemItem: {
    gap: 1,
  },
  heroTelemLabel: {
    fontFamily: typography.fonts.sans,
    fontSize: 9,
    color: colors.text.muted,
  },
  heroTelemValue: {
    fontFamily: typography.fonts.sansBold,
    fontSize: 13,
    color: "#FFFFFF",
  },
  heroTelemUnit: {
    fontFamily: typography.fonts.sans,
    fontSize: 9,
    color: colors.text.secondary,
  },
  heroEmptyBanner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.base,
  },
  heroEmptyTitle: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.base,
    color: "#FFFFFF",
  },
  setupTankBtn: {
    backgroundColor: colors.brand.green,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.xs,
  },
  setupTankBtnText: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.xs,
    color: "#050505",
  },
  quickActionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionTile: {
    flex: 1,
    backgroundColor: colors.surface.card,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.sm,
    alignItems: "center",
    gap: 2,
  },
  actionTileIcon: {
    width: 34,
    height: 34,
    borderRadius: radii.xs,
    backgroundColor: colors.surface.elevated,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  actionTileTitle: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.xs,
    color: "#FFFFFF",
  },
  actionTileSub: {
    fontFamily: typography.fonts.sans,
    fontSize: 10,
    color: colors.text.muted,
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
    color: "#FFFFFF",
  },
  sectionMeta: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  tanksSummaryGrid: {
    gap: spacing.sm,
  },
  tankSummaryCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface.card,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.sm,
  },
  tankThumb: {
    width: 56,
    height: 56,
    borderRadius: radii.xs,
    backgroundColor: colors.surface.elevated,
  },
  tankSummaryMeta: {
    flex: 1,
    gap: 2,
  },
  tankCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tankName: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.sm,
    color: "#FFFFFF",
    flex: 1,
    marginRight: spacing.xs,
  },
  tankMeta: {
    fontFamily: typography.fonts.sans,
    fontSize: 11,
    color: colors.text.secondary,
  },
  freshnessRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brand.green,
  },
  freshnessValue: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: 10,
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
    fontSize: typography.sizes.sm,
    color: "#FFFFFF",
  },
  paramKit: {
    fontFamily: typography.fonts.sans,
    fontSize: 10,
    color: colors.text.muted,
  },
  freshnessChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.surface.base,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.xs,
  },
  freshnessIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  freshnessChipText: {
    fontFamily: typography.fonts.sansBold,
    fontSize: 9,
    color: colors.text.secondary,
  },
  readingValueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: 2,
  },
  paramValue: {
    fontFamily: typography.fonts.sansBold,
    fontSize: 22,
    color: "#FFFFFF", // Pure crisp white value
  },
  paramUnit: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  idealRange: {
    fontFamily: typography.fonts.sans,
    fontSize: 11,
    color: colors.text.secondary,
  },
  aiCard: {
    backgroundColor: colors.surface.card,
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
    backgroundColor: colors.surface.elevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.xs,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  aiBadgeText: {
    fontFamily: typography.fonts.sansSemiBold,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
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
    color: "#FFFFFF",
  },
  aiDescription: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeights.sm,
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
    color: "#FFFFFF",
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
