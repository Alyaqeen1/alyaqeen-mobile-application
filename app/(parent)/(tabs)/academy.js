import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AnnouncementCard from "../../../components/cards/AnnouncementCard.js";
import { useTheme } from "../../../contexts";
import useAuth from "../../../hooks/useAuth";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import EmptyState from "../../../components/common/EmptyState";
import ErrorState from "../../../components/common/ErrorState";
import {
  useGetAnnouncementByTypeQuery,
  useGetPublicAnnouncementsQuery,
} from "../../../redux/features/announcements/announcementsApi";

export default function ParentAcademyScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();

  const {
    data: parentNoticesRaw,
    isLoading: parentNoticesLoading,
    isError: parentNoticesError,
    refetch: refetchParentNotices,
  } = useGetAnnouncementByTypeQuery("parent", {
    skip: !user?.email,
  });

  const {
    data: publicAnnouncementsRaw,
    isLoading: publicAnnouncementsLoading,
    isError: publicAnnouncementsError,
    refetch: refetchPublicAnnouncements,
  } = useGetPublicAnnouncementsQuery(undefined, {
    skip: !user?.email,
  });

  const parentNotices = useMemo(() => {
    if (!parentNoticesRaw) return [];
    return Array.isArray(parentNoticesRaw) ? parentNoticesRaw : [parentNoticesRaw];
  }, [parentNoticesRaw]);

  const publicAnnouncements = useMemo(() => {
    if (!publicAnnouncementsRaw) return [];
    return Array.isArray(publicAnnouncementsRaw)
      ? publicAnnouncementsRaw
      : [publicAnnouncementsRaw];
  }, [publicAnnouncementsRaw]);

  const isLoading = parentNoticesLoading || publicAnnouncementsLoading;

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.container}>
      {isLoading ? (
        <LoadingSpinner label="Loading academy updates..." />
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={[styles.title, { color: colors.textStrong }]}>Academy</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Announcements and updates from Alyaqeen Academy
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Parent notices
            </Text>
            {parentNoticesError ? (
              <ErrorState
                title="Couldn't load parent notices"
                message="Please try again."
                onRetry={refetchParentNotices}
              />
            ) : parentNotices.length === 0 ? (
              <EmptyState
                title="No parent notices"
                message="Parent notices will appear here."
                icon="notifications-outline"
              />
            ) : (
              parentNotices.map((notice, index) => (
                <View
                  key={notice?._id || notice?.id || index}
                  style={styles.cardWrapper}
                >
                  <AnnouncementCard
                    announcement={{
                      date: notice?.lastUpdated || notice?.date || "Recently",
                      title: notice?.title || "Parent notice",
                      description: notice?.content || notice?.description || "",
                    }}
                  />
                </View>
              ))
            )}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Community announcements
            </Text>
            {publicAnnouncementsError ? (
              <ErrorState
                title="Couldn't load announcements"
                message="Please try again."
                onRetry={refetchPublicAnnouncements}
              />
            ) : publicAnnouncements.length === 0 ? (
              <EmptyState
                title="No announcements yet"
                message="Public announcements will appear here."
                icon="megaphone-outline"
              />
            ) : (
              publicAnnouncements.map((item, index) => (
                <View
                  key={item?._id || item?.id || index}
                  style={styles.cardWrapper}
                >
                  <AnnouncementCard
                    announcement={{
                      date: item?.lastUpdated || item?.date || "Recently",
                      title: item?.title || "Announcement",
                      description: item?.content || item?.description || "",
                    }}
                  />
                </View>
              ))
            )}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Events</Text>
            <EmptyState
              title="Events coming soon"
              message="Upcoming events will appear here when this section is connected."
              icon="calendar-outline"
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollView: {
    flex: 1,
    paddingBottom: 120,
  },
  section: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  cardWrapper: {
    marginBottom: 12,
  },
});
