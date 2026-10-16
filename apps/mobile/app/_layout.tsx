import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, StyleSheet, Platform, useWindowDimensions } from "react-native";
import {
  useFonts,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_400Regular,
} from "@expo-google-fonts/playfair-display";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { colors } from "@cah/design-tokens";
import { TankProvider } from "../src/context/TankContext";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_400Regular,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  const { width } = useWindowDimensions();
  const isWebDesktop = Platform.OS === "web" && width > 520;

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brand.green} />
      </View>
    );
  }

  const appContent = (
    <TankProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg.base },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </TankProvider>
  );

  // If viewing on desktop browser, frame inside an authentic smartphone shell
  if (isWebDesktop) {
    return (
      <View style={styles.webDesktopBackground}>
        {/* Subtle decorative glow */}
        <View style={styles.webAmbientGlow} />

        {/* Smartphone Chassis */}
        <View style={styles.phoneFrame}>
          {/* Dynamic Island / Speaker Pill */}
          <View style={styles.phoneDynamicIsland}>
            <View style={styles.phoneCameraDot} />
            <View style={styles.phoneSensorDot} />
          </View>

          {/* App Viewport */}
          <View style={styles.phoneInnerViewport}>{appContent}</View>

          {/* Simulated Home Indicator Bar */}
          <View style={styles.phoneHomeBar} />
        </View>
      </View>
    );
  }

  // Native iOS/Android or mobile browser full bleed
  return <View style={styles.rootContainer}>{appContent}</View>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.bg.base,
    alignItems: "center",
    justifyContent: "center",
  },
  rootContainer: {
    flex: 1,
    backgroundColor: colors.bg.base,
  },
  webDesktopBackground: {
    flex: 1,
    backgroundColor: "#050705",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    overflow: "hidden",
  },
  webAmbientGlow: {
    position: "absolute",
    width: 600,
    height: 600,
    borderRadius: 300,
    backgroundColor: "rgba(139, 207, 50, 0.04)",
    top: "20%",
    alignSelf: "center",
    // @ts-ignore
    filter: "blur(80px)",
  },
  phoneFrame: {
    width: 430,
    height: "96%",
    maxHeight: 900,
    backgroundColor: colors.bg.base,
    borderRadius: 44,
    borderWidth: 8,
    borderColor: "#182018",
    overflow: "hidden",
    position: "relative",
    // @ts-ignore
    boxShadow: "0 28px 75px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.08)",
  },
  phoneDynamicIsland: {
    position: "absolute",
    top: 10,
    alignSelf: "center",
    width: 106,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#000000",
    zIndex: 9999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  phoneCameraDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#0D180D",
    borderWidth: 1,
    borderColor: "#1E2B1E",
  },
  phoneSensorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#0B120B",
  },
  phoneInnerViewport: {
    flex: 1,
    backgroundColor: colors.bg.base,
  },
  phoneHomeBar: {
    position: "absolute",
    bottom: 6,
    alignSelf: "center",
    width: 130,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    zIndex: 9999,
  },
});
