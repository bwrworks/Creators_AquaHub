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
import { useTanks, Tank, WaterCategory } from "../../src/context/TankContext";
import { getTankImage } from "../../src/utils/tankAssets";
import { AddTankModal } from "../../src/components/modals/AddTankModal";
import { TankDetailModal } from "../../src/components/modals/TankDetailModal";

type CategoryFilter = "all" | WaterCategory;

export default function TanksScreen() {
  const { tanks } = useTanks();

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [isAddTankOpen, setIsAddTankOpen] = useState(false);
  const [selectedTank, setSelectedTank] = useState<Tank | null>(null);

  const filteredTanks = tanks.filter((tank) => {
    if (categoryFilter === "all") return true;
    return tank.category === categoryFilter;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.subtitle}>MY AQUARIUMS</Text>
            <Text style={styles.title}>Living Systems</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.85}
            onPress={() => setIsAddTankOpen(true)}
          >
            <Feather name="plus" size={16} color="#050505" />
            <Text style={styles.addButtonText}>Add Tank</Text>
          </TouchableOpacity>
        </View>

        {/* Category Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {(
            [
              { id: "all", label: "All Systems" },
              { id: "marine_reef", label: "Marine Reef" },
              { id: "planted", label: "Planted Nature" },
              { id: "freshwater", label: "Freshwater" },
            ] as const
          ).map((cat) => {
            const isActive = categoryFilter === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryBadge, isActive && styles.activeCategoryBadge]}
                onPress={() => setCategoryFilter(cat.id)}
                activeOpacity={0.75}
              >
                {isActive && <View style={styles.activePillDot} />}
                <Text style={[styles.categoryText, isActive && styles.activeCategoryText]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Tanks List */}
        {filteredTanks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="droplet" size={42} color={colors.text.muted} />
            <Text style={styles.emptyTitle}>No Aquariums in This Category</Text>
            <Text style={styles.emptyDescription}>
              Add your display tank, frag system, or high-tech aquascape to start tracking chemistry.
            </Text>
            <TouchableOpacity
              style={styles.emptyActionButton}
              onPress={() => setIsAddTankOpen(true)}
            >
              <Text style={styles.emptyActionText}>+ Create New Setup</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.tankList}>
            {filteredTanks.map((tank) => (
              <TouchableOpacity
                key={tank.id}
                style={styles.tankCard}
                onPress={() => setSelectedTank(tank)}
                activeOpacity={0.88}
              >
                {/* Tank Cover Photo with Gradient Scrim */}
                <View style={styles.cardImageContainer}>
                  <Image source={getTankImage(tank)} style={styles.cardImage} resizeMode="cover" />
                  <View style={styles.cardImageScrim} />

                  {/* Overlaid Badges */}
                  <View style={styles.cardImageOverlayTop}>
                    <View style={styles.categoryPill}>
                      <Text style={styles.categoryPillText}>{tank.categoryLabel.toUpperCase()}</Text>
                    </View>
                    <View style={styles.volumePill}>
                      <Feather name="droplet" size={11} color="#FFFFFF" />
                      <Text style={styles.volumePillText}>
                        {tank.volumeLiters} L • {tank.volumeGallons} gal
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardImageOverlayBottom}>
                    <Text style={styles.tankCardTitle} numberOfLines={1}>
                      {tank.name}
                    </Text>
                    <Text style={styles.tankDimensions}>
                      {tank.dimensions.length} × {tank.dimensions.width} × {tank.dimensions.height} cm • Setup {tank.setupDate}
                    </Text>
                  </View>
                </View>

                {/* Card Parameters Quick Bar */}
                <View style={styles.cardParamsContainer}>
                  <View style={styles.cardParamsHeader}>
                    <Text style={styles.cardParamsLabel}>LATEST READINGS</Text>
                    <View style={styles.detailsActionRow}>
                      <Text style={styles.viewDetailsText}>View System</Text>
                      <Feather name="chevron-right" size={14} color={colors.text.secondary} />
                    </View>
                  </View>

                  <View style={styles.paramsChipsRow}>
                    {tank.parameters.slice(0, 4).map((p) => {
                      const dotColor =
                        p.freshness === "fresh"
                          ? colors.brand.green
                          : p.freshness === "aging"
                          ? colors.status.warning
                          : colors.status.danger;

                      return (
                        <View key={p.id} style={styles.paramChip}>
                          <View style={[styles.paramDot, { backgroundColor: dotColor }]} />
                          <Text style={styles.paramChipName}>{p.name}:</Text>
                          <Text style={styles.paramChipValue}>
                            {p.value} {p.unit}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Tank Flow Modal */}
      <AddTankModal visible={isAddTankOpen} onClose={() => setIsAddTankOpen(false)} />

      {/* Tank Detail & Chemistry Logger Modal */}
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
  subtitle: {
    fontFamily: typography.fonts.sansSemiBold,
    fontSize: 10,
    color: colors.text.secondary,
    letterSpacing: 1.5,
  },
  title: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes["2xl"],
    color: "#FFFFFF",
    marginTop: 2,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.brand.green,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.xs,
  },
  addButtonText: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.xs,
    color: "#050505",
    letterSpacing: 0.3,
  },
  categoryRow: {
    flexDirection: "row",
    gap: spacing.xs,
    paddingVertical: 2,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  activeCategoryBadge: {
    backgroundColor: colors.surface.elevated,
    borderColor: colors.border.hover,
  },
  activePillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brand.green,
  },
  categoryText: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  activeCategoryText: {
    color: "#FFFFFF",
    fontFamily: typography.fonts.sansBold,
  },
  tankList: {
    gap: spacing.base,
  },
  tankCard: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.base,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    overflow: "hidden",
  },
  cardImageContainer: {
    height: 160,
    width: "100%",
    position: "relative",
    justifyContent: "space-between",
    padding: spacing.md,
  },
  cardImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  cardImageScrim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(5, 5, 5, 0.5)",
  },
  cardImageOverlayTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryPill: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  categoryPillText: {
    fontFamily: typography.fonts.sansSemiBold,
    fontSize: 9,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  volumePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  volumePillText: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: 10,
    color: "#FFFFFF",
  },
  cardImageOverlayBottom: {
    gap: 2,
  },
  tankCardTitle: {
    fontFamily: typography.fonts.displayMedium,
    fontSize: typography.sizes.lg,
    color: "#FFFFFF",
  },
  tankDimensions: {
    fontFamily: typography.fonts.sans,
    fontSize: 11,
    color: colors.text.secondary,
  },
  cardParamsContainer: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardParamsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardParamsLabel: {
    fontFamily: typography.fonts.sansSemiBold,
    fontSize: 9,
    color: colors.text.muted,
    letterSpacing: 0.8,
  },
  detailsActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  viewDetailsText: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: 11,
    color: colors.text.secondary,
  },
  paramsChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: 2,
  },
  paramChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.surface.base,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.xs,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  paramDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  paramChipName: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: 11,
    color: colors.text.secondary,
  },
  paramChipValue: {
    fontFamily: typography.fonts.sansBold,
    fontSize: 11,
    color: "#FFFFFF",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface.card,
    borderRadius: radii.base,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing["2xl"],
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  emptyTitle: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.base,
    color: "#FFFFFF",
  },
  emptyDescription: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: typography.lineHeights.xs,
    maxWidth: 280,
  },
  emptyActionButton: {
    backgroundColor: colors.brand.green,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.xs,
    marginTop: spacing.xs,
  },
  emptyActionText: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.xs,
    color: "#050505",
  },
});
