import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Platform,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, typography, spacing, radii } from "@cah/design-tokens";
import { useTanks, WaterCategory } from "../../context/TankContext";
import { TANK_HERO_ASSETS } from "../../utils/tankAssets";

interface AddTankModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AddTankModal({ visible, onClose }: AddTankModalProps) {
  const { addTank } = useTanks();

  const [name, setName] = useState("");
  const [category, setCategory] = useState<WaterCategory>("marine_reef");
  const [length, setLength] = useState("90");
  const [width, setWidth] = useState("50");
  const [height, setHeight] = useState("50");
  const [selectedImageKey, setSelectedImageKey] = useState<"planted" | "reef" | "biotope">("reef");
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [description, setDescription] = useState("");

  // Live dimensions-to-volume auto calculation
  const l = parseFloat(length) || 0;
  const w = parseFloat(width) || 0;
  const h = parseFloat(height) || 0;
  const calculatedLitres = Math.round((l * w * h) / 1000);
  const calculatedGallons = Number((calculatedLitres * 0.264172).toFixed(1));

  const handleSave = () => {
    if (!name.trim()) {
      if (Platform.OS === "web") {
        window.alert("Please enter an aquarium name.");
      } else {
        Alert.alert("Name Required", "Please enter a name for your aquarium.");
      }
      return;
    }

    const categoryLabels: Record<WaterCategory, string> = {
      planted: "Nature Aquascape",
      marine_reef: "ReefBay System",
      freshwater: "Freshwater Biotope",
    };

    addTank({
      name: name.trim(),
      category,
      categoryLabel: categoryLabels[category],
      volumeLiters: calculatedLitres > 0 ? calculatedLitres : 100,
      volumeGallons: calculatedGallons > 0 ? calculatedGallons : 26.4,
      dimensions: {
        length: l,
        width: w,
        height: h,
        unit: "cm",
      },
      setupDate: new Date().toISOString().split("T")[0],
      description: description.trim() || `${categoryLabels[category]} managed with Creators AquaHub.`,
      imageKey: customImageUrl.trim() ? "custom" : selectedImageKey,
      customImageUrl: customImageUrl.trim() || undefined,
    });

    // Reset form
    setName("");
    setDescription("");
    setCustomImageUrl("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerEyebrow}>NEW AQUARIUM SETUP</Text>
              <Text style={styles.headerTitle}>Add Living System</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="x" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>
            {/* 1. Tank Category Selection */}
            <Text style={styles.label}>AQUARIUM CATEGORY</Text>
            <View style={styles.categoryRow}>
              {(
                [
                  { id: "marine_reef", label: "Marine Reef", img: "reef" },
                  { id: "planted", label: "Planted Nature", img: "planted" },
                  { id: "freshwater", label: "Freshwater", img: "biotope" },
                ] as const
              ).map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryCard, category === cat.id && styles.activeCategoryCard]}
                  onPress={() => {
                    setCategory(cat.id);
                    setSelectedImageKey(cat.img);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.categoryCardTitle, category === cat.id && styles.activeCategoryCardTitle]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 2. Tank Name */}
            <Text style={styles.label}>AQUARIUM NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Red Sea Reefer 250, ADA 60P Cube..."
              placeholderTextColor={colors.text.muted}
              value={name}
              onChangeText={setName}
            />

            {/* 3. Dimensions & Auto-Calculated Volume */}
            <View style={styles.dimensionsHeader}>
              <Text style={styles.label}>DIMENSIONS (CM)</Text>
              {calculatedLitres > 0 && (
                <View style={styles.volumeBadge}>
                  <Text style={styles.volumeBadgeText}>
                    {calculatedLitres} Litres • {calculatedGallons} US Gal
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.dimensionInputsRow}>
              <View style={styles.dimField}>
                <Text style={styles.dimFieldLabel}>Length</Text>
                <TextInput
                  style={styles.dimInput}
                  keyboardType="numeric"
                  value={length}
                  onChangeText={setLength}
                />
              </View>
              <Text style={styles.dimMultiply}>×</Text>
              <View style={styles.dimField}>
                <Text style={styles.dimFieldLabel}>Width</Text>
                <TextInput
                  style={styles.dimInput}
                  keyboardType="numeric"
                  value={width}
                  onChangeText={setWidth}
                />
              </View>
              <Text style={styles.dimMultiply}>×</Text>
              <View style={styles.dimField}>
                <Text style={styles.dimFieldLabel}>Height</Text>
                <TextInput
                  style={styles.dimInput}
                  keyboardType="numeric"
                  value={height}
                  onChangeText={setHeight}
                />
              </View>
            </View>

            {/* 4. Hero Photo Selection */}
            <Text style={styles.label}>SELECT COVER PHOTO</Text>
            <View style={styles.photoPickerRow}>
              {(["reef", "planted", "biotope"] as const).map((key) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.photoOption, selectedImageKey === key && !customImageUrl && styles.activePhotoOption]}
                  onPress={() => {
                    setSelectedImageKey(key);
                    setCustomImageUrl("");
                  }}
                  activeOpacity={0.8}
                >
                  <Image source={TANK_HERO_ASSETS[key]} style={styles.photoThumb} />
                  {selectedImageKey === key && !customImageUrl && (
                    <View style={styles.selectedPhotoCheck}>
                      <Feather name="check" size={14} color="#050505" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[styles.input, { marginTop: spacing.xs }]}
              placeholder="Or paste custom image URL (https://...)"
              placeholderTextColor={colors.text.muted}
              value={customImageUrl}
              onChangeText={setCustomImageUrl}
            />

            {/* 5. Notes / Description */}
            <Text style={styles.label}>DESCRIPTION & CORAL / PLANT JOURNAL</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Details on filtration, live rock, lighting schedule, and livestock goals..."
              placeholderTextColor={colors.text.muted}
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
            />

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose} activeOpacity={0.7}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleSave} activeOpacity={0.85}>
                <Text style={styles.submitButtonText}>Create Aquarium</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: colors.surface.card,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    maxHeight: "90%",
    paddingBottom: spacing["2xl"],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  headerEyebrow: {
    fontFamily: typography.fonts.sansSemiBold,
    fontSize: 10,
    color: colors.text.muted,
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes.xl,
    color: colors.text.primary,
    marginTop: 2,
  },
  closeButton: {
    padding: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: colors.surface.elevated,
  },
  formScroll: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  label: {
    fontFamily: typography.fonts.sansSemiBold,
    fontSize: 11,
    color: colors.text.muted,
    letterSpacing: 1,
    marginTop: spacing.xs,
  },
  categoryRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  categoryCard: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    backgroundColor: colors.surface.elevated,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: "center",
  },
  activeCategoryCard: {
    borderColor: colors.brand.green,
    backgroundColor: "rgba(139, 207, 50, 0.12)",
  },
  categoryCardTitle: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: 11,
    color: colors.text.secondary,
    textAlign: "center",
  },
  activeCategoryCardTitle: {
    color: colors.text.primary,
    fontFamily: typography.fonts.sansBold,
  },
  input: {
    backgroundColor: colors.surface.base,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radii.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    color: colors.text.primary,
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.sm,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: "top",
  },
  dimensionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  volumeBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingVertical: 2,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.xs,
  },
  volumeBadgeText: {
    fontFamily: typography.fonts.sansBold,
    fontSize: 10,
    color: "#FFFFFF",
  },
  dimensionInputsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  dimField: {
    flex: 1,
  },
  dimFieldLabel: {
    fontFamily: typography.fonts.sans,
    fontSize: 10,
    color: colors.text.muted,
    marginBottom: 2,
  },
  dimInput: {
    backgroundColor: colors.surface.base,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radii.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    color: colors.text.primary,
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.sm,
    textAlign: "center",
  },
  dimMultiply: {
    color: colors.text.muted,
    fontSize: 14,
    marginTop: 14,
  },
  photoPickerRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xxs,
  },
  photoOption: {
    flex: 1,
    height: 70,
    borderRadius: radii.sm,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
  },
  activePhotoOption: {
    borderColor: colors.brand.green,
  },
  photoThumb: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  selectedPhotoCheck: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: colors.brand.green,
    borderRadius: radii.full,
    padding: 2,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  cancelButtonText: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  submitButton: {
    flex: 2,
    backgroundColor: colors.brand.green,
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  submitButtonText: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.sm,
    color: colors.text.inverse,
    letterSpacing: 0.5,
  },
});
