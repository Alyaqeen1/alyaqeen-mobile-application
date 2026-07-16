import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "../../../contexts";
import useAuth from "../../../hooks/useAuth";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ErrorState from "../../../components/common/ErrorState";
import { useGetUserQuery } from "../../../redux/features/role/roleApi";
import { useGetTodayBasicSummaryQuery } from "../../../redux/features/attendances/attendancesApi";

function formatTeacherName(user, userData) {
  const fallbackEmailName = user?.email
    ? user.email.split("@")[0].replace(/[._-]+/g, " ")
    : "Teacher";
  const rawName =
    user?.displayName ||
    userData?.name ||
    userData?.displayName ||
    userData?.fullName ||
    fallbackEmailName;

  return String(rawName)
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatTimeRange(group) {
  const start =
    group?.startTime ||
    group?.start ||
    group?.from ||
    group?.timeFrom ||
    group?.sessionStart;
  const end =
    group?.endTime ||
    group?.end ||
    group?.to ||
    group?.timeTo ||
    group?.sessionEnd;

  if (start && end) return `${start} - ${end}`;

  return (
    group?.timeRange ||
    group?.time ||
    group?.schedule ||
    group?.slot ||
    "Time not set"
  );
}

function normalizeStatus(group) {
  const rawStatus =
    group?.status ||
    group?.attendanceStatus ||
    group?.markingStatus ||
    (group?.completed === true ? "done" : null) ||
    (group?.marked === true ? "done" : null) ||
    (group?.pending === true ? "pending" : null) ||
    "";

  const normalized = String(rawStatus).toLowerCase();

  if (
    normalized.includes("done") ||
    normalized.includes("complete") ||
    normalized.includes("marked")
  ) {
    return "done";
  }

  if (
    normalized.includes("pending") ||
    normalized.includes("due") ||
    normalized.includes("not marked")
  ) {
    return "pending";
  }

  return "done";
}

function normalizeTodayGroups(summaryData) {
  const candidate =
    summaryData?.todayGroups ||
    summaryData?.groups ||
    summaryData?.classes ||
    summaryData?.sessions ||
    summaryData?.items ||
    summaryData?.data ||
    (Array.isArray(summaryData) ? summaryData : []);

  if (!Array.isArray(candidate)) return [];

  return candidate
    .filter((item) => item && typeof item === "object")
    .map((group, index) => {
      const studentCount =
        group?.studentCount ||
        group?.studentsCount ||
        group?.totalStudents ||
        group?.count ||
        (Array.isArray(group?.students) ? group.students.length : 0) ||
        0;

      return {
        id: group?._id || group?.id || `${group?.name || "group"}-${index}`,
        title:
          group?.name ||
          group?.groupName ||
          group?.className ||
          group?.sessionName ||
          group?.title ||
          "Today's group",
        timeRange: formatTimeRange(group),
        studentCount,
        status: normalizeStatus(group),
      };
    });
}

function getTodayClassCount(summaryData, groups) {
  return (
    summaryData?.todayClasses ||
    summaryData?.classesCount ||
    summaryData?.groupCount ||
    summaryData?.totalClasses ||
    groups.length
  );
}

function getPendingAttendanceCount(summaryData, groups) {
  return (
    summaryData?.pendingAttendance ||
    summaryData?.pendingCount ||
    summaryData?.pendingAttendances ||
    groups.filter((group) => group.status === "pending").length
  );
}

export default function TeacherDashboardScreen() {
  const { colors } = useTheme();
  const { user, loading: authLoading } = useAuth();
  const {
    data: userData,
    isLoading: userLoading,
  } = useGetUserQuery(user?.email, {
    skip: !user?.email,
  });
  const {
    data: todaySummary,
    isLoading: summaryLoading,
    isError: summaryError,
    refetch: refetchSummary,
  } = useGetTodayBasicSummaryQuery();

  const teacherName = useMemo(
    () => formatTeacherName(user, userData),
    [user, userData]
  );
  const todayGroups = useMemo(
    () => normalizeTodayGroups(todaySummary),
    [todaySummary]
  );
  const todayClasses = useMemo(
    () => getTodayClassCount(todaySummary, todayGroups),
    [todaySummary, todayGroups]
  );
  const pendingAttendance = useMemo(
    () => getPendingAttendanceCount(todaySummary, todayGroups),
    [todaySummary, todayGroups]
  );

  if (authLoading || userLoading || summaryLoading) {
    return (
      <SafeAreaView edges={["left", "right"]} style={styles.container}>
        <LoadingSpinner label="Loading teacher dashboard..." />
      </SafeAreaView>
    );
  }

  if (summaryError) {
    return (
      <SafeAreaView edges={["left", "right"]} style={styles.container}>
        <View style={styles.stateWrapper}>
          <ErrorState
            title="Couldn't load teacher dashboard"
            message="Please try again to load today's classes and attendance."
            onRetry={refetchSummary}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerCopy}>
            <Text style={[styles.roleEyebrow, { color: colors.textMuted }]}>
              TEACHER
            </Text>
            <Text style={[styles.teacherName, { color: colors.textStrong }]}>
              {teacherName}
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push("/(teacher)/(tabs)/students")}
              style={[
                styles.iconButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons color={colors.textStrong} name="search-outline" size={20} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push("/(teacher)/(tabs)/messages")}
              style={[
                styles.iconButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons color={colors.textStrong} name="notifications-outline" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statRow}>
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowColor: colors.shadowColor,
              },
            ]}
          >
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              TODAY&apos;S{"\n"}CLASSES
            </Text>
            <View style={styles.statFooter}>
              <Text style={[styles.statValue, { color: colors.textStrong }]}>
                {todayClasses}
              </Text>
              <Ionicons color={colors.gold} name="book-outline" size={22} />
            </View>
          </View>

          <View
            style={[
              styles.statCard,
              styles.highlightStatCard,
              {
                backgroundColor: colors.gold,
                borderColor: colors.gold,
                shadowColor: colors.shadowColor,
              },
            ]}
          >
            <Text style={[styles.statLabel, styles.highlightStatLabel]}>
              PENDING{"\n"}ATTENDANCE
            </Text>
            <View style={styles.statFooter}>
              <Text style={[styles.statValue, styles.highlightStatValue]}>
                {pendingAttendance}
              </Text>
              <Ionicons color="#0B1220" name="alert-circle-outline" size={22} />
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textStrong }]}>
            TODAY&apos;S GROUPS
          </Text>
        </View>

        {todayGroups.length > 0 ? (
          <View style={styles.groupList}>
            {todayGroups.map((group) => {
              const isPending = group.status === "pending";

              return (
                <TouchableOpacity
                  key={group.id}
                  activeOpacity={0.9}
                  onPress={() => router.push("/(teacher)/(tabs)/attendance")}
                  style={[
                    styles.groupCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      shadowColor: colors.shadowColor,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.groupIconWrap,
                      {
                        backgroundColor: isPending ? colors.goldSoft : "rgba(201, 162, 39, 0.14)",
                      },
                    ]}
                  >
                    <Ionicons
                      color={isPending ? colors.gold : colors.textMuted}
                      name="time-outline"
                      size={22}
                    />
                  </View>

                  <View style={styles.groupCopy}>
                    <Text style={[styles.groupTitle, { color: colors.textStrong }]}>
                      {group.title}
                    </Text>
                    <Text style={[styles.groupMeta, { color: colors.textMuted }]}>
                      {group.timeRange}
                    </Text>
                    <Text style={[styles.groupMeta, { color: colors.textMuted }]}>
                      · {group.studentCount} students
                    </Text>
                  </View>

                  <View style={styles.groupStatusWrap}>
                    <Ionicons
                      color={isPending ? colors.gold : colors.textMuted}
                      name={isPending ? "ellipse-outline" : "checkmark"}
                      size={16}
                    />
                    <Text
                      style={[
                        styles.groupStatus,
                        { color: isPending ? colors.gold : colors.textMuted },
                      ]}
                    >
                      {isPending ? "Pending" : "Done"}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.emptyTitle, { color: colors.textStrong }]}>
              No groups scheduled yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              When today&apos;s classes are available, they&apos;ll appear here.
            </Text>
          </View>
        )}
      </ScrollView>
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
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },
  stateWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
  },
  headerCopy: {
    flex: 1,
  },
  roleEyebrow: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  teacherName: {
    marginTop: 8,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "800",
  },
  headerActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 2,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  statCard: {
    flex: 1,
    minHeight: 128,
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
    justifyContent: "space-between",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  highlightStatCard: {
    backgroundColor: "#E1AC45",
  },
  statLabel: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
  },
  highlightStatLabel: {
    color: "#5F4300",
  },
  statFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statValue: {
    fontSize: 42,
    fontWeight: "800",
  },
  highlightStatValue: {
    color: "#0B1220",
  },
  sectionHeader: {
    marginTop: 26,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 23,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  groupList: {
    gap: 14,
  },
  groupCard: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  groupIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  groupCopy: {
    flex: 1,
    marginLeft: 14,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  groupMeta: {
    marginTop: 3,
    fontSize: 15,
  },
  groupStatusWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: 12,
  },
  groupStatus: {
    fontSize: 14,
    fontWeight: "700",
  },
  emptyCard: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
  },
});
