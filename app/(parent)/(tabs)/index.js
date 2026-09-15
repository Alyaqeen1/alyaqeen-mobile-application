// app/(parent)/(tabs)/index.jsx
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
import { useGetRoleQuery } from "../../../redux/features/role/roleApi";
import {
  useGetEnrolledFullFamilyQuery,
  useGetFullFamilyQuery,
  useGetFamilyDebitQuery,
} from "../../../redux/features/families/familiesApi";
import { useGetUnpaidFeesQuery } from "../../../redux/features/fees/feesApi";
import { useGetAnnouncementByTypeQuery } from "../../../redux/features/announcements/announcementsApi";
import { useGetDepartmentsQuery } from "../../../redux/features/departments/departmentsApi";
import { useGetClassesQuery } from "../../../redux/features/classes/classesApi";
import { htmlToPlainText } from "../../../utils/html";

const SESSION_LABELS = {
  fajr: "Fajr", dhuhr: "Dhuhr", asr: "Asr", maghrib: "Maghrib",
  isha: "Isha", weekend: "Weekend", weekdays: "Weekdays",
  saturday: "Saturday", sunday: "Sunday", morning: "Morning",
  afternoon: "Afternoon", evening: "Evening",
};

function getAcademicShort(academic, departments, classes) {
  if (!academic) return { dept: "Not assigned", cls: "Not assigned", session: "Not set" };

  if (academic.enrollments && Array.isArray(academic.enrollments) && academic.enrollments.length > 0) {
    const first = academic.enrollments[0];
    const dept = departments?.find((item) => item._id === first.dept_id);
    const cls = classes?.find((item) => item._id === first.class_id);
    return {
      dept: dept?.dept_name || "Not assigned",
      cls: cls?.class_name || "Not assigned",
      session: SESSION_LABELS[first.session_time] || first.session_time || "Not set",
    };
  }

  const dept = departments?.find((item) => item._id === academic.dept_id);
  const cls = classes?.find((item) => item._id === academic.class_id);
  return {
    dept: dept?.dept_name || academic.department || "Not assigned",
    cls: cls?.class_name || academic.class || "Not assigned",
    session: SESSION_LABELS[academic.session_time] || academic.time || "Not set",
  };
}

function formatCurrency(amount) {
  return `£${Number(amount || 0).toFixed(2)}`;
}

