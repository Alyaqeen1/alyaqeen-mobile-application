import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../contexts";
import useAuth from "../../../hooks/useAuth";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import EmptyState from "../../../components/common/EmptyState";
import ErrorState from "../../../components/common/ErrorState";
import {
  useGetEnrolledFullFamilyQuery,
  useGetFullFamilyQuery,
} from "../../../redux/features/families/familiesApi";
import {
  useGetAttendanceByStudentSummaryQuery,
} from "../../../redux/features/attendances/attendancesApi";
import { useGetMeritsOfStudentQuery } from "../../../redux/features/merits/meritsApi";
import { useGetDepartmentsQuery } from "../../../redux/features/departments/departmentsApi";
import { useGetClassesQuery } from "../../../redux/features/classes/classesApi";

function getMonthYear() {
  const date = new Date();
  return {
    month: String(date.getMonth() + 1).padStart(2, "0"),
    year: String(date.getFullYear()),
  };
}

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
  return `GBP ${Number(amount || 0).toFixed(2)}`;
}

export default function ParentChildScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { month, year } = useMemo(getMonthYear, []);

  const {
    data: family,
    isLoading: familyLoading,
    isError: familyError,
    refetch: refetchFamily,
  } = useGetFullFamilyQuery(undefined, {
    skip: !user?.email,
  });

  const { data: enrolledFamily } = useGetEnrolledFullFamilyQuery(user?.email, {
    skip: !user?.email,
  });
  const { data: departments } = useGetDepartmentsQuery();
  const { data: classes } = useGetClassesQuery();

  const childList = family?.childrenDocs || enrolledFamily?.childrenDocs || [];
  const [activeChildId, setActiveChildId] = useState(null);

  useEffect(() => {
    if (!activeChildId && childList.length > 0) {
      setActiveChildId(childList[0]._id);
    }
  }, [activeChildId, childList]);

  const selectedChild =
    childList.find((child) => child._id === activeChildId) || childList[0] || null;

  const {
    data: attendanceSummary,
    isLoading: attendanceLoading,
    isError: attendanceError,
    refetch: refetchAttendance,
  } = useGetAttendanceByStudentSummaryQuery(
    selectedChild?._id ? { studentId: selectedChild._id, month, year } : undefined,
    { skip: !selectedChild?._id }
  );

  const {
    data: merits,
    isLoading: meritsLoading,
    isError: meritsError,
    refetch: refetchMerits,
  } = useGetMeritsOfStudentQuery(
    selectedChild?._id ? { studentId: selectedChild._id, month, year } : undefined,
    { skip: !selectedChild?._id }
  );

  const isLoading = familyLoading || attendanceLoading || meritsLoading;

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.container}>
      {isLoading ? (
        <LoadingSpinner label="Loading child details..." />
      ) : familyError ? (
        <View style={styles.stateWrapper}>
          <ErrorState
            title="Couldn't load your children"
            message="We couldn't fetch your family data right now."
            onRetry={refetchFamily}
          />
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={[styles.title, { color: colors.textStrong }]}>
              Your children
            </Text>

            {childList.length === 0 ? (
              <EmptyState
                title="No children found"
                message="Your family profile does not have child records yet."
                icon="people-outline"
              />
            ) : (
              <View style={styles.childrenList}>
                {childList.map((child) => {
                  const isActive = child._id === selectedChild?._id;
                  const academicDisplay = getAcademicDisplay(
                    child.academic,
                    departments,
                    classes
                  );

                  return (
                    <View
                      key={child._id}
                      style={[
                        styles.childPickerCard,
                        {
                          backgroundColor: isActive ? colors.goldSoft : colors.surface,
                          borderColor: isActive ? colors.gold : colors.border,
                          shadowColor: colors.shadowColor,
                        },
                      ]}
                    >
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => setActiveChildId(child._id)}
                      >
                        <View style={styles.childHeader}>
                          <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                              {(child.name || "?").charAt(0).toUpperCase()}
                            </Text>
                          </View>
                          <View style={styles.childInfo}>
                            <Text
                              style={[styles.childName, { color: colors.textStrong }]}
                            >
                              {child.name}
                            </Text>
                            <Text
                              style={[styles.childMeta, { color: colors.textMuted }]}
                            >
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
                            <Text
                              style={[styles.statusText, { color: colors.textStrong }]}
                            >
                              {child.status}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.detailGrid}>
                          <View style={styles.detailItem}>
                            <Text
                              style={[styles.detailLabel, { color: colors.textMuted }]}
                            >
                              Department
                            </Text>
                            <Text
                              style={[styles.detailValue, { color: colors.textStrong }]}
                            >
                              {academicDisplay.departments.join(", ")}
                            </Text>
                          </View>
                          <View style={styles.detailItem}>
                            <Text
                              style={[styles.detailLabel, { color: colors.textMuted }]}
                            >
                              Class
                            </Text>
                            <Text
                              style={[styles.detailValue, { color: colors.textStrong }]}
                            >
                              {academicDisplay.classes.join(", ")}
                            </Text>
                          </View>
                          <View style={styles.detailItem}>
                            <Text
                              style={[styles.detailLabel, { color: colors.textMuted }]}
                            >
                              Session
                            </Text>
                            <Text
                              style={[styles.detailValue, { color: colors.textStrong }]}
                            >
                              {academicDisplay.sessions.join(", ")}
                            </Text>
                          </View>
                          <View style={styles.detailItem}>
                            <Text
                              style={[styles.detailLabel, { color: colors.textMuted }]}
                            >
                              Monthly fee
                            </Text>
                            <Text
                              style={[styles.detailValue, { color: colors.textStrong }]}
                            >
                              {formatCurrency(child.monthly_fee)}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {selectedChild ? (
            <>
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
                    Attendance summary
                  </Text>
                  <Ionicons color={colors.gold} name="calendar-outline" size={18} />
                </View>

                {attendanceError ? (
                  <ErrorState
                    title="Couldn't load attendance"
                    message="Try again to see attendance details."
                    onRetry={refetchAttendance}
                  />
                ) : (
                  <View style={styles.kvList}>
                    <View style={styles.kvRow}>
                      <Text style={[styles.kvLabel, { color: colors.textMuted }]}>
                        Month
                      </Text>
                      <Text style={[styles.kvValue, { color: colors.textStrong }]}>
                        {month}/{year}
                      </Text>
                    </View>
                    <View style={styles.kvRow}>
                      <Text style={[styles.kvLabel, { color: colors.textMuted }]}>
                        Records
                      </Text>
                      <Text style={[styles.kvValue, { color: colors.textStrong }]}>
                        {Array.isArray(attendanceSummary)
                          ? attendanceSummary.length
                          : attendanceSummary?.count ?? "—"}
                      </Text>
                    </View>
                    <View style={styles.kvRow}>
                      <Text style={[styles.kvLabel, { color: colors.textMuted }]}>
                        Present
                      </Text>
                      <Text style={[styles.kvValue, { color: colors.textStrong }]}>
                        {attendanceSummary?.present ?? attendanceSummary?.presentCount ?? "—"}
                      </Text>
                    </View>
                    <View style={styles.kvRow}>
                      <Text style={[styles.kvLabel, { color: colors.textMuted }]}>
                        Absent
                      </Text>
                      <Text style={[styles.kvValue, { color: colors.textStrong }]}>
                        {attendanceSummary?.absent ?? attendanceSummary?.absentCount ?? "—"}
                      </Text>
                    </View>
                  </View>
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
                <View style={styles.sectionHeaderRow}>
                  <Text style={[styles.sectionTitle, { color: colors.textStrong }]}>
                    Achievements
                  </Text>
                  <Ionicons color={colors.gold} name="trophy-outline" size={18} />
                </View>

                {meritsError ? (
                  <ErrorState
                    title="Couldn't load achievements"
                    message="Try again to see achievements details."
                    onRetry={refetchMerits}
                  />
                ) : Array.isArray(merits) && merits.length > 0 ? (
                  <View style={styles.kvList}>
                    <View style={styles.kvRow}>
                      <Text style={[styles.kvLabel, { color: colors.textMuted }]}>
                        Items this month
                      </Text>
                      <Text style={[styles.kvValue, { color: colors.textStrong }]}>
                        {merits.length}
                      </Text>
                    </View>
                    <Text style={[styles.helperText, { color: colors.textMuted }]}>
                      Latest: {merits[0]?.title || merits[0]?.reason || merits[0]?.type || "Achievement"}
                    </Text>
                  </View>
                ) : (
                  <EmptyState
                    title="No achievements yet"
                    message="Achievements will appear here when awarded."
                    icon="sparkles-outline"
                  />
                )}
              </View>
            </>
          ) : null}
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
  stateWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  section: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  childPickerCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  childrenList: {
    gap: 0,
  },
  sectionCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 3,
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  kvList: {
    gap: 10,
  },
  kvRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  kvLabel: {
    fontSize: 14,
  },
  kvValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  helperText: {
    marginTop: 6,
    fontSize: 13,
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
});
