import React from "react";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, typography } from "@cah/design-tokens";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface.base,
          borderTopColor: colors.border.subtle,
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 88 : 68,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
          paddingTop: 8,
          elevation: 8, // Clean shadow for Android
        },
        tabBarActiveTintColor: colors.brand.green,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarLabelStyle: {
          fontFamily: typography.fonts.sansMedium,
          fontSize: typography.sizes.xs,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerTitle: "Creators AquaHub",
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tanks"
        options={{
          title: "My Tanks",
          headerTitle: "My Aquariums",
          tabBarIcon: ({ color, size }) => (
            <Feather name="droplet" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="hub"
        options={{
          title: "The Hub",
          headerTitle: "The Hub",
          tabBarIcon: ({ color, size }) => (
            <Feather name="compass" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="nearby"
        options={{
          title: "Nearby",
          headerTitle: "Verified Stores",
          tabBarIcon: ({ color, size }) => (
            <Feather name="map-pin" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerTitle: "My Profile",
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={20} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
