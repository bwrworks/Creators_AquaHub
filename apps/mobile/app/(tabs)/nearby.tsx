import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, typography, spacing, radii } from "@cah/design-tokens";
import { SYNTHETIC_DEMO_STORES } from "@cah/domain";
import { LoadingState, EmptyState, ErrorState, OfflineBanner } from "../../src/components/ui";

type StateMode = "loaded" | "loading" | "empty" | "error" | "offline";

export default function NearbyScreen() {
  const [stateMode, setStateMode] = useState<StateMode>("loaded");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("All");

  const filteredStores = SYNTHETIC_DEMO_STORES.filter((store) => {
    if (selectedSpecialty === "All") return true;
    return store.specialization.some((s) => s.toLowerCase().includes(selectedSpecialty.toLowerCase()));
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {stateMode === "offline" && (
          <OfflineBanner message="Offline Mode • Viewing sample demo listings • 0 network requests" />
        )}

        <View style={styles.header}>
          <View>
            <Text style={styles.subtitle}>LOCAL AQUARIUM NETWORK (PRE-LAUNCH PREVIEW)</Text>
            <Text style={styles.title}>Store Directory (Demo)</Text>
          </View>
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

        {/* Honest Demo Notice: No false claims or fake partner audits */}
        <View style={styles.policyCard}>
          <View style={styles.policyHeader}>
            <Text style={styles.policyTitle}>Sample Directory Preview • Not Real Partners</Text>
            <Text style={styles.policyBadge}>₹0 Pre-Launch Policy</Text>
          </View>
          <Text style={styles.policyText}>
            All store entries below are synthetic mock fixtures created strictly to preview the directory layout and category filters. 
            They do NOT represent genuine business partners, verified audits, or real retail endorsements. Live partner verification opens post-launch.
          </Text>
        </View>

        {/* Conditional States */}
        {stateMode === "loading" && (
          <LoadingState
            message="Loading demo directory preview..."
            submessage="Rendering local synthetic store fixtures"
          />
        )}

        {stateMode === "empty" && (
          <EmptyState
            title="No Sample Stores in Selected Filter"
            description="All demo listings are classified under sample categories. Reset the filter to view all sample placeholders."
            actionLabel="Reset to All Samples"
            onAction={() => setSelectedSpecialty("All")}
          />
        )}

        {stateMode === "error" && (
          <ErrorState
            title="Unable to Query Directory"
            message="Directory preview query timed out. Showing local offline demo fixtures."
            retryLabel="Refresh Preview"
            onRetry={() => setStateMode("loaded")}
          />
        )}

        {(stateMode === "loaded" || stateMode === "offline") && (
          <>
            {/* Filter Pills */}
            <View style={styles.filterRow}>
              {["All", "Planted", "Reef", "Hardscape"].map((spec) => (
                <TouchableOpacity
                  key={spec}
                  style={[
                    styles.filterBadge,
                    selectedSpecialty === spec && styles.activeFilterBadge,
                  ]}
                  onPress={() => setSelectedSpecialty(spec)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.filterText,
                      selectedSpecialty === spec && styles.activeFilterText,
                    ]}
                  >
                    {spec}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Store Cards (Explicitly Labeled Sample Placeholders) */}
            {filteredStores.map((store) => (
              <View key={store.id} style={styles.storeCard}>
                <View style={styles.storeHeader}>
                  <View style={styles.storeTitleArea}>
                    <Text style={styles.storeName}>{store.name}</Text>
                    <Text style={styles.storeArea}>{store.area}, {store.city}</Text>
                  </View>
                  <View style={styles.sampleBadge}>
                    <Text style={styles.sampleBadgeText}>SAMPLE MOCK</Text>
                  </View>
                </View>

                <Text style={styles.storeAddress}>{store.address}</Text>
                <Text style={styles.storeSummary}>{store.contactSummary}</Text>

                {/* Specialties */}
                <View style={styles.tagRow}>
                  {store.specialization.map((spec) => (
                    <View key={spec} style={styles.tag}>
                      <Text style={styles.tagText}>{spec}</Text>
                    </View>
                  ))}
                </View>

                {/* Disclaimer Footer */}
                <View style={styles.storeProvenance}>
                  <Text style={styles.provenanceText}>
                    {store.disclaimer}
                  </Text>
                </View>
              </View>
            ))}

            <TouchableOpacity style={styles.claimButton} activeOpacity={0.85}>
              <Text style={styles.claimButtonText}>+ Register Real Business Profile (Post-Launch)</Text>
            </TouchableOpacity>
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
  policyCard: {
    backgroundColor: colors.surface.elevated,
    borderRadius: radii.base,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.base,
    gap: spacing.xs,
  },
  policyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  policyTitle: {
    fontFamily: typography.fonts.sansSemiBold,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  policyBadge: {
    fontFamily: typography.fonts.sans,
    fontSize: 10,
    color: colors.text.muted,
  },
  policyText: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    lineHeight: typography.lineHeights.xs,
  },
  filterRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  filterBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    backgroundColor: colors.surface.base,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  activeFilterBadge: {
    borderColor: colors.brand.green,
    backgroundColor: "rgba(139, 207, 50, 0.15)",
  },
  filterText: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  activeFilterText: {
    color: colors.brand.green,
    fontFamily: typography.fonts.sansSemiBold,
  },
  storeCard: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.base,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.base,
    gap: spacing.xs,
  },
  storeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  storeTitleArea: {
    flex: 1,
    marginRight: spacing.xs,
  },
  storeName: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
  },
  storeArea: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.xs,
    color: colors.brand.green,
    marginTop: 2,
  },
  sampleBadge: {
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    paddingVertical: 2,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.xs,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.35)",
  },
  sampleBadgeText: {
    fontFamily: typography.fonts.sansBold,
    fontSize: 9,
    color: colors.freshness.aging,
    letterSpacing: 0.5,
  },
  storeAddress: {
    fontFamily: typography.fonts.sans,
    fontSize: 11,
    color: colors.text.muted,
  },
  storeSummary: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    lineHeight: typography.lineHeights.xs,
  },
  tagRow: {
    flexDirection: "row",
    gap: spacing.xs,
    flexWrap: "wrap",
    marginTop: 2,
  },
  tag: {
    backgroundColor: colors.surface.base,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.xs,
  },
  tagText: {
    fontFamily: typography.fonts.sans,
    fontSize: 11,
    color: colors.text.secondary,
  },
  storeProvenance: {
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    paddingTop: spacing.xs,
    marginTop: spacing.xxs,
  },
  provenanceText: {
    fontFamily: typography.fonts.sans,
    fontSize: 10,
    color: colors.text.muted,
    fontStyle: "italic",
  },
  claimButton: {
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.xs,
  },
  claimButtonText: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
});
