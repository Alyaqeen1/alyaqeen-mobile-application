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
import EmptyState from "../../../components/common/EmptyState";
import ErrorState from "../../../components/common/ErrorState";
import { useGetRoleQuery } from "../../../redux/features/role/roleApi";
import {
  useGetApprovedFullFamilyQuery,
  useGetEnrolledFullFamilyQuery,
  useGetFamilyDebitQuery,
  useGetFullFamilyQuery,
} from "../../../redux/features/families/familiesApi";
import { useGetAnnouncementByTypeQuery } from "../../../redux/features/announcements/announcementsApi";
import { useGetDepartmentsQuery } from "../../../redux/features/departments/departmentsApi";
import { useGetClassesQuery } from "../../../redux/features/classes/classesApi";
import { htmlToPlainText } from "../../../utils/html";

const SESSION_LABELS = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
  weekend: "Weekend",
  weekdays: "Weekdays",
  saturday: "Saturday",
  sunday: "Sunday",
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

function getAcademicDisplay(academic, departments, classes) {
  if (!academic) {
    return {
      departments: ["Not assigned"],
      classes: ["Not assigned"],
      sessions: ["Not set"],
    };
  }

  if (academic.enrollments && Array.isArray(academic.enrollments)) {
    const departmentNames = academic.enrollments.map((enrollment) => {
      const department = departments?.find((item) => item._id === enrollment.dept_id);
      return department?.dept_name || "Unknown Department";
    });

    const classNames = academic.enrollments.map((enrollment) => {
      const currentClass = classes?.find((item) => item._id === enrollment.class_id);
      return currentClass?.class_name || "Unknown Class";
    });

    const sessionNames = academic.enrollments.map(
      (enrollment) =>
        SESSION_LABELS[enrollment.session_time] ||
        enrollment.session_time ||
        "Not set"
    );

    return {
      departments: [...new Set(departmentNames)],
      classes: [...new Set(classNames)],
      sessions: [...new Set(sessionNames)],
    };
  }

  if (academic.dept_id || academic.class_id) {
    const department = departments?.find((item) => item._id === academic.dept_id);
    const currentClass = classes?.find((item) => item._id === academic.class_id);

    return {
      departments: [department?.dept_name || academic.department || "Unknown Department"],
      classes: [currentClass?.class_name || academic.class || "Unknown Class"],
      sessions: [
        SESSION_LABELS[academic.session_time] ||
          SESSION_LABELS[academic.time] ||
          academic.session_time ||
          academic.time ||
          "Not set",
      ],
    };
  }

  return {
    departments: [academic.department || "Not assigned"],
    classes: [academic.class || "Not assigned"],
    sessions: [
      SESSION_LABELS[academic.session_time] ||
        SESSION_LABELS[academic.time] ||
        academic.session_time ||
        academic.time ||
        "Not set",
    ],
  };
}

function formatCurrency(amount) {
  return `£${Number(amount || 0).toFixed(2)}`;
}

