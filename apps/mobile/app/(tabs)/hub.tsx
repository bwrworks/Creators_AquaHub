import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, typography, spacing, radii } from "@cah/design-tokens";
import { SYNTHETIC_HUB_POSTS } from "@cah/domain";
import { LoadingState, EmptyState, ErrorState, OfflineBanner, StatusBadge } from "../../src/components/ui";

type StateMode = "loaded" | "loading" | "empty" | "error" | "offline";
type FeedCategory = "Showcase" | "Questions" | "Journals";

export default function HubScreen() {
  const [stateMode, setStateMode] = useState<StateMode>("loaded");
  const [activeCategory, setActiveCategory] = useState<FeedCategory>("Showcase");

  const filteredPosts = SYNTHETIC_HUB_POSTS.filter(
    (post) => post.category === activeCategory
  );

  const handleReportPost = (authorHandle: string) => {
    Alert.alert(
      "Community Moderation",
      `Report objectionable content or block ${authorHandle}? All UGC is moderated according to welfare and safety guidelines.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Block User", style: "destructive" },
        { text: "Report Content", style: "destructive" },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {stateMode === "offline" && (
          <OfflineBanner message="Offline Mode • Viewing cached community feed • 0 network bytes" />
        )}

        <View style={styles.header}>
          <View>
            <Text style={styles.subtitle}>COMMUNITY FEED</Text>
            <Text style={styles.title}>The Hub</Text>
          </View>
          <TouchableOpacity style={styles.createButton} activeOpacity={0.85}>
            <Text style={styles.createButtonText}>+ Share Build</Text>
          </TouchableOpacity>
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

        {/* UGC Safety & Guidelines Notice */}
        <View style={styles.safetyCard}>
          <View style={styles.safetyHeader}>
            <Text style={styles.safetyTitle}>Community Safety & Animal Welfare</Text>
            <Text style={styles.zeroCostBadge}>₹0 UGC Engine</Text>
          </View>
          <Text style={styles.safetyText}>
            The Hub connects passionate aquarists across India. Live animal commerce is strictly forbidden. 
            All members retain full data ownership and can report or block users instantly.
          </Text>
        </View>

        {/* Conditional States */}
        {stateMode === "loading" && (
          <LoadingState
            message="Loading community discussions..."
            submessage="Rendering local synthetic feed cache"
          />
        )}

        {stateMode === "empty" && (
          <EmptyState
            title="No Feed Entries Yet"
            description="Be the first aquarist to share your aquascape progression, reef diary, or planted tank setup."
            actionLabel="+ Publish Showcase"
            onAction={() => setStateMode("loaded")}
          />
        )}

        {stateMode === "error" && (
          <ErrorState
            title="Failed to Sync Community Feed"
            message="Network sync paused to protect zero-cost quotas. Offline feed remains available."
            retryLabel="Reload Feed"
            onRetry={() => setStateMode("loaded")}
          />
        )}

        {(stateMode === "loaded" || stateMode === "offline") && (
          <>
            {/* Feed Category Tabs */}
            <View style={styles.feedFilterRow}>
              {(["Showcase", "Questions", "Journals"] as FeedCategory[]).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.filterTab,
                    activeCategory === cat && styles.activeFilterTab,
                  ]}
                  onPress={() => setActiveCategory(cat)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.filterText,
                      activeCategory === cat && styles.activeFilterText,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Posts Stream */}
            {filteredPosts.length === 0 ? (
              <EmptyState
                title="No Posts in Category"
                description={`No posts in ${activeCategory} right now.`}
                actionLabel="Switch to Showcases"
                onAction={() => setActiveCategory("Showcase")}
              />
            ) : (
              filteredPosts.map((post) => (
                <View key={post.id} style={styles.postCard}>
                  <View style={styles.postHeader}>
                    <View style={styles.authorArea}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{post.authorName[0]}</Text>
                      </View>
                      <View>
                        <View style={styles.authorNameRow}>
                          <Text style={styles.authorName}>{post.authorName}</Text>
                          <View style={styles.badgePill}>
                            <Text style={styles.badgeText}>{post.authorBadge}</Text>
                          </View>
                        </View>
                        <Text style={styles.authorHandle}>{post.authorHandle} • {post.publishedAt}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleReportPost(post.authorHandle)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={styles.moreIcon}>•••</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.postTitle}>{post.title}</Text>
                  <Text style={styles.postSummary}>{post.summary}</Text>

                  {/* Tags & Category */}
                  <View style={styles.tagsRow}>
                    <StatusBadge type="tankType" value={post.tankType} />
                    {post.tags.map((tag) => (
                      <View key={tag} style={styles.tag}>
                        <Text style={styles.tagText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Post Interactions */}
                  <View style={styles.interactionRow}>
                    <TouchableOpacity style={styles.interactionButton} activeOpacity={0.7}>
                      <Text style={styles.interactionText}>♥ {post.likesCount}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.interactionButton} activeOpacity={0.7}>
                      <Text style={styles.interactionText}>💬 {post.commentsCount}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  createButton: {
    backgroundColor: colors.brand.green,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
  },
  createButtonText: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.xs,
    color: colors.text.inverse,
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
  safetyCard: {
    backgroundColor: colors.surface.elevated,
    borderRadius: radii.base,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.base,
    gap: spacing.xs,
  },
  safetyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  safetyTitle: {
    fontFamily: typography.fonts.sansSemiBold,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  zeroCostBadge: {
    fontFamily: typography.fonts.sans,
    fontSize: 10,
    color: colors.text.muted,
  },
  safetyText: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    lineHeight: typography.lineHeights.xs,
  },
  feedFilterRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  filterTab: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    backgroundColor: colors.surface.base,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  activeFilterTab: {
    backgroundColor: colors.brand.green,
    borderColor: colors.brand.green,
  },
  filterText: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  activeFilterText: {
    color: colors.text.inverse,
    fontFamily: typography.fonts.sansBold,
  },
  postCard: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.base,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.base,
    gap: spacing.xs,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  authorArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: colors.surface.elevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border.active,
  },
  avatarText: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.xs,
    color: colors.brand.green,
  },
  authorNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  authorName: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.xs,
    color: colors.text.primary,
  },
  badgePill: {
    backgroundColor: "rgba(139, 207, 50, 0.15)",
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: radii.xs,
  },
  badgeText: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: 9,
    color: colors.brand.green,
  },
  authorHandle: {
    fontFamily: typography.fonts.sans,
    fontSize: 10,
    color: colors.text.muted,
  },
  moreIcon: {
    color: colors.text.muted,
    fontSize: 14,
    paddingHorizontal: 4,
  },
  postTitle: {
    fontFamily: typography.fonts.displayMedium,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    marginTop: 2,
  },
  postSummary: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    lineHeight: typography.lineHeights.xs,
  },
  tagsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flexWrap: "wrap",
    marginTop: spacing.xxs,
  },
  tag: {
    backgroundColor: colors.surface.base,
    paddingVertical: 2,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.xs,
  },
  tagText: {
    fontFamily: typography.fonts.sans,
    fontSize: 10,
    color: colors.text.muted,
  },
  interactionRow: {
    flexDirection: "row",
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    paddingTop: spacing.xs,
    marginTop: spacing.xxs,
  },
  interactionButton: {
    paddingVertical: 2,
  },
  interactionText: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: 11,
    color: colors.text.muted,
  },
});
