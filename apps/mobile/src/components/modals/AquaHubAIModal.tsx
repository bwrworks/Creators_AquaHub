import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, typography, spacing, radii } from "@cah/design-tokens";
import { generateMockAIResponse, AquaHubAIResponse } from "@cah/domain";
import { useTanks, Tank } from "../../context/TankContext";
import { DosingCalculatorModal } from "./DosingCalculatorModal";

interface AquaHubAIModalProps {
  visible: boolean;
  tank?: Tank | null;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  structured?: AquaHubAIResponse;
  timestamp: string;
}

export function AquaHubAIModal({ visible, tank: propTank, onClose }: AquaHubAIModalProps) {
  const { tanks } = useTanks();

  const [selectedTankId, setSelectedTankId] = useState<string>(
    propTank?.id || (tanks.length > 0 ? tanks[0].id : "")
  );

  const activeTank = tanks.find((t) => t.id === selectedTankId) || propTank || tanks[0];

  const [inputQuery, setInputQuery] = useState("");
  const [isDosingModalOpen, setIsDosingModalOpen] = useState(false);

  // Initial greeting conversation
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-init-1",
      role: "assistant",
      content: `Welcome to AquaHub AI. I am calibrated to analyze your water parameters, evaluate livestock safety, and provide evidence-grounded aquarium care guidelines under Creators Aquarium standards.`,
      timestamp: "Just now",
      structured: {
        answer: "Ready to assist with your aquatic systems. How can I help your aquarium today?",
        observedFacts: (activeTank?.parameters || []).slice(0, 3).map((p) => ({
          label: p.name,
          value: `${p.value} ${p.unit}`,
          sourceId: p.id,
          observedAt: p.observedAt,
          freshness: p.freshness,
        })),
        possibleCauses: [],
        missingInformation: [],
        recommendedNextSteps: [
          "Check weekly water chemistry for parameter drift.",
          "Maintain steady KH and salinity to protect delicate species.",
        ],
        sources: [
          {
            title: "Creators Aquarium Baseline Water Quality Standards",
            url: "https://www.creatorsaquarium.com/",
            version: "1.0",
          },
        ],
        safetyLevel: "normal",
      },
    },
  ]);

  const QUICK_PROMPTS = [
    { label: "Analyze Water Balance", query: "Can you analyze my current water chemistry balance and highlight any concerns?" },
    { label: "Calculate Dosing", query: "How much buffer or chemical supplement should I dose for my tank?" },
    { label: "Photoperiod & Light", query: "What is the recommended lighting photoperiod and intensity to avoid nuisance algae?" },
    { label: "Livestock Density", query: "Is my current livestock stocking density safe for my aquarium volume?" },
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: query.trim(),
      timestamp: "Just now",
    };

    // Format current tank telemetry for domain AI engine
    const recentReadings = (activeTank?.parameters || []).map((p) => ({
      label: p.name,
      value: `${p.value} ${p.unit}`,
      observedAt: p.observedAt,
      freshness: p.freshness,
      sourceId: p.id,
    }));

    const responseStructured = generateMockAIResponse({
      question: query.trim(),
      waterCategory: activeTank?.category || "marine_reef",
      tankVolumeLitres: activeTank?.volumeLiters || 100,
      recentReadings,
    });

    const aiMsg: ChatMessage = {
      id: `ai-${Date.now() + 1}`,
      role: "assistant",
      content: responseStructured.answer,
      structured: responseStructured,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInputQuery("");
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: `Chat session reset. Connected to ${activeTank?.name || "your living systems"}.`,
        timestamp: "Just now",
      },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Feather name="arrow-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleArea}>
            <View style={styles.badgeRow}>
              <View style={styles.aiBadge}>
                <Feather name="cpu" size={10} color={colors.brand.green} />
                <Text style={styles.aiBadgeText}>AQUAHUB AI</Text>
              </View>
              <Text style={styles.quotaText}>₹0 Free Quota Engine</Text>
            </View>
            <Text style={styles.headerTitle}>Assistant & Telemetry</Text>
          </View>
          <TouchableOpacity onPress={handleClearChat} style={styles.actionBtn}>
            <Feather name="rotate-ccw" size={16} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Active Tank Context Bar */}
        <View style={styles.contextBar}>
          <View style={styles.contextInfoRow}>
            <Feather name="droplet" size={12} color={colors.brand.green} />
            <Text style={styles.contextLabel}>SYSTEM CONTEXT:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.contextTanksRow}>
              {tanks.map((t) => {
                const isSelected = (activeTank?.id || "") === t.id;
                return (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.contextTankChip, isSelected && styles.activeContextTankChip]}
                    onPress={() => setSelectedTankId(t.id)}
                  >
                    <Text style={[styles.contextTankText, isSelected && styles.activeContextTankText]}>
                      {t.name} ({t.volumeLiters}L)
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>

        {/* Chat History */}
        <ScrollView style={styles.chatScroll} contentContainerStyle={styles.chatContent} showsVerticalScrollIndicator={false}>
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <View key={msg.id} style={[styles.messageWrapper, isUser ? styles.userWrapper : styles.aiWrapper]}>
                {!isUser && (
                  <View style={styles.aiAvatar}>
                    <Image
                      source={require("../../../assets/brand/icon-clean.png")}
                      style={styles.aiAvatarImg}
                      resizeMode="contain"
                    />
                  </View>
                )}

                <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
                  <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>{msg.content}</Text>

                  {/* Render Structured Output when present */}
                  {msg.structured && (
                    <View style={styles.structuredContainer}>
                      {/* Observed Facts */}
                      {msg.structured.observedFacts.length > 0 && (
                        <View style={styles.factsSection}>
                          <Text style={styles.structuredSectionLabel}>OBSERVED TELEMETRY</Text>
                          <View style={styles.factsRow}>
                            {msg.structured.observedFacts.map((fact, idx) => (
                              <View key={idx} style={styles.factChip}>
                                <View
                                  style={[
                                    styles.factDot,
                                    {
                                      backgroundColor:
                                        fact.freshness === "fresh"
                                          ? colors.brand.green
                                          : colors.status.warning,
                                    },
                                  ]}
                                />
                                <Text style={styles.factChipText}>
                                  {fact.label}: <Text style={styles.factChipBold}>{fact.value}</Text>
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}

                      {/* Missing Information / Warning */}
                      {msg.structured.missingInformation.length > 0 && (
                        <View style={styles.warningBox}>
                          <Feather name="alert-triangle" size={14} color={colors.status.warning} />
                          <View style={styles.warningContent}>
                            <Text style={styles.warningTitle}>Missing Information Required:</Text>
                            {msg.structured.missingInformation.map((info, idx) => (
                              <Text key={idx} style={styles.warningText}>• {info}</Text>
                            ))}
                          </View>
                        </View>
                      )}

                      {/* Recommended Next Steps */}
                      {msg.structured.recommendedNextSteps.length > 0 && (
                        <View style={styles.stepsSection}>
                          <Text style={styles.structuredSectionLabel}>RECOMMENDED ACTIONS</Text>
                          {msg.structured.recommendedNextSteps.map((step, idx) => (
                            <View key={idx} style={styles.stepRow}>
                              <Text style={styles.stepNumber}>{idx + 1}.</Text>
                              <Text style={styles.stepText}>{step}</Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {/* Dosing Action Button if Dosing Mentioned */}
                      {/dose|dosing|buffer|chemical/i.test(msg.content) && (
                        <TouchableOpacity
                          style={styles.dosingActionBtn}
                          onPress={() => setIsDosingModalOpen(true)}
                          activeOpacity={0.85}
                        >
                          <Feather name="shield" size={14} color="#050505" />
                          <Text style={styles.dosingActionBtnText}>Open Deterministic Dosing Calculator</Text>
                        </TouchableOpacity>
                      )}

                      {/* Citations & Source */}
                      {msg.structured.sources.length > 0 && (
                        <View style={styles.citationRow}>
                          <Feather name="book-open" size={11} color={colors.text.muted} />
                          <Text style={styles.citationText}>
                            Source: {msg.structured.sources[0].title}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  <Text style={styles.timestampText}>{msg.timestamp}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Quick Suggestion Chips */}
        <View style={styles.promptChipsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promptChipsRow}>
            {QUICK_PROMPTS.map((p, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.promptChip}
                onPress={() => handleSend(p.query)}
                activeOpacity={0.75}
              >
                <Text style={styles.promptChipText}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Message Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputQuery}
            onChangeText={setInputQuery}
            placeholder={`Ask AquaHub AI about ${activeTank?.name || "your aquarium"}...`}
            placeholderTextColor={colors.text.muted}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputQuery.trim() && styles.sendButtonDisabled]}
            onPress={() => handleSend()}
            disabled={!inputQuery.trim()}
            activeOpacity={0.8}
          >
            <Feather name="arrow-up" size={18} color="#050505" />
          </TouchableOpacity>
        </View>

        {/* Deterministic Dosing Modal */}
        <DosingCalculatorModal
          visible={isDosingModalOpen}
          tank={activeTank}
          onClose={() => setIsDosingModalOpen(false)}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.base,
    paddingTop: Platform.OS === "ios" ? 48 : 20,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface.elevated,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleArea: {
    alignItems: "center",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(139, 207, 50, 0.12)",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radii.xs,
  },
  aiBadgeText: {
    fontFamily: typography.fonts.sansSemiBold,
    fontSize: 9,
    color: colors.brand.green,
    letterSpacing: 0.8,
  },
  quotaText: {
    fontFamily: typography.fonts.sans,
    fontSize: 9,
    color: colors.text.muted,
  },
  headerTitle: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.base,
    color: "#FFFFFF",
    marginTop: 2,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface.elevated,
    alignItems: "center",
    justifyContent: "center",
  },
  contextBar: {
    backgroundColor: colors.surface.card,
    paddingVertical: 6,
    paddingHorizontal: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  contextInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  contextLabel: {
    fontFamily: typography.fonts.sansSemiBold,
    fontSize: 9,
    color: colors.text.muted,
    letterSpacing: 0.5,
  },
  contextTanksRow: {
    flexDirection: "row",
    gap: 6,
  },
  contextTankChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
    backgroundColor: colors.surface.base,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  activeContextTankChip: {
    borderColor: colors.brand.green,
    backgroundColor: "rgba(139, 207, 50, 0.15)",
  },
  contextTankText: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: 10,
    color: colors.text.secondary,
  },
  activeContextTankText: {
    color: "#FFFFFF",
    fontFamily: typography.fonts.sansBold,
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: spacing.base,
    gap: spacing.base,
    paddingBottom: spacing.lg,
  },
  messageWrapper: {
    flexDirection: "row",
    gap: spacing.xs,
    maxWidth: "92%",
  },
  userWrapper: {
    alignSelf: "flex-end",
    flexDirection: "row-reverse",
  },
  aiWrapper: {
    alignSelf: "flex-start",
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface.elevated,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  aiAvatarImg: {
    width: 18,
    height: 18,
  },
  messageBubble: {
    borderRadius: radii.base,
    padding: spacing.md,
    gap: spacing.xs,
  },
  userBubble: {
    backgroundColor: "#1E271E",
    borderWidth: 1,
    borderColor: "rgba(139, 207, 50, 0.2)",
  },
  aiBubble: {
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  messageText: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.sm,
    lineHeight: 20,
  },
  userText: {
    color: "#FFFFFF",
  },
  aiText: {
    color: colors.text.primary,
  },
  timestampText: {
    fontFamily: typography.fonts.sans,
    fontSize: 9,
    color: colors.text.muted,
    alignSelf: "flex-end",
    marginTop: 2,
  },
  structuredContainer: {
    marginTop: spacing.xs,
    gap: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  structuredSectionLabel: {
    fontFamily: typography.fonts.sansSemiBold,
    fontSize: 9,
    color: colors.text.muted,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  factsSection: {
    gap: 2,
  },
  factsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  factChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surface.base,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.xs,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  factDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  factChipText: {
    fontFamily: typography.fonts.sans,
    fontSize: 10,
    color: colors.text.secondary,
  },
  factChipBold: {
    fontFamily: typography.fonts.sansBold,
    color: "#FFFFFF",
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderRadius: radii.xs,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.25)",
    padding: spacing.xs,
  },
  warningContent: {
    flex: 1,
    gap: 1,
  },
  warningTitle: {
    fontFamily: typography.fonts.sansBold,
    fontSize: 10,
    color: colors.status.warning,
  },
  warningText: {
    fontFamily: typography.fonts.sans,
    fontSize: 10,
    color: colors.text.secondary,
  },
  stepsSection: {
    gap: 3,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 5,
  },
  stepNumber: {
    fontFamily: typography.fonts.sansBold,
    fontSize: 10,
    color: colors.brand.green,
    marginTop: 1,
  },
  stepText: {
    fontFamily: typography.fonts.sans,
    fontSize: 11,
    color: colors.text.primary,
    flex: 1,
    lineHeight: 16,
  },
  dosingActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.brand.green,
    borderRadius: radii.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: 2,
  },
  dosingActionBtnText: {
    fontFamily: typography.fonts.sansBold,
    fontSize: 11,
    color: "#050505",
  },
  citationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingTop: 2,
  },
  citationText: {
    fontFamily: typography.fonts.sans,
    fontSize: 9,
    color: colors.text.muted,
  },
  promptChipsContainer: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  promptChipsRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  promptChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.full,
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  promptChipText: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: 11,
    color: colors.text.secondary,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface.card,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.surface.base,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    paddingHorizontal: spacing.base,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.sm,
    color: "#FFFFFF",
    maxHeight: 80,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.brand.green,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.35,
  },
});
