import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, typography, spacing, radii } from "@cah/design-tokens";
import { LoadingState, EmptyState, ErrorState, OfflineBanner } from "../../src/components/ui";

type StateMode = "loaded" | "loading" | "empty" | "error" | "offline";

export default function ProfileScreen() {
  const [stateMode, setStateMode] = useState<StateMode>("loaded");

  const handleExportData = () => {
    Alert.alert(
      "Export Tank Data",
      "Your personal aquarium records, water readings, and livestock logs will be packaged into a privacy-safe JSON/CSV bundle.",
      [{ text: "OK" }]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account & Data",
      "This action permanently deletes your profile, tanks, readings, media assets, and AI memory across Supabase, Cloudinary, and Convex. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Proceed to Verify", style: "destructive" },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {stateMode === "offline" && (
          <OfflineBanner message="Offline Mode • Profile cached locally • 0 network requests" />
        )}

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
            message="Loading profile & security settings..."
            submessage="Verifying local cryptographic authentication state"
          />
        )}

        {stateMode === "empty" && (
          <EmptyState
            title="Session Not Found"
            description="You are currently running in anonymous guest mode. Connect your account to enable cloud sync."
            actionLabel="Sign In"
            onAction={() => setStateMode("loaded")}
          />
        )}

        {stateMode === "error" && (
          <ErrorState
            title="Profile Synchronization Error"
            message="Unable to refresh account permissions. Offline cached profile active."
            retryLabel="Retry"
            onRetry={() => setStateMode("loaded")}
          />
        )}

        {(stateMode === "loaded" || stateMode === "offline") && (
          <>
            {/* Profile Card */}
            <View style={styles.profileHeader}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>CA</Text>
              </View>
              <View style={styles.profileMeta}>
                <View style={styles.nameRow}>
                  <Text style={styles.profileName}>Kiran Aquarist</Text>
                  <View style={styles.freeTierBadge}>
                    <Text style={styles.freeTierText}>₹0 FREE TIER</Text>
                  </View>
                </View>
                <Text style={styles.profileHandle}>@kiran_aquascapes • Bengaluru</Text>
              </View>
            </View>

            {/* Account Settings Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account & Preferences</Text>
              <View style={styles.card}>
                <TouchableOpacity style={styles.row}>
                  <Text style={styles.rowText}>Notification Settings</Text>
                  <Text style={styles.rowArrow}>›</Text>
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.row}>
                  <Text style={styles.rowText}>Measurement Units (Litre / dKH / ppm)</Text>
                  <Text style={styles.rowArrow}>›</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Data Ownership & Privacy Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Data Sovereignty & Privacy</Text>
              <View style={styles.card}>
                <TouchableOpacity style={styles.row} onPress={handleExportData}>
                  <Text style={styles.rowText}>Export Personal Tank Data (JSON / CSV)</Text>
                  <Text style={styles.rowArrow}>›</Text>
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.row}>
                  <Text style={styles.rowText}>Privacy Notice & DPDP Disclosures</Text>
                  <Text style={styles.rowArrow}>›</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Irreversible Account Deletion */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Danger Zone</Text>
              <View style={[styles.card, styles.dangerCard]}>
                <TouchableOpacity style={styles.row} onPress={handleDeleteAccount}>
                  <View>
                    <Text style={styles.dangerText}>Delete Account & Data</Text>
                    <Text style={styles.dangerSubtext}>
                      Purges tanks, readings, media and AI memories
                    </Text>
                  </View>
                  <Text style={styles.dangerArrow}>›</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Creators AquaHub v1.0.0 • Creators Aquarium</Text>
              <Text style={styles.footerSubtext}>Built for Indian Aquarists • Where Oceans Meet Nature</Text>
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
    gap: spacing.lg,
    paddingBottom: spacing["2xl"],
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
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.base,
    paddingVertical: spacing.xs,
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: radii.full,
    backgroundColor: colors.surface.elevated,
    borderWidth: 1,
    borderColor: colors.border.active,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.md,
    color: colors.brand.green,
  },
  profileMeta: {
    gap: 2,
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  profileName: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
  },
  freeTierBadge: {
    backgroundColor: "rgba(139, 207, 50, 0.15)",
    paddingVertical: 1,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.xs,
    borderWidth: 1,
    borderColor: "rgba(139, 207, 50, 0.3)",
  },
  freeTierText: {
    fontFamily: typography.fonts.sansBold,
    fontSize: 9,
    color: colors.brand.green,
  },
  profileHandle: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  section: {
    gap: spacing.xs,
  },
  sectionTitle: {
    fontFamily: typography.fonts.sansSemiBold,
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingHorizontal: spacing.xxs,
  },
  card: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.base,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    overflow: "hidden",
  },
  dangerCard: {
    borderColor: "rgba(239, 68, 68, 0.3)",
    backgroundColor: "rgba(239, 68, 68, 0.05)",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.base,
  },
  rowText: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  rowArrow: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.md,
    color: colors.text.muted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.subtle,
  },
  dangerText: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.sm,
    color: colors.status.danger,
  },
  dangerSubtext: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  dangerArrow: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.md,
    color: colors.status.danger,
  },
  footer: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    gap: spacing.xxs,
  },
  footerText: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  footerSubtext: {
    fontFamily: typography.fonts.sans,
    fontSize: 11,
    color: "rgba(163, 166, 159, 0.6)",
  },
});
