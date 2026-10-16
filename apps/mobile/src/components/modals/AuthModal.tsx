import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, typography, spacing, radii } from "@cah/design-tokens";
import { useTanks } from "../../context/TankContext";

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AuthModal({ visible, onClose }: AuthModalProps) {
  const { user, loginUser, logoutUser, resetToDemo } = useTanks();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);

  const handleCustomLogin = () => {
    if (!email.trim() || !email.includes("@")) {
      if (Platform.OS === "web") {
        window.alert("Please enter a valid email address.");
      } else {
        Alert.alert("Invalid Email", "Please enter a valid email address.");
      }
      return;
    }

    loginUser(email.trim(), name.trim() || undefined);
    onClose();
  };

  const handleSelectDemo = () => {
    resetToDemo();
    onClose();
  };

  const handleSelectGuest = () => {
    logoutUser();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Image
              source={require("../../../assets/brand/icon-clean.png")}
              style={styles.logoIcon}
              resizeMode="contain"
            />
            <View style={styles.headerTextContainer}>
              <Text style={styles.eyebrow}>AUTHENTICATION & SYNC</Text>
              <Text style={styles.title}>Creators AquaHub Account</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={18} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Current Status Banner */}
          <View style={styles.statusCard}>
            <View style={styles.statusTopRow}>
              <Text style={styles.statusLabel}>CURRENT ACTIVE SESSION:</Text>
              <View style={styles.sessionDotRow}>
                <View style={[styles.sessionDot, { backgroundColor: user.isLoggedIn ? colors.brand.green : colors.status.warning }]} />
                <Text style={styles.sessionStatusText}>{user.isLoggedIn ? "AUTHENTICATED" : "GUEST"}</Text>
              </View>
            </View>
            <Text style={styles.currentUserName}>{user.name}</Text>
            <Text style={styles.currentUserHandle}>{user.handle || "Local device storage only"}</Text>
          </View>

          {!isCustomMode ? (
            <View style={styles.actionsContainer}>
              {/* Option 1: Demo Aquarist */}
              <TouchableOpacity style={styles.authOptionCard} onPress={handleSelectDemo} activeOpacity={0.8}>
                <View style={styles.optionIconContainer}>
                  <Feather name="shield" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.optionDetails}>
                  <Text style={styles.optionTitle}>Demo Aquarist (Kiran R.)</Text>
                  <Text style={styles.optionSub}>Verified local test persona with 3 living aquascapes</Text>
                </View>
                <Feather name="arrow-right" size={16} color={colors.text.muted} />
              </TouchableOpacity>

              {/* Option 2: Sign In with Custom Email */}
              <TouchableOpacity
                style={styles.authOptionCard}
                onPress={() => setIsCustomMode(true)}
                activeOpacity={0.8}
              >
                <View style={styles.optionIconContainer}>
                  <Feather name="mail" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.optionDetails}>
                  <Text style={styles.optionTitle}>Sign In with Your Email</Text>
                  <Text style={styles.optionSub}>Sync tanks and dosing logs to your personal profile</Text>
                </View>
                <Feather name="arrow-right" size={16} color={colors.text.muted} />
              </TouchableOpacity>

              {/* Option 3: Guest Mode */}
              <TouchableOpacity style={styles.guestButton} onPress={handleSelectGuest} activeOpacity={0.8}>
                <Feather name="user-x" size={16} color={colors.text.secondary} />
                <Text style={styles.guestButtonText}>Continue in Guest Mode</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Your Name:</Text>
                <TextInput
                  style={styles.textInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Vikram Sharma"
                  placeholderTextColor={colors.text.muted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address:</Text>
                <TextInput
                  style={styles.textInput}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="name@example.com"
                  placeholderTextColor={colors.text.muted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleCustomLogin}>
                <Text style={styles.submitButtonText}>Connect & Sync Tanks</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.backLink} onPress={() => setIsCustomMode(false)}>
                <Text style={styles.backLinkText}>← Back to Options</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Privacy & Quota Note */}
          <View style={styles.footerNote}>
            <Feather name="lock" size={12} color={colors.text.muted} />
            <Text style={styles.footerNoteText}>
              Zero-Cloud Lock: Stored locally under strict ₹0 pre-launch architecture.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.base,
  },
  container: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: colors.surface.base,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.base,
    gap: spacing.base,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  logoIcon: {
    width: 36,
    height: 36,
  },
  headerTextContainer: {
    flex: 1,
  },
  eyebrow: {
    fontFamily: typography.fonts.sansSemiBold,
    fontSize: 9,
    color: colors.text.secondary,
    letterSpacing: 1,
  },
  title: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.base,
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
  statusCard: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.md,
    gap: 4,
  },
  statusTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusLabel: {
    fontFamily: typography.fonts.sansSemiBold,
    fontSize: 9,
    color: colors.text.muted,
    letterSpacing: 0.5,
  },
  sessionDotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  sessionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sessionStatusText: {
    fontFamily: typography.fonts.sansBold,
    fontSize: 9,
    color: colors.text.secondary,
  },
  currentUserName: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.base,
    color: "#FFFFFF",
  },
  currentUserHandle: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  actionsContainer: {
    gap: spacing.sm,
  },
  authOptionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface.card,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.md,
  },
  optionIconContainer: {
    width: 38,
    height: 38,
    borderRadius: radii.xs,
    backgroundColor: colors.surface.elevated,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: "center",
    justifyContent: "center",
  },
  optionDetails: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.sm,
    color: "#FFFFFF",
  },
  optionSub: {
    fontFamily: typography.fonts.sans,
    fontSize: 11,
    color: colors.text.secondary,
  },
  guestButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: spacing.md,
    borderRadius: radii.xs,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    backgroundColor: colors.surface.base,
  },
  guestButtonText: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  formContainer: {
    gap: spacing.md,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  inputLabel: {
    fontFamily: typography.fonts.sansSemiBold,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
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
  submitButton: {
    backgroundColor: colors.brand.green,
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xs,
  },
  submitButtonText: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.sm,
    color: "#050505",
  },
  backLink: {
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  backLinkText: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  footerNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  footerNoteText: {
    fontFamily: typography.fonts.sans,
    fontSize: 10,
    color: colors.text.muted,
    flex: 1,
  },
});
