import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
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
  useGetStudentAttendanceQuery,
  useGetAttendanceByStudentSummaryQuery,
} from "../../../redux/features/attendances/attendancesApi";
import { useGetMeritsOfStudentQuery } from "../../../redux/features/merits/meritsApi";
import { useGetDepartmentsQuery } from "../../../redux/features/departments/departmentsApi";
import { useGetClassesQuery } from "../../../redux/features/classes/classesApi";

const MONTH_OPTIONS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];
const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

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

function getMonthYear() {
  const date = new Date();
  return {
    month: String(date.getMonth() + 1).padStart(2, "0"),
    year: String(date.getFullYear()),
  };
}

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

function parseAttendanceDate(record) {
  const rawValue = record?.date || record?.createdAt;
  if (!rawValue) return null;

  const baseValue = String(rawValue).split("T")[0];
  const parts = baseValue.split("-").map(Number);

  if (parts.length === 3 && parts.every((part) => Number.isFinite(part))) {
    const [year, month, day] = parts;
    return new Date(year, month - 1, day);
  }

  const parsed = new Date(rawValue);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeAttendanceStatus(value) {
  const normalized = String(value || "").toLowerCase();

  if (normalized.includes("late")) return "late";
  if (normalized.includes("absent")) return "absent";
  if (normalized.includes("present")) return "present";
  return null;
}

function getAttendanceStatus(record) {
  const directStatus = normalizeAttendanceStatus(
    record?.status ||
      record?.attendance ||
      record?.attendanceStatus ||
      record?.mark ||
      record?.type
  );

  if (directStatus) {
    return directStatus;
  }

  // Some records keep "present" as the base state and a separate late flag.
  if (
    record?.late === true ||
    record?.isLate === true ||
    record?.lateArrival === true ||
    record?.isLateArrival === true
  ) {
    return "late";
  }

  return null;
}

export default function ParentChildDetailsScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { childId } = useLocalSearchParams();
  const { month, year } = useMemo(getMonthYear, []);
  const [activeDetailTab, setActiveDetailTab] = useState("attendance");
  const [calendarDate, setCalendarDate] = useState(
    () => new Date(Number(year), Number(month) - 1, 1)
  );

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
  const selectedChild =
    childList.find((child) => String(child._id) === String(childId)) || null;

  const selectedAcademicDisplay = getAcademicDisplay(
    selectedChild?.academic,
    departments,
    classes
  );

  const attendanceMonth = String(calendarDate.getMonth() + 1).padStart(2, "0");
  const attendanceYear = String(calendarDate.getFullYear());

  const attendanceQueryParams = useMemo(
    () => ({
      studentId: selectedChild?._id,
      month: attendanceMonth,
      year: attendanceYear,
    }),
    [selectedChild?._id, attendanceMonth, attendanceYear]
  );

  const {
    data: attendanceSummary,
    isLoading: attendanceLoading,
    isError: attendanceError,
    refetch: refetchAttendance,
  } = useGetAttendanceByStudentSummaryQuery(attendanceQueryParams, {
    skip: !selectedChild?._id || activeDetailTab !== "attendance",
    refetchOnMountOrArgChange: true,
  });

  const {
    data: attendanceRecords,
    isLoading: attendanceRecordsLoading,
    isError: attendanceRecordsError,
    refetch: refetchAttendanceRecords,
  } = useGetStudentAttendanceQuery(selectedChild?._id, {
    skip: !selectedChild?._id || activeDetailTab !== "attendance",
  });

  const {
    data: merits,
    isLoading: meritsLoading,
    isError: meritsError,
    refetch: refetchMerits,
  } = useGetMeritsOfStudentQuery(
    selectedChild?._id ? { studentId: selectedChild._id, month, year } : undefined,
    { skip: !selectedChild?._id || activeDetailTab !== "awards" }
  );

  const attendanceData = {
    present:
      typeof attendanceSummary?.present === "number"
        ? attendanceSummary.present
        : attendanceSummary?.present?.count || attendanceSummary?.presentCount || 0,
    absent:
      typeof attendanceSummary?.absent === "number"
        ? attendanceSummary.absent
        : attendanceSummary?.absent?.count || attendanceSummary?.absentCount || 0,
    late:
      typeof attendanceSummary?.late === "number"
        ? attendanceSummary.late
        : attendanceSummary?.late?.count || attendanceSummary?.lateCount || 0,
    total:
      attendanceSummary?.total ||
      attendanceSummary?.count ||
      (Array.isArray(attendanceRecords) ? attendanceRecords.length : 0),
  };

  const attendanceStats = [
    { label: "Present", value: attendanceData.present, color: "#047857" },
    { label: "Late", value: attendanceData.late, color: "#D9A147" },
    { label: "Absent", value: attendanceData.absent, color: "#DC2626" },
  ];
  const attendanceRate =
    attendanceData.total > 0
      ? Math.round((attendanceData.present / attendanceData.total) * 1000) / 10
      : 0;
  const meritItems = Array.isArray(merits) ? merits : [];
  const detailTabs = [
    { key: "attendance", label: "Attendance" },
    { key: "performance", label: "Performance" },
    { key: "awards", label: "Awards" },
  ];
  const calendarCells = useMemo(() => {
    const monthRecordMap = new Map();

    if (Array.isArray(attendanceRecords)) {
      attendanceRecords.forEach((record) => {
        const parsedDate = parseAttendanceDate(record);
        if (!parsedDate) return;
        if (
          parsedDate.getFullYear() !== calendarDate.getFullYear() ||
          parsedDate.getMonth() !== calendarDate.getMonth()
        ) {
          return;
        }

        const day = parsedDate.getDate();
        const status = getAttendanceStatus(record);
        if (status) {
          monthRecordMap.set(day, status);
        }
      });
    }

    const yearValue = calendarDate.getFullYear();
    const monthValue = calendarDate.getMonth();
    const firstDay = new Date(yearValue, monthValue, 1);
    const daysInMonth = new Date(yearValue, monthValue + 1, 0).getDate();
    const leadingEmptyDays = (firstDay.getDay() + 6) % 7;
    const cells = [];

    for (let index = 0; index < leadingEmptyDays; index += 1) {
      cells.push({ key: `empty-${index}`, type: "empty" });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({
        key: `day-${day}`,
        type: "day",
        day,
        status: monthRecordMap.get(day) || null,
      });
    }

    return cells;
  }, [attendanceRecords, calendarDate]);

  const goToPreviousMonth = () => {
    setCalendarDate(
      (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCalendarDate(
      (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1)
    );
  };

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.container}>
      {familyLoading ? (
        <LoadingSpinner label="Loading child details..." />
      ) : familyError ? (
        <View style={styles.stateWrapper}>
          <ErrorState
            title="Couldn't load child details"
            message="We couldn't fetch this child right now."
            onRetry={refetchFamily}
          />
        </View>
      ) : !selectedChild ? (
        <View style={styles.stateWrapper}>
          <EmptyState
            title="Child not found"
            message="We couldn't find the child you selected."
            icon="person-outline"
          />
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <View style={styles.screenHeader}>
              <TouchableOpacity
                accessibilityLabel="Go back"
                accessibilityRole="button"
                activeOpacity={0.85}
                onPress={() => router.back()}
                style={[
                  styles.headerIconButton,
                  {
                    backgroundColor: colors.surfaceSoft,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons color={colors.textStrong} name="chevron-back" size={22} />
              </TouchableOpacity>

              <Text style={[styles.screenHeaderTitle, { color: colors.textStrong }]}>
                {selectedChild.name} -{" "}
                {detailTabs.find((tab) => tab.key === activeDetailTab)?.label}
              </Text>

              <View
                style={[
                  styles.headerIconButton,
                  {
                    backgroundColor: colors.surfaceSoft,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons color={colors.textMuted} name="options-outline" size={20} />
              </View>
            </View>

            <View style={styles.tabRow}>
              {detailTabs.map((tab) => {
                const isActive = activeDetailTab === tab.key;

                return (
                  <TouchableOpacity
                    key={tab.key}
                    activeOpacity={0.85}
                    onPress={() => setActiveDetailTab(tab.key)}
                    style={[
                      styles.tabButton,
                      {
                        backgroundColor: isActive ? colors.gold : colors.surfaceSoft,
                        borderColor: isActive ? colors.gold : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabButtonText,
                        { color: isActive ? "#0B1220" : colors.textStrong },
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {activeDetailTab === "attendance" ? (
              attendanceLoading || attendanceRecordsLoading ? (
                <LoadingSpinner label="Loading attendance..." />
              ) : attendanceError || attendanceRecordsError ? (
                <ErrorState
                  title="Couldn't load attendance"
                  message="Try again to see attendance details."
                  onRetry={() => {
                    refetchAttendance();
                    refetchAttendanceRecords();
                  }}
                />
              ) : (
                <>
                  <View style={styles.statsRow}>
                    {attendanceStats.map((stat) => (
                      <View
                        key={stat.label}
                        style={[
                          styles.statsCard,
                          {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <Text style={[styles.statsLabel, { color: colors.textMuted }]}>
                          {stat.label}
                        </Text>
                        <Text style={[styles.statsValue, { color: stat.color }]}>
                          {stat.value}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View
                    style={[
                      styles.panel,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        shadowColor: colors.shadowColor,
                      },
                    ]}
                  >
                    <View style={styles.calendarHeader}>
                      <View>
                        <Text style={[styles.panelTitle, { color: colors.textStrong }]}>
                          {MONTH_OPTIONS.find((item) => item.value === attendanceMonth)?.label}{" "}
                          {attendanceYear}
                        </Text>
                        <Text style={[styles.panelSubtitle, { color: colors.textMuted }]}>
                          Attendance rate {attendanceRate}% across {attendanceData.total} classes
                        </Text>
                      </View>

                      <View style={styles.calendarActions}>
                        <TouchableOpacity
                          accessibilityLabel="Previous month"
                          activeOpacity={0.85}
                          onPress={goToPreviousMonth}
                          style={[
                            styles.calendarIconButton,
                            {
                              backgroundColor: colors.surfaceSoft,
                              borderColor: colors.border,
                            },
                          ]}
                        >
                          <Ionicons color={colors.textStrong} name="chevron-back" size={18} />
                        </TouchableOpacity>

                        <TouchableOpacity
                          accessibilityLabel="Next month"
                          activeOpacity={0.85}
                          onPress={goToNextMonth}
                          style={[
                            styles.calendarIconButton,
                            {
                              backgroundColor: colors.surfaceSoft,
                              borderColor: colors.border,
                            },
                          ]}
                        >
                          <Ionicons color={colors.textStrong} name="chevron-forward" size={18} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.weekdayRow}>
                      {WEEKDAY_LABELS.map((label, index) => (
                        <Text
                          key={`${label}-${index}`}
                          style={[styles.weekdayLabel, { color: colors.textMuted }]}
                        >
                          {label}
                        </Text>
                      ))}
                    </View>

                    <View style={styles.calendarGrid}>
                      {calendarCells.map((cell) => {
                        if (cell.type === "empty") {
                          return <View key={cell.key} style={styles.calendarCell} />;
                        }

                        const statusColors = {
                          present: {
                            backgroundColor: "#0C6A43",
                            textColor: "#FFFFFF",
                          },
                          late: {
                            backgroundColor: "#D9A147",
                            textColor: "#FFFFFF",
                          },
                          absent: {
                            backgroundColor: "#D9413A",
                            textColor: "#FFFFFF",
                          },
                        };
                        const activeStatus = cell.status ? statusColors[cell.status] : null;

                        return (
                          <View
                            key={cell.key}
                            style={[
                              styles.calendarCell,
                            ]}
                          >
                            <View
                              style={[
                                styles.calendarDayWrap,
                                {
                                  borderColor: colors.border,
                                  backgroundColor: activeStatus
                                    ? activeStatus.backgroundColor
                                    : colors.surfaceSoft,
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.calendarDayText,
                                  {
                                    color: activeStatus
                                      ? activeStatus.textColor
                                      : colors.textMuted,
                                  },
                                ]}
                              >
                                {cell.day}
                              </Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>

                    <View style={styles.legendRow}>
                      <View style={styles.legendItem}>
                        <View
                          style={[styles.legendDot, { backgroundColor: "#0C6A43" }]}
                        />
                        <Text style={[styles.legendText, { color: colors.textMuted }]}>
                          Present
                        </Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View
                          style={[styles.legendDot, { backgroundColor: "#D9A147" }]}
                        />
                        <Text style={[styles.legendText, { color: colors.textMuted }]}>
                          Late
                        </Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View
                          style={[styles.legendDot, { backgroundColor: "#D9413A" }]}
                        />
                        <Text style={[styles.legendText, { color: colors.textMuted }]}>
                          Absent
                        </Text>
                      </View>
                    </View>
                  </View>
                </>
              )
            ) : null}

            {activeDetailTab === "performance" ? (
              <View
                style={[
                  styles.panel,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    shadowColor: colors.shadowColor,
                  },
                ]}
              >
                <Text style={[styles.panelTitle, { color: colors.textStrong }]}>
                  Academic profile
                </Text>

                <View style={styles.kvList}>
                  <View style={styles.kvRow}>
                    <Text style={[styles.kvLabel, { color: colors.textMuted }]}>
                      Department
                    </Text>
                    <Text style={[styles.kvValue, { color: colors.textStrong }]}>
                      {selectedAcademicDisplay.departments.join(", ")}
                    </Text>
                  </View>
                  <View style={styles.kvRow}>
                    <Text style={[styles.kvLabel, { color: colors.textMuted }]}>
                      Class
                    </Text>
                    <Text style={[styles.kvValue, { color: colors.textStrong }]}>
                      {selectedAcademicDisplay.classes.join(", ")}
                    </Text>
                  </View>
                  <View style={styles.kvRow}>
                    <Text style={[styles.kvLabel, { color: colors.textMuted }]}>
                      Session
                    </Text>
                    <Text style={[styles.kvValue, { color: colors.textStrong }]}>
                      {selectedAcademicDisplay.sessions.join(", ")}
                    </Text>
                  </View>
                  <View style={styles.kvRow}>
                    <Text style={[styles.kvLabel, { color: colors.textMuted }]}>
                      Monthly fee
                    </Text>
                    <Text style={[styles.kvValue, { color: colors.textStrong }]}>
                      {formatCurrency(selectedChild.monthly_fee)}
                    </Text>
                  </View>
                </View>
              </View>
            ) : null}

            {activeDetailTab === "awards" ? (
              meritsLoading ? (
                <LoadingSpinner label="Loading awards..." />
              ) : meritsError ? (
                <ErrorState
                  title="Couldn't load awards"
                  message="Try again to see achievements details."
                  onRetry={refetchMerits}
                />
              ) : (
                <View
                  style={[
                    styles.panel,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      shadowColor: colors.shadowColor,
                    },
                  ]}
                >
                  <Text style={[styles.panelTitle, { color: colors.textStrong }]}>
                    Award history
                  </Text>

                  {meritItems.length > 0 ? (
                    meritItems.map((item, index) => (
                      <View
                        key={item?._id || `${item?.date || "award"}-${index}`}
                        style={[
                          styles.awardCard,
                          {
                            backgroundColor: colors.surfaceSoft,
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <View style={styles.awardHeader}>
                          <Text style={styles.awardEmoji}>🏆</Text>
                          <View style={styles.awardCopy}>
                            <Text style={[styles.awardTitle, { color: colors.textStrong }]}>
                              {item?.title || item?.reason || item?.type || "Achievement"}
                            </Text>
                            <Text style={[styles.awardDate, { color: colors.textMuted }]}>
                              {item?.date || item?.createdAt || "Recently"}
                            </Text>
                          </View>
                        </View>

                        {item?.description || item?.reason ? (
                          <Text
                            style={[styles.awardDescription, { color: colors.textMuted }]}
                          >
                            {item?.description || item?.reason}
                          </Text>
                        ) : null}
                      </View>
                    ))
                  ) : (
                    <EmptyState
                      title="No achievements yet"
                      message="Achievements will appear here when awarded."
                      icon="sparkles-outline"
                    />
                  )}
                </View>
              )
            ) : null}
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
  stateWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  section: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 16,
  },
  screenHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  screenHeaderTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: "700",
  },
  tabRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tabButton: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statsCard: {
    flex: 1,
    minHeight: 96,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  statsLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  statsValue: {
    marginTop: 10,
    fontSize: 32,
    fontWeight: "800",
  },
  panel: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 12,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 3,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  panelSubtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  calendarActions: {
    flexDirection: "row",
    gap: 8,
  },
  calendarIconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  weekdayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  weekdayLabel: {
    width: `${100 / 7}%`,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 8,
  },
  calendarCell: {
    width: `${100 / 7}%`,
    alignItems: "center",
  },
  calendarDayWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  calendarDayText: {
    fontSize: 15,
    fontWeight: "700",
  },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
    paddingTop: 6,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 13,
    fontWeight: "700",
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
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "right",
  },
  awardCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  awardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  awardEmoji: {
    fontSize: 22,
  },
  awardCopy: {
    flex: 1,
  },
  awardTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  awardDate: {
    marginTop: 3,
    fontSize: 12,
  },
  awardDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});