export default function ParentDashboardScreen() {
  const { colors } = useTheme();
  const { user, loading: authLoading } = useAuth();

  const { data: roleData, isLoading: roleLoading } = useGetRoleQuery(user?.email, {
    skip: !user?.email,
  });

  const {
    data: family,
    isLoading: familyLoading,
    isError: isFamilyError,
    refetch: refetchFamily,
  } = useGetFullFamilyQuery(undefined, { skip: !user?.email });

  const { data: enrolledFamily, isLoading: enrolledLoading } =
    useGetEnrolledFullFamilyQuery(user?.email, { skip: authLoading || !user?.email });

  const { data: directDebitData, isLoading: directDebitLoading } =
    useGetFamilyDebitQuery(enrolledFamily?._id, { skip: !enrolledFamily?._id });

  const { data: unpaidFeesData, isLoading: unpaidFeesLoading } =
    useGetUnpaidFeesQuery(enrolledFamily?._id, { skip: !enrolledFamily?._id });

  const { data: announcement, isLoading: announcementLoading } =
    useGetAnnouncementByTypeQuery("parent", { skip: !user?.email });

  const { data: departments } = useGetDepartmentsQuery();
  const { data: classes } = useGetClassesQuery();

  const isLoading =
    authLoading || roleLoading || familyLoading || enrolledLoading ||
    directDebitLoading || unpaidFeesLoading || announcementLoading;

  const childList = family?.childrenDocs || enrolledFamily?.childrenDocs || [];
  const enrolledChildren = childList.filter((c) => c.status === "enrolled");
  const holdChildren = childList.filter((c) => c.status === "hold");

  const totalOutstanding = unpaidFeesData?.totalAmount || 0;
  const unpaidMonthsCount = unpaidFeesData?.unpaidMonths?.length || 0;
  const directDebitStatus = directDebitData?.directDebit?.status;
  const welcomeName =
    family?.parentName || user?.displayName || user?.email?.split("@")[0] || "Parent";

  // Split children into active + pending
  const activeChildren = childList.filter((c) => c.status !== "rejected");
  const hasChildren = activeChildren.length > 0;

  if (isLoading) {
    return (
      <SafeAreaView edges={["left", "right"]} style={styles.container}>
        <LoadingSpinner label="Loading your dashboard..." />
      </SafeAreaView>
    );
  }

  if (roleData?.role && roleData.role !== "parent") {
    return (
      <SafeAreaView edges={["left", "right"]} style={styles.container}>
        <ErrorState
          title="Parent access required"
          message="This dashboard is only available for parent accounts."
        />
      </SafeAreaView>
    );
  }

  if (isFamilyError) {
    return (
      <SafeAreaView edges={["left", "right"]} style={styles.container}>
        <View style={styles.stateWrapper}>
          <ErrorState
            title="Couldn't load family details"
            message="We couldn't fetch your family information right now."
            onRetry={refetchFamily}
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
        {/* ====== 1. WELCOME HEADER ====== */}
        <View style={styles.welcomeSection}>
          <Text style={[styles.greeting, { color: colors.textStrong }]}>
            Assalamualaikum, {welcomeName} 👋
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {hasChildren
              ? `You have ${activeChildren.length} child${activeChildren.length > 1 ? "ren" : ""} at Alyaqeen Academy`
              : "Welcome to your parent dashboard"}
          </Text>
        </View>

        {/* ====== 2. PAYMENT ALERT (Only if action needed) ====== */}
        {totalOutstanding > 0 && (
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.alertCard,
              {
                backgroundColor: "rgba(220, 38, 38, 0.06)",
                borderColor: "rgba(220, 38, 38, 0.2)",
              },
            ]}
            onPress={() => router.push("/(parent)/(tabs)/fees")}
          >
            <View style={styles.alertIconWrap}>
              <Ionicons name="alert-circle" size={24} color="#DC2626" />
            </View>
            <View style={styles.alertContent}>
              <Text style={[styles.alertTitle, { color: "#991B1B" }]}>
                {formatCurrency(totalOutstanding)} outstanding
              </Text>
              <Text style={[styles.alertSubtitle, { color: "#7F1D1D" }]}>
                {unpaidMonthsCount} month{unpaidMonthsCount === 1 ? "" : "s"} pending payment
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#DC2626" />
          </TouchableOpacity>
        )}

        {totalOutstanding === 0 && (
          <View
            style={[
              styles.successCard,
              {
                backgroundColor: "rgba(4, 120, 87, 0.06)",
                borderColor: "rgba(4, 120, 87, 0.2)",
              },
            ]}
          >
            <Ionicons name="checkmark-circle" size={20} color="#047857" />
            <Text style={[styles.successText, { color: "#065F46" }]}>
              All payments up to date
            </Text>
          </View>
        )}

        {/* ====== 3. QUICK ACTIONS ====== */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.quickActionCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => router.push("/(parent)/(tabs)/child")}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: "rgba(201, 162, 39, 0.12)" }]}>
              <Ionicons name="people-outline" size={22} color="#C9A227" />
            </View>
            <Text style={[styles.quickActionLabel, { color: colors.textStrong }]}>
              Children
            </Text>
            <Text style={[styles.quickActionValue, { color: colors.textMuted }]}>
              {activeChildren.length} enrolled
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.quickActionCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => router.push("/(parent)/(tabs)/fees")}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: "rgba(4, 120, 87, 0.12)" }]}>
              <Ionicons name="card-outline" size={22} color="#047857" />
            </View>
            <Text style={[styles.quickActionLabel, { color: colors.textStrong }]}>
              Fees
            </Text>
            <Text style={[styles.quickActionValue, { color: colors.textMuted }]}>
              {totalOutstanding > 0 ? formatCurrency(totalOutstanding) : "All paid"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.quickActionCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => router.push("/(parent)/(tabs)/academy")}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: "rgba(59, 130, 246, 0.12)" }]}>
              <Ionicons name="school-outline" size={22} color="#3B82F6" />
            </View>
            <Text style={[styles.quickActionLabel, { color: colors.textStrong }]}>
              Academy
            </Text>
            <Text style={[styles.quickActionValue, { color: colors.textMuted }]}>
              Updates
            </Text>
          </TouchableOpacity>
        </View>

        {/* ====== 4. YOUR CHILDREN (Simple cards) ====== */}
        {hasChildren && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.textStrong }]}>
                Your children
              </Text>
              <TouchableOpacity onPress={() => router.push("/(parent)/(tabs)/child")}>
                <Text style={[styles.sectionLink, { color: colors.gold }]}>
                  See all →
                </Text>
              </TouchableOpacity>
            </View>

            {activeChildren.slice(0, 3).map((child) => {
              const academic = getAcademicShort(child.academic, departments, classes);
              const isEnrolled = child.status === "enrolled";

              return (
                <TouchableOpacity
                  key={child._id}
                  activeOpacity={0.85}
                  onPress={() =>
                    router.push({
                      pathname: "/(parent)/child/[childId]",
                      params: { childId: child._id },
                    })
                  }
                  style={[
                    styles.childCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {(child.name || "?").charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.childInfo}>
                    <Text style={[styles.childName, { color: colors.textStrong }]}>
                      {child.name}
                    </Text>
                    <Text style={[styles.childMeta, { color: colors.textMuted }]}>
                      {academic.cls} • {academic.session}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor: isEnrolled ? "#047857" : "#D9A147",
                      },
                    ]}
                  />

                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              );
            })}

            {activeChildren.length > 3 && (
              <TouchableOpacity
                style={styles.moreChildrenLink}
                onPress={() => router.push("/(parent)/(tabs)/child")}
              >
                <Text style={[styles.moreChildrenText, { color: colors.gold }]}>
                  +{activeChildren.length - 3} more
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ====== 5. MESSAGE FROM ACADEMY ====== */}
        <View
          style={[
            styles.messageCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.messageHeader}>
            <View style={styles.messageIconWrap}>
              <Ionicons name="megaphone-outline" size={18} color="#C9A227" />
            </View>
            <Text style={[styles.messageTitle, { color: colors.textStrong }]}>
              From the Academy
            </Text>
          </View>
          <Text
            style={[styles.messageText, { color: colors.textMuted }]}
            numberOfLines={4}
          >
            {htmlToPlainText(
              announcement?.content ||
                "Welcome to your parent dashboard. Stay updated with academy announcements and your children's progress."
            )}
          </Text>
        </View>
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
    paddingTop: 10,
    paddingBottom: 24,
    gap: 20,
  },
  stateWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },

  // Welcome header
  welcomeSection: {
    paddingTop: 8,
    gap: 4,
  },
  greeting: {
    fontSize: 26,
    fontWeight: "800",
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 4,
  },

  // Alert card
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  alertIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  alertContent: {
    flex: 1,
    gap: 2,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  alertSubtitle: {
    fontSize: 12,
  },

  // Success card
  successCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  successText: {
    fontSize: 14,
    fontWeight: "600",
  },

  // Quick actions
  quickActionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  quickActionCard: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    gap: 8,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  quickActionValue: {
    fontSize: 11,
    textAlign: "center",
  },

  // Section
  section: {
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: "600",
  },

  // Children cards (simplified)
  childCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#C9A227",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  childInfo: {
    flex: 1,
    gap: 2,
  },
  childName: {
    fontSize: 15,
    fontWeight: "700",
  },
  childMeta: {
    fontSize: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  moreChildrenLink: {
    alignItems: "center",
    paddingVertical: 8,
  },
  moreChildrenText: {
    fontSize: 13,
    fontWeight: "600",
  },

  // Message from academy
  messageCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  messageIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(201, 162, 39, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  messageTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  messageText: {
    fontSize: 14,
    lineHeight: 21,
  },
});