export default function ParentDashboardScreen() {
  const { colors } = useTheme();
  const { user, loading: authLoading } = useAuth();

  const {
    data: roleData,
    isLoading: roleLoading,
  } = useGetRoleQuery(user?.email, {
    skip: !user?.email,
  });

  const {
    data: family,
    isLoading: familyLoading,
    isFetching: familyFetching,
    isError: isFamilyError,
    refetch: refetchFamily,
  } = useGetFullFamilyQuery(undefined, {
    skip: !user?.email,
  });

  const {
    data: approvedFamily,
    isLoading: approvedLoading,
  } = useGetApprovedFullFamilyQuery(user?.email, {
    skip: authLoading || !user?.email,
  });

  const {
    data: enrolledFamily,
    isLoading: enrolledLoading,
  } = useGetEnrolledFullFamilyQuery(user?.email, {
    skip: authLoading || !user?.email,
  });

  const {
    data: directDebitData,
    isLoading: directDebitLoading,
  } = useGetFamilyDebitQuery(enrolledFamily?._id, {
    skip: !enrolledFamily?._id,
  });

  const {
    data: announcement,
    isLoading: announcementLoading,
  } = useGetAnnouncementByTypeQuery("parent", {
    skip: !user?.email,
  });

  const { data: departments } = useGetDepartmentsQuery();
  const { data: classes } = useGetClassesQuery();

  const isLoading =
    authLoading ||
    roleLoading ||
    familyLoading ||
    approvedLoading ||
    enrolledLoading ||
    announcementLoading ||
    directDebitLoading;

  const childList = family?.childrenDocs || enrolledFamily?.childrenDocs || [];
  const approvedChildren = approvedFamily?.childrenDocs?.filter(
    (child) => child.status === "approved"
  ) || [];
  const enrolledChildren = childList.filter((child) => child.status === "enrolled");
  const holdChildren = childList.filter((child) => child.status === "hold");
  const totalMonthlyFee = childList.reduce(
    (sum, child) => sum + Number(child.monthly_fee || 0),
    0
  );

  const stats = useMemo(
    () => [
      { label: "Children", value: `${childList.length}` },
      { label: "Approved", value: `${approvedChildren.length}` },
      { label: "Monthly fee", value: formatCurrency(totalMonthlyFee) },
    ],
    [approvedChildren.length, childList.length, totalMonthlyFee]
  );

  const directDebitStatus = directDebitData?.directDebit?.status;
  const mandateStatus = directDebitData?.directDebit?.mandateStatus;
  const feeChoice = family?.feeChoice || approvedFamily?.feeChoice;
  const welcomeName =
    family?.parentName ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "Parent";

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
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.shadowColor,
            },
          ]}
        >
          <View style={styles.heroHeader}>
            <View style={styles.heroIconWrap}>
              <Ionicons color="#FFFFFF" name="people" size={22} />
            </View>
            <View style={styles.heroCopy}>
              <Text style={[styles.greeting, { color: colors.textStrong }]}>
                Assalamualaikum, {welcomeName}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                Manage your children&apos;s academy details from one place.
              </Text>
            </View>
          </View>

          <View style={styles.contactRow}>
            <View style={styles.contactItem}>
              <Ionicons color={colors.gold} name="mail-outline" size={16} />
              <Text style={[styles.contactText, { color: colors.textMuted }]}>
                {family?.email || user?.email || "No email found"}
              </Text>
            </View>
            {family?.phone ? (
              <View style={styles.contactItem}>
                <Ionicons color={colors.gold} name="call-outline" size={16} />
                <Text style={[styles.contactText, { color: colors.textMuted }]}>
                  {family.phone}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.statsSection}>
          {stats.map((stat) => (
            <View
              key={stat.label}
              style={[
                styles.statCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  shadowColor: colors.shadowColor,
                },
              ]}
            >
              <Text style={[styles.statValue, { color: colors.gold }]}>
                {stat.value}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.shadowColor,
            },
          ]}
        >
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.textStrong }]}>
              Payment overview
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push("/(parent)/profile")}
            >
              <Text style={[styles.sectionLink, { color: colors.gold }]}>
                View profile
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.paymentList}>
            <View style={styles.paymentRow}>
              <Text style={[styles.paymentLabel, { color: colors.textMuted }]}>
                Fee choice
              </Text>
              <Text style={[styles.paymentValue, { color: colors.textStrong }]}>
                {feeChoice || "Not selected yet"}
              </Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={[styles.paymentLabel, { color: colors.textMuted }]}>
                Direct debit
              </Text>
              <Text style={[styles.paymentValue, { color: colors.textStrong }]}>
                {directDebitStatus || "Not set up"}
              </Text>
            </View>
            {mandateStatus ? (
              <View style={styles.paymentRow}>
                <Text style={[styles.paymentLabel, { color: colors.textMuted }]}>
                  Mandate status
                </Text>
                <Text style={[styles.paymentValue, { color: colors.textStrong }]}>
                  {mandateStatus}
                </Text>
              </View>
            ) : null}
            <View style={styles.paymentRow}>
              <Text style={[styles.paymentLabel, { color: colors.textMuted }]}>
                Approved children
              </Text>
              <Text style={[styles.paymentValue, { color: colors.textStrong }]}>
                {approvedChildren.length}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.shadowColor,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.textStrong }]}>
            Parent message
          </Text>
          <Text style={[styles.announcementText, { color: colors.textMuted }]}>
            {htmlToPlainText(
              announcement?.content ||
                "Welcome to your parent dashboard. Here you can manage your children's information and keep up with academy updates."
            )}
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.textStrong }]}>
              Your children
            </Text>
            {familyFetching ? (
              <Text style={[styles.helperText, { color: colors.textMuted }]}>
                Refreshing...
              </Text>
            ) : null}
          </View>

          {childList.length === 0 ? (
            <EmptyState
              title="No children found"
              message="Your family profile does not have child records yet."
              icon="people-outline"
            />
          ) : (
            childList.map((child) => {
              const academicDisplay = getAcademicDisplay(
                child.academic,
                departments,
                classes
              );

              return (
                <View
                  key={child._id}
                  style={[
                    styles.childCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      shadowColor: colors.shadowColor,
                    },
                  ]}
                >
                  <View style={styles.childHeader}>
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
                        Roll number: {child.rollNumber || "Not assigned"}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: colors.goldSoft,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.statusText, { color: colors.textStrong }]}>
                        {child.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailGrid}>
                    <View style={styles.detailItem}>
                      <Text style={[styles.detailLabel, { color: colors.textMuted }]}>
                        Department
                      </Text>
                      <Text style={[styles.detailValue, { color: colors.textStrong }]}>
                        {academicDisplay.departments.join(", ")}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={[styles.detailLabel, { color: colors.textMuted }]}>
                        Class
                      </Text>
                      <Text style={[styles.detailValue, { color: colors.textStrong }]}>
                        {academicDisplay.classes.join(", ")}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={[styles.detailLabel, { color: colors.textMuted }]}>
                        Session
                      </Text>
                      <Text style={[styles.detailValue, { color: colors.textStrong }]}>
                        {academicDisplay.sessions.join(", ")}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={[styles.detailLabel, { color: colors.textMuted }]}>
                        Monthly fee
                      </Text>
                      <Text style={[styles.detailValue, { color: colors.textStrong }]}>
                        {formatCurrency(child.monthly_fee)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.shadowColor,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.textStrong }]}>
            Status summary
          </Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
              Enrolled
            </Text>
            <Text style={[styles.summaryValue, { color: colors.textStrong }]}>
              {enrolledChildren.length}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
              On hold
            </Text>
            <Text style={[styles.summaryValue, { color: colors.textStrong }]}>
              {holdChildren.length}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
              Family name
            </Text>
            <Text style={[styles.summaryValue, { color: colors.textStrong }]}>
              {family?.familyName || "Not available"}
            </Text>
          </View>
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
    gap: 16,
  },
  stateWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  section: {
    gap: 12,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 23,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  statsSection: {
    flexDirection: "row",
    gap: 12,
  },
  heroCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  heroIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#C9A227",
    alignItems: "center",
    justifyContent: "center",
  },
  heroCopy: {
    flex: 1,
    gap: 4,
  },
  contactRow: {
    marginTop: 16,
    gap: 10,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  contactText: {
    flex: 1,
    fontSize: 14,
  },
  statCard: {
    flex: 1,
    minHeight: 102,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  statLabel: {
    marginTop: 6,
    fontSize: 12,
    textAlign: "center",
  },
  sectionCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 3,
    gap: 14,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: "700",
  },
  helperText: {
    fontSize: 13,
  },
  paymentList: {
    gap: 10,
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  paymentLabel: {
    fontSize: 14,
    flex: 1,
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "right",
    flex: 1,
  },
  announcementText: {
    fontSize: 15,
    lineHeight: 23,
  },
  childCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 3,
    gap: 16,
  },
  childHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#C9A227",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  childInfo: {
    flex: 1,
    gap: 2,
  },
  childName: {
    fontSize: 17,
    fontWeight: "700",
  },
  childMeta: {
    fontSize: 13,
  },
  statusBadge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  detailGrid: {
    gap: 12,
  },
  detailItem: {
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "700",
  },
});
