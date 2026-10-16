import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Platform,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, typography, spacing, radii } from "@cah/design-tokens";
import { useTanks, Tank, ParameterEntry } from "../../context/TankContext";
import { getTankImage } from "../../utils/tankAssets";
import { DosingCalculatorModal } from "./DosingCalculatorModal";
import { AquaHubAIModal } from "./AquaHubAIModal";

interface TankDetailModalProps {
  visible: boolean;
  tank: Tank | null;
  onClose: () => void;
}

type TankTab = "parameters" | "livestock" | "equipment";

export function TankDetailModal({ visible, tank, onClose }: TankDetailModalProps) {
  const { logParameter, addLivestock, addEquipment, deleteTank } = useTanks();

  const [activeTab, setActiveTab] = useState<TankTab>("parameters");
  const [isDosingOpen, setIsDosingOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);

  // Parameter Logging Form State
  const [showLogSheet, setShowLogSheet] = useState(false);
  const [selectedParamSlug, setSelectedParamSlug] = useState("alk");
  const [paramValue, setParamValue] = useState("");
  const [paramTestKit, setParamTestKit] = useState("Hanna Checker");

  // Livestock Form State
  const [showAddLivestock, setShowAddLivestock] = useState(false);
  const [livestockName, setLivestockName] = useState("");
  const [livestockSpecies, setLivestockSpecies] = useState("");
  const [livestockCategory, setLivestockCategory] = useState<"fish" | "coral" | "plant" | "invertebrate">("fish");
  const [livestockQty, setLivestockQty] = useState("1");

  // Equipment Form State
  const [showAddEquipment, setShowAddEquipment] = useState(false);
  const [equipmentName, setEquipmentName] = useState("");
  const [equipmentBrand, setEquipmentBrand] = useState("");
  const [equipmentCategory, setEquipmentCategory] = useState<"lighting" | "flow" | "filtration" | "dosing" | "heating">("lighting");

  if (!tank) return null;

  const PARAMETER_PRESETS: Record<
    string,
    { name: string; unit: string; idealRange: string; defaultKit: string }
  > = {
    alk: { name: "Alkalinity", unit: "dKH", idealRange: "8.0 - 8.6 dKH", defaultKit: "Hanna Checker" },
    salinity: { name: "Salinity", unit: "sg", idealRange: "1.025 - 1.026", defaultKit: "Milwaukee Digital" },
    ca: { name: "Calcium (Ca)", unit: "ppm", idealRange: "420 - 450 ppm", defaultKit: "Salifert Ca" },
    mg: { name: "Magnesium (Mg)", unit: "ppm", idealRange: "1350 - 1420 ppm", defaultKit: "Red Sea Pro" },
    no3: { name: "Nitrate (NO3)", unit: "ppm", idealRange: "3 - 10 ppm", defaultKit: "Nyos Nitrate" },
    po4: { name: "Phosphate (PO4)", unit: "ppm", idealRange: "0.02 - 0.05 ppm", defaultKit: "Hanna Ultra Low" },
    ph: { name: "pH Level", unit: "pH", idealRange: "8.0 - 8.4", defaultKit: "Digital Probe" },
    temp: { name: "Temperature", unit: "°C", idealRange: "24.5 - 26.0 °C", defaultKit: "Inkbird Digital" },
    kh: { name: "Carbonate (KH)", unit: "dKH", idealRange: "3.0 - 5.0 dKH", defaultKit: "Salifert KH" },
    tds: { name: "TDS", unit: "ppm", idealRange: "20 - 60 ppm", defaultKit: "HM Digital" },
  };

  const handleOpenParamLogger = (slug?: string) => {
    if (slug && PARAMETER_PRESETS[slug]) {
      setSelectedParamSlug(slug);
      setParamTestKit(PARAMETER_PRESETS[slug].defaultKit);
    }
    setParamValue("");
    setShowLogSheet(true);
  };

  const handleSaveParameter = () => {
    const num = parseFloat(paramValue);
    if (isNaN(num)) {
      if (Platform.OS === "web") {
        window.alert("Please enter a valid numeric reading.");
      } else {
        Alert.alert("Invalid Input", "Please enter a valid numeric reading.");
      }
      return;
    }

    const preset = PARAMETER_PRESETS[selectedParamSlug] || {
      name: selectedParamSlug.toUpperCase(),
      unit: "",
      idealRange: "Standard",
      defaultKit: "Manual Test",
    };

    logParameter(tank.id, {
      slug: selectedParamSlug,
      name: preset.name,
      value: num,
      unit: preset.unit,
      idealRange: preset.idealRange,
      testKit: paramTestKit.trim() || preset.defaultKit,
    });

    setShowLogSheet(false);
    setParamValue("");
  };

  const handleSaveLivestock = () => {
    if (!livestockName.trim()) {
      if (Platform.OS === "web") {
        window.alert("Please enter a species or specimen name.");
      } else {
        Alert.alert("Name Required", "Please enter a species or specimen name.");
      }
      return;
    }

    addLivestock(tank.id, {
      name: livestockName.trim(),
      species: livestockSpecies.trim() || undefined,
      category: livestockCategory,
      quantity: parseInt(livestockQty, 10) || 1,
      status: "healthy",
      acquiredDate: new Date().toISOString().split("T")[0],
    });

    setLivestockName("");
    setLivestockSpecies("");
    setShowAddLivestock(false);
  };

  const handleSaveEquipment = () => {
    if (!equipmentName.trim()) {
      if (Platform.OS === "web") {
        window.alert("Please enter equipment name.");
      } else {
        Alert.alert("Name Required", "Please enter equipment name.");
      }
      return;
    }

    addEquipment(tank.id, {
      name: equipmentName.trim(),
      brand: equipmentBrand.trim() || undefined,
      category: equipmentCategory,
      status: "active",
    });

    setEquipmentName("");
    setEquipmentBrand("");
    setShowAddEquipment(false);
  };

  const handleDelete = () => {
    const confirmDelete = () => {
      deleteTank(tank.id);
      onClose();
    };

    if (Platform.OS === "web") {
      if (window.confirm(`Are you sure you want to remove "${tank.name}"?`)) {
        confirmDelete();
      }
    } else {
      Alert.alert(
        "Remove Aquarium",
        `Are you sure you want to remove "${tank.name}"? This cannot be undone.`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: confirmDelete },
        ]
      );
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Full-bleed Hero Header */}
        <View style={styles.heroContainer}>
          <Image source={getTankImage(tank)} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.heroScrim} />

          {/* Navigation Overlay */}
          <View style={styles.heroNav}>
            <TouchableOpacity onPress={onClose} style={styles.navIconButton} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Feather name="arrow-left" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.navIconButton} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Feather name="trash-2" size={20} color="#FF5C5C" />
            </TouchableOpacity>
          </View>

          {/* Hero Details */}
          <View style={styles.heroContent}>
            <View style={styles.badgeRow}>
              <View style={styles.categoryPill}>
                <Text style={styles.categoryPillText}>{tank.categoryLabel.toUpperCase()}</Text>
              </View>
              <View style={styles.statusDotRow}>
                <View style={styles.greenLiveDot} />
                <Text style={styles.liveTelemetryText}>System Online</Text>
              </View>
            </View>

            <Text style={styles.tankTitle}>{tank.name}</Text>

            <View style={styles.metricsPillsRow}>
              <View style={styles.metricPill}>
                <Feather name="droplet" size={12} color={colors.text.secondary} />
                <Text style={styles.metricPillText}>
                  {tank.volumeLiters} L • {tank.volumeGallons} gal
                </Text>
              </View>
              <View style={styles.metricPill}>
                <Feather name="maximize-2" size={12} color={colors.text.secondary} />
                <Text style={styles.metricPillText}>
                  {tank.dimensions.length}×{tank.dimensions.width}×{tank.dimensions.height} cm
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabBar}>
          {(
            [
              { id: "parameters", label: "Chemistry", icon: "activity", count: tank.parameters.length },
              { id: "livestock", label: "Livestock", icon: "feather", count: tank.livestock.length },
              { id: "equipment", label: "Equipment", icon: "cpu", count: tank.equipment.length },
            ] as const
          ).map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.tabButton, activeTab === t.id && styles.activeTabButton]}
              onPress={() => setActiveTab(t.id)}
            >
              <Feather
                name={t.icon as any}
                size={14}
                color={activeTab === t.id ? "#FFFFFF" : colors.text.muted}
              />
              <Text style={[styles.tabText, activeTab === t.id && styles.activeTabText]}>
                {t.label} ({t.count})
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* TAB 1: PARAMETERS */}
          {activeTab === "parameters" && (
            <View style={styles.sectionContainer}>
              {/* Quick Log Action Bar */}
              <View style={styles.quickActionCard}>
                <View style={styles.quickActionHeaderLeft}>
                  <Text style={styles.quickActionEyebrow}>WATER CHEMISTRY</Text>
                  <Text style={styles.quickActionTitle}>Telemetry & Actions</Text>
                </View>
                <View style={styles.quickActionButtonsRow}>
                  <TouchableOpacity
                    style={styles.aiQuickBtn}
                    onPress={() => setIsAIOpen(true)}
                    activeOpacity={0.85}
                  >
                    <Feather name="cpu" size={13} color="#FFFFFF" />
                    <Text style={styles.aiQuickBtnText}>AI</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dosingQuickBtn}
                    onPress={() => setIsDosingOpen(true)}
                    activeOpacity={0.85}
                  >
                    <Feather name="shield" size={13} color="#FFFFFF" />
                    <Text style={styles.dosingQuickBtnText}>Dosing</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.primaryActionButton}
                    onPress={() => handleOpenParamLogger()}
                    activeOpacity={0.85}
                  >
                    <Feather name="plus" size={13} color="#050505" />
                    <Text style={styles.primaryActionText}>Log</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Parameter Cards Grid */}
              <View style={styles.paramGrid}>
                {tank.parameters.map((param) => {
                  const freshnessColor =
                    param.freshness === "fresh"
                      ? colors.brand.green
                      : param.freshness === "aging"
                      ? colors.status.warning
                      : colors.status.danger;

                  return (
                    <TouchableOpacity
                      key={param.id}
                      style={styles.paramCard}
                      onPress={() => handleOpenParamLogger(param.slug)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.paramCardHeader}>
                        <Text style={styles.paramCardName}>{param.name}</Text>
                        <View style={[styles.freshnessIndicatorDot, { backgroundColor: freshnessColor }]} />
                      </View>

                      {/* Crisp Big White Reading */}
                      <View style={styles.valueRow}>
                        <Text style={styles.paramValueNumber}>{param.value}</Text>
                        <Text style={styles.paramValueUnit}> {param.unit}</Text>
                      </View>

                      <View style={styles.paramCardFooter}>
                        <Text style={styles.targetRangeText}>Target: {param.idealRange}</Text>
                        <View style={styles.timestampRow}>
                          <Feather name="clock" size={10} color={colors.text.muted} />
                          <Text style={styles.timestampText}>{param.observedAt}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Tank Bio Description */}
              <View style={styles.bioCard}>
                <Text style={styles.bioCardLabel}>SYSTEM PROFILE & NOTES</Text>
                <Text style={styles.bioCardText}>{tank.description}</Text>
              </View>
            </View>
          )}

          {/* TAB 2: LIVESTOCK */}
          {activeTab === "livestock" && (
            <View style={styles.sectionContainer}>
              <View style={styles.quickActionCard}>
                <View>
                  <Text style={styles.quickActionEyebrow}>CORALS, FISH & FLORA</Text>
                  <Text style={styles.quickActionTitle}>Living Census</Text>
                </View>
                <TouchableOpacity
                  style={styles.primaryActionButton}
                  onPress={() => setShowAddLivestock(true)}
                  activeOpacity={0.85}
                >
                  <Feather name="plus" size={16} color="#050505" />
                  <Text style={styles.primaryActionText}>Add Specimen</Text>
                </TouchableOpacity>
              </View>

              {tank.livestock.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Feather name="feather" size={32} color={colors.text.muted} />
                  <Text style={styles.emptyTitle}>No Livestock Logged Yet</Text>
                  <Text style={styles.emptySub}>
                    Record your fish, corals, invertebrates, and planted botanicals to track stocking density.
                  </Text>
                </View>
              ) : (
                <View style={styles.listContainer}>
                  {tank.livestock.map((item) => (
                    <View key={item.id} style={styles.listItemCard}>
                      <View style={styles.listItemIconBadge}>
                        <Feather
                          name={
                            item.category === "coral"
                              ? "sun"
                              : item.category === "plant"
                              ? "shield"
                              : "activity"
                          }
                          size={18}
                          color="#FFFFFF"
                        />
                      </View>
                      <View style={styles.listItemMeta}>
                        <View style={styles.listItemTopRow}>
                          <Text style={styles.listItemTitle}>{item.name}</Text>
                          <View style={styles.quantityPill}>
                            <Text style={styles.quantityText}>×{item.quantity}</Text>
                          </View>
                        </View>
                        {item.species && <Text style={styles.listItemSpecies}>{item.species}</Text>}
                        <View style={styles.statusChipRow}>
                          <View style={styles.greenLiveDot} />
                          <Text style={styles.statusChipText}>{item.status.toUpperCase()}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* TAB 3: EQUIPMENT */}
          {activeTab === "equipment" && (
            <View style={styles.sectionContainer}>
              <View style={styles.quickActionCard}>
                <View>
                  <Text style={styles.quickActionEyebrow}>HARDWARE & AUTOMATION</Text>
                  <Text style={styles.quickActionTitle}>Equipment Rack</Text>
                </View>
                <TouchableOpacity
                  style={styles.primaryActionButton}
                  onPress={() => setShowAddEquipment(true)}
                  activeOpacity={0.85}
                >
                  <Feather name="plus" size={16} color="#050505" />
                  <Text style={styles.primaryActionText}>Add Hardware</Text>
                </TouchableOpacity>
              </View>

              {tank.equipment.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Feather name="cpu" size={32} color={colors.text.muted} />
                  <Text style={styles.emptyTitle}>No Equipment Registered</Text>
                  <Text style={styles.emptySub}>
                    Add your LED lighting, wavemakers, filters, dosing pumps, and heaters.
                  </Text>
                </View>
              ) : (
                <View style={styles.listContainer}>
                  {tank.equipment.map((eq) => (
                    <View key={eq.id} style={styles.listItemCard}>
                      <View style={styles.listItemIconBadge}>
                        <Feather name="cpu" size={18} color="#FFFFFF" />
                      </View>
                      <View style={styles.listItemMeta}>
                        <View style={styles.listItemTopRow}>
                          <Text style={styles.listItemTitle}>{eq.name}</Text>
                          <Text style={styles.categoryTag}>{eq.category.toUpperCase()}</Text>
                        </View>
                        {eq.brand && <Text style={styles.listItemSpecies}>Brand: {eq.brand}</Text>}
                        <View style={styles.statusChipRow}>
                          <View style={styles.greenLiveDot} />
                          <Text style={styles.statusChipText}>OPERATIONAL</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* MODAL: QUICK PARAMETER LOGGER */}
        <Modal visible={showLogSheet} animationType="fade" transparent onRequestClose={() => setShowLogSheet(false)}>
          <View style={styles.sheetOverlay}>
            <View style={styles.sheetContainer}>
              <View style={styles.sheetHeader}>
                <View>
                  <Text style={styles.sheetEyebrow}>REEFBAY CHEMISTRY ENTRY</Text>
                  <Text style={styles.sheetTitle}>Log Water Test</Text>
                </View>
                <TouchableOpacity onPress={() => setShowLogSheet(false)} style={styles.sheetCloseBtn}>
                  <Feather name="x" size={20} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.sheetBody}>
                {/* Parameter Selection Chips */}
                <Text style={styles.inputLabel}>Select Parameter:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.paramChipsRow}>
                  {Object.keys(PARAMETER_PRESETS).map((key) => {
                    const preset = PARAMETER_PRESETS[key];
                    const isSelected = selectedParamSlug === key;
                    return (
                      <TouchableOpacity
                        key={key}
                        style={[styles.paramChip, isSelected && styles.activeParamChip]}
                        onPress={() => {
                          setSelectedParamSlug(key);
                          setParamTestKit(preset.defaultKit);
                        }}
                      >
                        <Text style={[styles.paramChipText, isSelected && styles.activeParamChipText]}>
                          {preset.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Value Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Test Value ({PARAMETER_PRESETS[selectedParamSlug]?.unit || ""}):
                  </Text>
                  <TextInput
                    style={styles.numericInput}
                    value={paramValue}
                    onChangeText={setParamValue}
                    placeholder="e.g. 8.3"
                    placeholderTextColor={colors.text.muted}
                    keyboardType="numeric"
                    autoFocus
                  />
                  <Text style={styles.helperText}>
                    Ideal Range: {PARAMETER_PRESETS[selectedParamSlug]?.idealRange}
                  </Text>
                </View>

                {/* Test Kit */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Test Kit or Method:</Text>
                  <TextInput
                    style={styles.textInput}
                    value={paramTestKit}
                    onChangeText={setParamTestKit}
                    placeholder="e.g. Hanna Checker, Salifert"
                    placeholderTextColor={colors.text.muted}
                  />
                </View>

                {/* Save Button */}
                <TouchableOpacity style={styles.saveSheetButton} onPress={handleSaveParameter}>
                  <Text style={styles.saveSheetButtonText}>Save Water Reading</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* MODAL: ADD LIVESTOCK */}
        <Modal visible={showAddLivestock} animationType="fade" transparent onRequestClose={() => setShowAddLivestock(false)}>
          <View style={styles.sheetOverlay}>
            <View style={styles.sheetContainer}>
              <View style={styles.sheetHeader}>
                <View>
                  <Text style={styles.sheetEyebrow}>LIVING CENSUS</Text>
                  <Text style={styles.sheetTitle}>Add Inhabitant</Text>
                </View>
                <TouchableOpacity onPress={() => setShowAddLivestock(false)} style={styles.sheetCloseBtn}>
                  <Feather name="x" size={20} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.sheetBody}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Name / Common Name:</Text>
                  <TextInput
                    style={styles.textInput}
                    value={livestockName}
                    onChangeText={setLivestockName}
                    placeholder="e.g. Gold Torch Coral, Ember Tetra"
                    placeholderTextColor={colors.text.muted}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Scientific Species (Optional):</Text>
                  <TextInput
                    style={styles.textInput}
                    value={livestockSpecies}
                    onChangeText={setLivestockSpecies}
                    placeholder="e.g. Euphyllia glabrescens"
                    placeholderTextColor={colors.text.muted}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Category:</Text>
                  <View style={styles.categoryToggleRow}>
                    {(["fish", "coral", "plant", "invertebrate"] as const).map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[styles.toggleBtn, livestockCategory === cat && styles.activeToggleBtn]}
                        onPress={() => setLivestockCategory(cat)}
                      >
                        <Text style={[styles.toggleBtnText, livestockCategory === cat && styles.activeToggleBtnText]}>
                          {cat.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Quantity:</Text>
                  <TextInput
                    style={styles.textInput}
                    value={livestockQty}
                    onChangeText={setLivestockQty}
                    placeholder="1"
                    placeholderTextColor={colors.text.muted}
                    keyboardType="numeric"
                  />
                </View>

                <TouchableOpacity style={styles.saveSheetButton} onPress={handleSaveLivestock}>
                  <Text style={styles.saveSheetButtonText}>Add to Aquarium</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* MODAL: ADD EQUIPMENT */}
        <Modal visible={showAddEquipment} animationType="fade" transparent onRequestClose={() => setShowAddEquipment(false)}>
          <View style={styles.sheetOverlay}>
            <View style={styles.sheetContainer}>
              <View style={styles.sheetHeader}>
                <View>
                  <Text style={styles.sheetEyebrow}>SYSTEM HARDWARE</Text>
                  <Text style={styles.sheetTitle}>Register Device</Text>
                </View>
                <TouchableOpacity onPress={() => setShowAddEquipment(false)} style={styles.sheetCloseBtn}>
                  <Feather name="x" size={20} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.sheetBody}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Hardware / Model Name:</Text>
                  <TextInput
                    style={styles.textInput}
                    value={equipmentName}
                    onChangeText={setEquipmentName}
                    placeholder="e.g. Radion XR15 G6, Canister Filter"
                    placeholderTextColor={colors.text.muted}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Brand Manufacturer:</Text>
                  <TextInput
                    style={styles.textInput}
                    value={equipmentBrand}
                    onChangeText={setEquipmentBrand}
                    placeholder="e.g. EcoTech Marine, Oase, Fluval"
                    placeholderTextColor={colors.text.muted}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Category:</Text>
                  <View style={styles.categoryToggleRow}>
                    {(["lighting", "flow", "filtration", "dosing", "heating"] as const).map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[styles.toggleBtn, equipmentCategory === cat && styles.activeToggleBtn]}
                        onPress={() => setEquipmentCategory(cat)}
                      >
                        <Text style={[styles.toggleBtnText, equipmentCategory === cat && styles.activeToggleBtnText]}>
                          {cat.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity style={styles.saveSheetButton} onPress={handleSaveEquipment}>
                  <Text style={styles.saveSheetButtonText}>Save Equipment</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Modals for Dosing & AI Assistance */}
        <DosingCalculatorModal
          visible={isDosingOpen}
          tank={tank}
          onClose={() => setIsDosingOpen(false)}
        />
        <AquaHubAIModal
          visible={isAIOpen}
          tank={tank}
          onClose={() => setIsAIOpen(false)}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.base,
  },
  heroContainer: {
    height: 270,
    width: "100%",
    position: "relative",
    justifyContent: "flex-end",
  },
  heroImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  heroScrim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(5, 5, 5, 0.65)",
  },
  heroNav: {
    position: "absolute",
    top: Platform.OS === "ios" ? 48 : 20,
    left: spacing.base,
    right: spacing.base,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  navIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(16, 19, 16, 0.75)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroContent: {
    padding: spacing.base,
    gap: spacing.xs,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  categoryPill: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  categoryPillText: {
    fontFamily: typography.fonts.sansSemiBold,
    fontSize: 10,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  statusDotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  greenLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brand.green,
  },
  liveTelemetryText: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: 11,
    color: colors.text.secondary,
  },
  tankTitle: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes["2xl"],
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  metricsPillsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: 2,
  },
  metricPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(16, 19, 16, 0.75)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.xs,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  metricPillText: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: 11,
    color: "#FFFFFF",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: colors.surface.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
    paddingHorizontal: spacing.base,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: spacing.md,
    marginRight: spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTabButton: {
    borderBottomColor: colors.brand.green,
  },
  tabText: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
  },
  activeTabText: {
    fontFamily: typography.fonts.sansBold,
    color: "#FFFFFF",
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: spacing["2xl"],
  },
  sectionContainer: {
    gap: spacing.base,
  },
  quickActionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface.card,
    borderRadius: radii.base,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.base,
  },
  quickActionEyebrow: {
    fontFamily: typography.fonts.sansSemiBold,
    fontSize: 10,
    color: colors.text.secondary,
    letterSpacing: 1,
  },
  quickActionTitle: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.base,
    color: "#FFFFFF",
    marginTop: 2,
  },
  quickActionHeaderLeft: {
    flex: 1,
  },
  quickActionButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  aiQuickBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surface.elevated,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radii.xs,
  },
  aiQuickBtnText: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.xs,
    color: "#FFFFFF",
  },
  dosingQuickBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surface.elevated,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radii.xs,
  },
  dosingQuickBtnText: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.xs,
    color: "#FFFFFF",
  },
  primaryActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.brand.green,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.xs,
  },
  primaryActionText: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.xs,
    color: "#050505",
  },
  paramGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  paramCard: {
    width: "48%",
    backgroundColor: colors.surface.card,
    borderRadius: radii.base,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.md,
    gap: spacing.xs,
  },
  paramCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paramCardName: {
    fontFamily: typography.fonts.sansSemiBold,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    letterSpacing: 0.3,
  },
  freshnessIndicatorDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginVertical: 4,
  },
  paramValueNumber: {
    fontFamily: typography.fonts.sansBold,
    fontSize: 24,
    color: "#FFFFFF",
  },
  paramValueUnit: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  paramCardFooter: {
    gap: 2,
  },
  targetRangeText: {
    fontFamily: typography.fonts.sans,
    fontSize: 10,
    color: colors.text.secondary,
  },
  timestampRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  timestampText: {
    fontFamily: typography.fonts.sans,
    fontSize: 9,
    color: colors.text.muted,
  },
  bioCard: {
    backgroundColor: colors.surface.base,
    borderRadius: radii.base,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.base,
    gap: spacing.xs,
  },
  bioCardLabel: {
    fontFamily: typography.fonts.sansSemiBold,
    fontSize: 10,
    color: colors.text.secondary,
    letterSpacing: 1,
  },
  bioCardText: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    lineHeight: typography.lineHeights.sm,
  },
  listContainer: {
    gap: spacing.xs,
  },
  listItemCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface.card,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.md,
  },
  listItemIconBadge: {
    width: 40,
    height: 40,
    borderRadius: radii.xs,
    backgroundColor: colors.surface.elevated,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: "center",
    justifyContent: "center",
  },
  listItemMeta: {
    flex: 1,
    gap: 2,
  },
  listItemTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listItemTitle: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.sm,
    color: "#FFFFFF",
  },
  listItemSpecies: {
    fontFamily: typography.fonts.sans,
    fontSize: 11,
    color: colors.text.secondary,
    fontStyle: "italic",
  },
  quantityPill: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.xs,
  },
  quantityText: {
    fontFamily: typography.fonts.sansBold,
    fontSize: 11,
    color: "#FFFFFF",
  },
  categoryTag: {
    fontFamily: typography.fonts.sansSemiBold,
    fontSize: 9,
    color: colors.text.muted,
    letterSpacing: 0.5,
  },
  statusChipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  statusChipText: {
    fontFamily: typography.fonts.sansBold,
    fontSize: 9,
    color: colors.text.secondary,
    letterSpacing: 0.5,
  },
  emptyCard: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface.card,
    borderRadius: radii.base,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing["2xl"],
    gap: spacing.sm,
  },
  emptyTitle: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.base,
    color: "#FFFFFF",
  },
  emptySub: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: typography.lineHeights.xs,
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: colors.surface.base,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    maxHeight: "85%",
    padding: spacing.base,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  sheetEyebrow: {
    fontFamily: typography.fonts.sansSemiBold,
    fontSize: 10,
    color: colors.text.secondary,
    letterSpacing: 1,
  },
  sheetTitle: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.lg,
    color: "#FFFFFF",
    marginTop: 2,
  },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface.elevated,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetBody: {
    marginTop: spacing.base,
  },
  paramChipsRow: {
    flexDirection: "row",
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    marginBottom: spacing.base,
  },
  paramChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  activeParamChip: {
    borderColor: colors.brand.green,
    backgroundColor: "rgba(139, 207, 50, 0.15)",
  },
  paramChipText: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  activeParamChipText: {
    fontFamily: typography.fonts.sansBold,
    color: "#FFFFFF",
  },
  inputGroup: {
    gap: spacing.xs,
    marginBottom: spacing.base,
  },
  inputLabel: {
    fontFamily: typography.fonts.sansSemiBold,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  numericInput: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    fontFamily: typography.fonts.sansBold,
    fontSize: 28,
    color: "#FFFFFF",
  },
  textInput: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    fontFamily: typography.fonts.sansMedium,
    fontSize: typography.sizes.sm,
    color: "#FFFFFF",
  },
  helperText: {
    fontFamily: typography.fonts.sans,
    fontSize: 11,
    color: colors.text.muted,
  },
  categoryToggleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  toggleBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.xs,
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  activeToggleBtn: {
    borderColor: colors.brand.green,
    backgroundColor: "rgba(139, 207, 50, 0.15)",
  },
  toggleBtnText: {
    fontFamily: typography.fonts.sansSemiBold,
    fontSize: 10,
    color: colors.text.secondary,
  },
  activeToggleBtnText: {
    fontFamily: typography.fonts.sansBold,
    color: "#FFFFFF",
  },
  saveSheetButton: {
    backgroundColor: colors.brand.green,
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.base,
    marginBottom: spacing["2xl"],
  },
  saveSheetButtonText: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.sm,
    color: "#050505",
    letterSpacing: 0.5,
  },
});
