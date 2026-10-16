import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, typography, spacing, radii } from "@cah/design-tokens";
import {
  calculateDosing,
  ProductDosingSpec,
  STANDARD_REVIEWED_PRODUCTS,
  DosingCalculationResult,
} from "@cah/domain";
import { useTanks, Tank } from "../../context/TankContext";

interface DosingCalculatorModalProps {
  visible: boolean;
  tank?: Tank | null;
  onClose: () => void;
}

export function DosingCalculatorModal({ visible, tank: propTank, onClose }: DosingCalculatorModalProps) {
  const { tanks, logParameter } = useTanks();

  // Selected tank state (default to propTank or first tank)
  const [selectedTankId, setSelectedTankId] = useState<string>(
    propTank?.id || (tanks.length > 0 ? tanks[0].id : "")
  );

  const activeTank = tanks.find((t) => t.id === selectedTankId) || propTank || tanks[0];

  // Selected Product & Parameters
  const [selectedProductId, setSelectedProductId] = useState<string>("cah-reef-alk");
  const [currentVal, setCurrentVal] = useState<string>("7.6");
  const [targetVal, setTargetVal] = useState<string>("8.3");

  // Calculation Result & Error State
  const [calcResult, setCalcResult] = useState<DosingCalculationResult | null>(null);
  const [calcError, setCalcError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const selectedProduct: ProductDosingSpec =
    STANDARD_REVIEWED_PRODUCTS.find((p) => p.productId === selectedProductId) ||
    STANDARD_REVIEWED_PRODUCTS[0];

  // Update inputs whenever active tank or product changes
  useEffect(() => {
    if (activeTank) {
      const paramSlug = selectedProduct.targetParameterSlug;
      const existingParam = activeTank.parameters.find(
        (p) => p.slug === paramSlug || p.name.toLowerCase().includes(paramSlug)
      );
      if (existingParam) {
        setCurrentVal(existingParam.value.toString());
        // Sensible default target based on parameter
        if (paramSlug === "alk") setTargetVal("8.3");
        else if (paramSlug === "ca") setTargetVal("430");
        else if (paramSlug === "mg") setTargetVal("1380");
        else if (paramSlug === "no3") setTargetVal("5.0");
      }
    }
  }, [selectedTankId, selectedProductId]);

  // Recalculate dosing automatically
  useEffect(() => {
    if (!activeTank) return;

    const currentNum = parseFloat(currentVal);
    const targetNum = parseFloat(targetVal);

    if (isNaN(currentNum) || isNaN(targetNum)) {
      setCalcResult(null);
      setCalcError("Please enter valid numeric readings.");
      return;
    }

    if (targetNum <= currentNum) {
      setCalcResult(null);
      setCalcError(
        `Current level (${currentNum}) is already at or above target (${targetNum}). No additive dosing required.`
      );
      return;
    }

    try {
      const result = calculateDosing(
        {
          netWaterVolumeLitres: activeTank.volumeLiters,
          currentReading: {
            value: currentNum,
            unit: selectedProduct.standardConcentrationRate.parameterUnit,
            freshness: "fresh",
          },
          targetValue: targetNum,
          productSpec: selectedProduct,
        },
        { allowSimulation: true } // Deterministic safety simulation
      );

      setCalcResult(result);
      setCalcError(null);
      setSaveSuccess(false);
    } catch (err: any) {
      setCalcResult(null);
      setCalcError(err?.message || "Calculation failed safety bounds check.");
    }
  }, [currentVal, targetVal, selectedProductId, selectedTankId, activeTank]);

  const handleRecordDose = () => {
    if (!calcResult || !activeTank) return;

    // Log new target parameter to tank
    const paramSlug = selectedProduct.targetParameterSlug;
    const presetName =
      paramSlug === "alk"
        ? "Alkalinity"
        : paramSlug === "ca"
        ? "Calcium (Ca)"
        : paramSlug === "mg"
        ? "Magnesium (Mg)"
        : "Nitrate (NO3)";

    logParameter(activeTank.id, {
      slug: paramSlug,
      name: presetName,
      value: parseFloat(targetVal),
      unit: selectedProduct.standardConcentrationRate.parameterUnit,
      idealRange: `${targetVal} ${selectedProduct.standardConcentrationRate.parameterUnit}`,
      testKit: `Dosed: ${selectedProduct.productName}`,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <View style={styles.headerBadge}>
                <Feather name="shield" size={10} color={colors.brand.green} />
                <Text style={styles.headerBadgeText}>DETERMINISTIC DOSING ENGINE</Text>
              </View>
              <Text style={styles.title}>Water Chemistry Dosing</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="x" size={18} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Aquarium Selector */}
            <View style={styles.sectionGroup}>
              <Text style={styles.sectionLabel}>TARGET AQUARIUM</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tankPillsRow}>
                {tanks.map((t) => {
                  const isSelected = (activeTank?.id || "") === t.id;
                  return (
                    <TouchableOpacity
                      key={t.id}
                      style={[styles.tankPill, isSelected && styles.activeTankPill]}
                      onPress={() => setSelectedTankId(t.id)}
                    >
                      {isSelected && <View style={styles.activePillDot} />}
                      <Text style={[styles.tankPillText, isSelected && styles.activeTankPillText]}>
                        {t.name} ({t.volumeLiters} L)
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Reviewed Chemical Product Selector */}
            <View style={styles.sectionGroup}>
              <Text style={styles.sectionLabel}>VERIFIED PRODUCT SPECIFICATION</Text>
              <View style={styles.productsGrid}>
                {STANDARD_REVIEWED_PRODUCTS.map((prod) => {
                  const isSelected = selectedProductId === prod.productId;
                  return (
                    <TouchableOpacity
                      key={prod.productId}
                      style={[styles.productCard, isSelected && styles.activeProductCard]}
                      onPress={() => setSelectedProductId(prod.productId)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.productCardHeader}>
                        <Text style={[styles.productName, isSelected && styles.activeProductName]} numberOfLines={1}>
                          {prod.productName}
                        </Text>
                        <View style={styles.reviewedBadge}>
                          <Text style={styles.reviewedBadgeText}>REVIEWED</Text>
                        </View>
                      </View>
                      <Text style={styles.productConcentration}>
                        Rate: {prod.standardConcentrationRate.productAmount} {prod.standardConcentrationRate.productUnit} /{" "}
                        {prod.standardConcentrationRate.targetWaterVolumeLitres}L (+
                        {prod.standardConcentrationRate.parameterDelta}{" "}
                        {prod.standardConcentrationRate.parameterUnit})
                      </Text>
                      <Text style={styles.productLimit}>
                        Max shift: +{prod.maxDailyShift} {prod.standardConcentrationRate.parameterUnit}/day
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Parameter Readings Input Row */}
            <View style={styles.sectionGroup}>
              <Text style={styles.sectionLabel}>
                MEASUREMENTS ({selectedProduct.standardConcentrationRate.parameterUnit.toUpperCase()})
              </Text>
              <View style={styles.inputsRow}>
                <View style={styles.inputBox}>
                  <Text style={styles.inputLabel}>Current Reading</Text>
                  <TextInput
                    style={styles.numericInput}
                    keyboardType="numeric"
                    value={currentVal}
                    onChangeText={setCurrentVal}
                    placeholder="0.0"
                    placeholderTextColor={colors.text.muted}
                  />
                  <Text style={styles.unitSub}>{selectedProduct.standardConcentrationRate.parameterUnit}</Text>
                </View>

                <View style={styles.arrowContainer}>
                  <Feather name="arrow-right" size={20} color={colors.text.muted} />
                </View>

                <View style={styles.inputBox}>
                  <Text style={styles.inputLabel}>Target Goal</Text>
                  <TextInput
                    style={styles.numericInput}
                    keyboardType="numeric"
                    value={targetVal}
                    onChangeText={setTargetVal}
                    placeholder="0.0"
                    placeholderTextColor={colors.text.muted}
                  />
                  <Text style={styles.unitSub}>{selectedProduct.standardConcentrationRate.parameterUnit}</Text>
                </View>
              </View>
            </View>

            {/* Error or Safety Warning */}
            {calcError && (
              <View style={styles.errorBox}>
                <Feather name="alert-circle" size={16} color={colors.status.warning} />
                <Text style={styles.errorText}>{calcError}</Text>
              </View>
            )}

            {/* Calculation Output Card */}
            {calcResult && (
              <View style={styles.resultCard}>
                <View style={styles.resultTopRow}>
                  <Text style={styles.resultEyebrow}>DETERMINISTIC DOSING PLAN</Text>
                  <View style={styles.simulationTag}>
                    <Text style={styles.simulationTagText}>SIMULATION READY</Text>
                  </View>
                </View>

                {/* Big numbers */}
                <View style={styles.dosageNumbersRow}>
                  <View style={styles.dosageBlock}>
                    <Text style={styles.dosageLabel}>Daily Dose Amount</Text>
                    <View style={styles.valueRow}>
                      <Text style={styles.dosageNumber}>{calcResult.recommendedDailyProductAmount}</Text>
                      <Text style={styles.dosageUnit}> {calcResult.productUnit} / day</Text>
                    </View>
                  </View>

                  <View style={styles.dosageDivider} />

                  <View style={styles.dosageBlock}>
                    <Text style={styles.dosageLabel}>Total Required</Text>
                    <View style={styles.valueRow}>
                      <Text style={styles.dosageNumber}>{calcResult.totalRequiredProductAmount}</Text>
                      <Text style={styles.dosageUnit}> {calcResult.productUnit}</Text>
                    </View>
                  </View>
                </View>

                {/* Safe Pacing Timeline */}
                <View style={styles.pacingContainer}>
                  <View style={styles.pacingHeader}>
                    <Feather name="clock" size={12} color={colors.brand.green} />
                    <Text style={styles.pacingTitle}>
                      Pacing: {calcResult.numberOfDaysToTarget} Day(s) Safe Schedule
                    </Text>
                  </View>
                  <Text style={styles.pacingDesc}>
                    Limited to +{selectedProduct.maxDailyShift}{" "}
                    {selectedProduct.standardConcentrationRate.parameterUnit}/day to prevent livestock shock.
                  </Text>
                </View>

                {/* Safety Notes List */}
                <View style={styles.notesList}>
                  {calcResult.notes.map((note, idx) => (
                    <View key={idx} style={styles.noteItem}>
                      <View style={styles.noteDot} />
                      <Text style={styles.noteText}>{note}</Text>
                    </View>
                  ))}
                  <View style={styles.noteItem}>
                    <View style={styles.noteDot} />
                    <Text style={styles.noteText}>{selectedProduct.instructions}</Text>
                  </View>
                </View>

                {/* Action button */}
                <TouchableOpacity
                  style={[styles.recordButton, saveSuccess && styles.recordButtonSuccess]}
                  onPress={handleRecordDose}
                  activeOpacity={0.85}
                >
                  <Feather
                    name={saveSuccess ? "check-circle" : "save"}
                    size={16}
                    color={saveSuccess ? "#FFFFFF" : "#050505"}
                  />
                  <Text style={[styles.recordButtonText, saveSuccess && styles.recordButtonTextSuccess]}>
                    {saveSuccess ? "Dosing Recorded to Tank!" : "Record Plan to Water Log"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Zero Paid Policy Disclaimer */}
            <View style={styles.footerPolicyCard}>
              <Feather name="info" size={14} color={colors.text.muted} />
              <Text style={styles.footerPolicyText}>
                Zero-Hallucination Guarantee: Chemical math runs purely via client-side unit-tested algorithms in
                @cah/domain. No generative model hallucinations. Real automated dispensing remains disabled pre-launch
                pending biochemist certification.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: colors.surface.base,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    maxHeight: "90%",
    padding: spacing.base,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(139, 207, 50, 0.12)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.xs,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  headerBadgeText: {
    fontFamily: typography.fonts.sansSemiBold,
    fontSize: 9,
    color: colors.brand.green,
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes.xl,
    color: "#FFFFFF",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface.elevated,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollBody: {
    marginTop: spacing.base,
  },
  sectionGroup: {
    gap: spacing.xs,
    marginBottom: spacing.base,
  },
  sectionLabel: {
    fontFamily: typography.fonts.sansSemiBold,
    fontSize: 10,
    color: colors.text.secondary,
    letterSpacing: 1,
  },
  tankPillsRow: {
    flexDirection: "row",
    gap: spacing.xs,
    paddingVertical: 2,
  },
  tankPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  activeTankPill: {
    backgroundColor: colors.surface.elevated,
    borderColor: colors.border.hover,
  },
  activePillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brand.green,
  },
  tankPillText: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  activeTankPillText: {
    fontFamily: typography.fonts.sansBold,
    color: "#FFFFFF",
  },
  productsGrid: {
    gap: spacing.xs,
  },
  productCard: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.sm,
    gap: 2,
  },
  activeProductCard: {
    borderColor: colors.border.hover,
    backgroundColor: colors.surface.elevated,
  },
  productCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productName: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    flex: 1,
  },
  activeProductName: {
    color: "#FFFFFF",
  },
  reviewedBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radii.xs,
  },
  reviewedBadgeText: {
    fontFamily: typography.fonts.sansBold,
    fontSize: 8,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  productConcentration: {
    fontFamily: typography.fonts.sans,
    fontSize: 10,
    color: colors.text.secondary,
  },
  productLimit: {
    fontFamily: typography.fonts.sans,
    fontSize: 10,
    color: colors.text.muted,
  },
  inputsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  inputBox: {
    flex: 1,
    backgroundColor: colors.surface.card,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.sm,
    alignItems: "center",
  },
  inputLabel: {
    fontFamily: typography.fonts.sans,
    fontSize: 10,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  numericInput: {
    fontFamily: typography.fonts.sansBold,
    fontSize: 26,
    color: "#FFFFFF",
    textAlign: "center",
    paddingVertical: 2,
  },
  unitSub: {
    fontFamily: typography.fonts.sans,
    fontSize: 10,
    color: colors.text.muted,
  },
  arrowContainer: {
    paddingHorizontal: 4,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
    padding: spacing.sm,
    marginBottom: spacing.base,
  },
  errorText: {
    fontFamily: typography.fonts.sans,
    fontSize: 11,
    color: colors.status.warning,
    flex: 1,
    lineHeight: 16,
  },
  resultCard: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.base,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.base,
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  resultTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultEyebrow: {
    fontFamily: typography.fonts.sansSemiBold,
    fontSize: 10,
    color: colors.text.secondary,
    letterSpacing: 1,
  },
  simulationTag: {
    backgroundColor: "rgba(139, 207, 50, 0.15)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.xs,
  },
  simulationTagText: {
    fontFamily: typography.fonts.sansBold,
    fontSize: 9,
    color: colors.brand.green,
    letterSpacing: 0.5,
  },
  dosageNumbersRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: colors.surface.base,
    borderRadius: radii.sm,
    padding: spacing.sm,
    marginVertical: 4,
  },
  dosageBlock: {
    alignItems: "center",
    flex: 1,
  },
  dosageDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border.subtle,
  },
  dosageLabel: {
    fontFamily: typography.fonts.sans,
    fontSize: 10,
    color: colors.text.muted,
    marginBottom: 2,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  dosageNumber: {
    fontFamily: typography.fonts.sansBold,
    fontSize: 22,
    color: "#FFFFFF",
  },
  dosageUnit: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: 11,
    color: colors.text.secondary,
  },
  pacingContainer: {
    backgroundColor: colors.surface.base,
    borderRadius: radii.xs,
    padding: spacing.sm,
    gap: 2,
  },
  pacingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pacingTitle: {
    fontFamily: typography.fonts.sansBold,
    fontSize: 11,
    color: "#FFFFFF",
  },
  pacingDesc: {
    fontFamily: typography.fonts.sans,
    fontSize: 10,
    color: colors.text.secondary,
  },
  notesList: {
    gap: 4,
    marginTop: 2,
  },
  noteItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  noteDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.text.muted,
    marginTop: 6,
  },
  noteText: {
    fontFamily: typography.fonts.sans,
    fontSize: 10,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 15,
  },
  recordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.brand.green,
    borderRadius: radii.xs,
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
  recordButtonSuccess: {
    backgroundColor: "#166534",
  },
  recordButtonText: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.xs,
    color: "#050505",
  },
  recordButtonTextSuccess: {
    color: "#FFFFFF",
  },
  footerPolicyCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: colors.surface.card,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.sm,
    marginBottom: spacing["2xl"],
  },
  footerPolicyText: {
    fontFamily: typography.fonts.sans,
    fontSize: 10,
    color: colors.text.muted,
    flex: 1,
    lineHeight: 14,
  },
});
