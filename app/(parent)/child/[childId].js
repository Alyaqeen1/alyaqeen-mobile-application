import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
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
import { useGetStudentYearlyReportsQuery } from "../../../redux/features/yearly_reports/yearly_reportsApi";

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

function formatDate(dateString) {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "N/A";
  }
}

function getSubjectDisplayName(key) {
  const names = {
    qaidah_quran: "Quran / Qaidah",
    islamic_studies: "Islamic Studies",
    dua_surah: "Dua / Surah",
    gift_for_muslim: "Gift for Muslim",
  };
  return names[key] || key.replace(/_/g, " ").toUpperCase();
}

function getSubjectIcon(key) {
  const icons = {
    qaidah_quran: "📖",
    islamic_studies: "🕌",
    dua_surah: "✨",
    gift_for_muslim: "🎁",
  };
  return icons[key] || "📚";
}

function getSubjectColor(key) {
  const colors = {
    qaidah_quran: "#3498db",
    islamic_studies: "#27ae60",
    dua_surah: "#8e44ad",
    gift_for_muslim: "#e67e22",
  };
  return colors[key] || "#666";
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

  // ===== Fetch yearly reports for the child =====
  const {
    data: yearlyReports = [],
    isLoading: reportsLoading,
    isError: reportsError,
    refetch: refetchReports,
  } = useGetStudentYearlyReportsQuery(
    {
      studentId: selectedChild?._id,
    },
    {
      skip: !selectedChild?._id || activeDetailTab !== "performance",
      refetchOnMountOrArgChange: true,
    }
  );

  // Filter only published reports
  const publishedReports = yearlyReports.filter(
    (report) => report.is_published === true
  );

  // ===== HELPER: extract start-year from any report type =====
  const getReportYear = (report) => {
    if (report.report_type === "term_progress") {
      return Number(report.year);
    }
    if (report.academic_year) {
      return Number(String(report.academic_year).split("-")[0]);
    }
    return null;
  };

  // ===== HELPER: display label for a start-year =====
  const getYearLabel = (startYear) => {
    const y = Number(startYear);
    return `${y}-${y + 1}`;
  };

  // Group by start year (works for yearly + term progress)
  const groupedReports = publishedReports.reduce((acc, report) => {
    const startYear = getReportYear(report);
    if (!startYear) return acc;

    const key = String(startYear);

    if (!acc[key]) {
      acc[key] = {
        year: startYear,
        academic_year: getYearLabel(startYear),
        beginning: null,
        ending: null,
        terms: { autumn: null, spring: null, summer: null },
        type: report.type,
        notes: [],
      };
    }

    if (report.notes && report.notes.length > 0) {
      acc[key].notes = [...acc[key].notes, ...report.notes];
    }

    if (report.report_type === "beginning_of_year") {
      acc[key].beginning = report;
    } else if (report.report_type === "end_of_year") {
      acc[key].ending = report;
    } else if (report.report_type === "term_progress") {
      acc[key].terms[report.term] = report;
    }

    if (!acc[key].type && report.type) {
      acc[key].type = report.type;
    }

    return acc;
  }, {});

  // Sort newest year first
  const groupedReportsArray = Object.values(groupedReports).sort(
    (a, b) => b.year - a.year
  );

  // ===== Render notes =====
  const renderNotes = (notes) => {
    if (!notes || notes.length === 0) return null;

    return (
      <View style={styles.notesContainer}>
        <Text style={[styles.notesTitle, { color: colors.textStrong }]}>
          📝 Notes ({notes.length})
        </Text>
        {notes.slice(0, 3).map((note, idx) => (
          <View
            key={note.id || idx}
            style={[
              styles.noteItem,
              {
                backgroundColor: colors.surfaceSoft,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.noteText, { color: colors.textStrong }]}>
              {note.text}
            </Text>
            <Text style={[styles.noteDate, { color: colors.textMuted }]}>
              {formatDate(note.date)}
            </Text>
          </View>
        ))}
        {notes.length > 3 && (
          <Text style={[styles.notesMore, { color: colors.textMuted }]}>
            +{notes.length - 3} more notes
          </Text>
        )}
      </View>
    );
  };

  // ===== Render term progress cards =====
  const renderTermProgress = (terms) => {
    const termOrder = ["autumn", "spring", "summer"];
    const termLabels = {
      autumn: "📅 Autumn Term",
      spring: "📅 Spring Term",
      summer: "📅 Summer Term",
    };
    const termColors = {
      autumn: "#f39c12",
      spring: "#27ae60",
      summer: "#2980b9",
    };

    return termOrder.map((termKey) => {
      const termData = terms[termKey];
      if (!termData) return null;

      const s = termData.subjects || {};
      const isGfm = termData.is_gfm;

      const subjectRows = [];

      if (s.qaida_quran_tajweed) {
        const d = s.qaida_quran_tajweed;
        if (d.beginning || d.end || d.total_learning) {
          subjectRows.push({
            label: d.title || "Qaida / Qur'an / Tajweed",
            beginning: d.beginning || "—",
            end: d.end || "—",
            summary: d.total_learning || "—",
          });
        }
      }

      if (!isGfm && s.duas_surahs) {
        const d = s.duas_surahs;
        if (d.beginning || d.end || d.total_learning) {
          subjectRows.push({
            label: "Duas & Surahs",
            beginning: d.beginning || "—",
            end: d.end || "—",
            summary: d.total_learning || "—",
          });
        }
      }

      if (s.islamic_studies) {
        const d = s.islamic_studies;
        if (d.beginning || d.end || d.total_learning) {
          subjectRows.push({
            label: "Islamic Studies",
            beginning: d.beginning || "—",
            end: d.end || "—",
            summary: d.total_learning || "—",
          });
        }
      }

      if (subjectRows.length === 0) return null;

      return (
        <View
          key={termKey}
          style={[
            styles.termCard,
            {
              backgroundColor: colors.surfaceSoft,
              borderColor: colors.border,
              borderLeftColor: termColors[termKey],
            },
          ]}
        >
          <View style={styles.termHeader}>
            <Text style={[styles.termTitle, { color: colors.textStrong }]}>
              {termLabels[termKey]}
            </Text>
            {isGfm && (
              <View style={[styles.gfmBadge, { backgroundColor: "#f39c12" }]}>
                <Text style={styles.gfmBadgeText}>GFM</Text>
              </View>
            )}
          </View>

          {subjectRows.map((row, idx) => (
            <View
              key={idx}
              style={[
                styles.termSubject,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={[styles.termSubjectLabel, { color: colors.textStrong }]}
              >
                {row.label}
              </Text>

              <View style={styles.termRow}>
                <Text style={[styles.termRowLabel, { color: colors.textMuted }]}>
                  Beginning:
                </Text>
                <Text style={[styles.termRowValue, { color: colors.textStrong }]}>
                  {row.beginning}
                </Text>
              </View>

              <View style={styles.termRow}>
                <Text style={[styles.termRowLabel, { color: colors.textMuted }]}>
                  End:
                </Text>
                <Text style={[styles.termRowValue, { color: colors.textStrong }]}>
                  {row.end}
                </Text>
              </View>

              <View style={styles.termRow}>
                <Text style={[styles.termRowLabel, { color: colors.textMuted }]}>
                  Summary:
                </Text>
                <Text style={[styles.termRowValue, { color: colors.textStrong }]}>
                  {row.summary}
                </Text>
              </View>
            </View>
          ))}
        </View>
      );
    });
  };

  // ===== Render a single year report =====
  const renderYearReport = (yearData) => {
    const hasBeginning = !!yearData.beginning;
    const hasEnding = !!yearData.ending;
    const hasTerms = Object.values(yearData.terms || {}).some(Boolean);
    const type = yearData.type || "normal";

    const getSubjectKeys = () => {
      const keys =
        type === "gift_muslim"
          ? ["qaidah_quran", "gift_for_muslim"]
          : ["qaidah_quran", "islamic_studies", "dua_surah"];
      return keys;
    };

    const subjectKeys = getSubjectKeys();

    return (
      <View
        key={yearData.academic_year}
        style={[
          styles.yearCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: colors.shadowColor,
          },
        ]}
      >
        <Text style={[styles.yearTitle, { color: colors.textStrong }]}>
          📅 {yearData.academic_year}
        </Text>

        {/* Empty state */}
        {!hasBeginning && !hasEnding && !hasTerms && (
          <Text style={[styles.noDataText, { color: colors.textMuted }]}>
            No reports available for this year
          </Text>
        )}

        {/* ===== Yearly comparison (beginning/end) ===== */}
        {(hasBeginning || hasEnding) &&
          subjectKeys.map((subjectKey) => {
            const beginSubject = yearData.beginning?.lessons?.[subjectKey];
            const endSubject = yearData.ending?.lessons?.[subjectKey];

            if (!beginSubject && !endSubject) return null;

            const getFieldData = () => {
              const fields = [];

              if (subjectKey === "qaidah_quran") {
                const qBegin = beginSubject;
                const qEnd = endSubject;

                if (
                  qBegin &&
                  (qBegin.selected === "quran" || qBegin.selected === "hifz")
                ) {
                  fields.push(
                    {
                      label: "Para",
                      beginValue: qBegin.data?.para || "N/A",
                      endValue: qEnd?.data?.para || "N/A",
                    },
                    {
                      label: "Page",
                      beginValue: qBegin.data?.page || "N/A",
                      endValue: qEnd?.data?.page || "N/A",
                    },
                    {
                      label: "Line",
                      beginValue: qBegin.data?.line || "N/A",
                      endValue: qEnd?.data?.line || "N/A",
                    }
                  );
                } else {
                  fields.push(
                    {
                      label: "Level",
                      beginValue: qBegin?.data?.level || "N/A",
                      endValue: qEnd?.data?.level || "N/A",
                    },
                    {
                      label: "Lesson",
                      beginValue: qBegin?.data?.lesson_name || "N/A",
                      endValue: qEnd?.data?.lesson_name || "N/A",
                    },
                    {
                      label: "Page",
                      beginValue: qBegin?.data?.page || "N/A",
                      endValue: qEnd?.data?.page || "N/A",
                    },
                    {
                      label: "Line",
                      beginValue: qBegin?.data?.line || "N/A",
                      endValue: qEnd?.data?.line || "N/A",
                    }
                  );
                }
              } else if (subjectKey === "islamic_studies") {
                const isBegin = beginSubject;
                const isEnd = endSubject;
                fields.push(
                  {
                    label: "Book",
                    beginValue: isBegin?.book || "N/A",
                    endValue: isEnd?.book || "N/A",
                  },
                  {
                    label: "Page",
                    beginValue: isBegin?.page || "N/A",
                    endValue: isEnd?.page || "N/A",
                  },
                  {
                    label: "Lesson",
                    beginValue: isBegin?.lesson_name || "N/A",
                    endValue: isEnd?.lesson_name || "N/A",
                  }
                );
              } else if (subjectKey === "dua_surah") {
                const dsBegin = beginSubject;
                const dsEnd = endSubject;
                fields.push(
                  {
                    label: "Book",
                    beginValue: dsBegin?.book || "N/A",
                    endValue: dsEnd?.book || "N/A",
                  },
                  {
                    label: "Level",
                    beginValue: dsBegin?.level || "N/A",
                    endValue: dsEnd?.level || "N/A",
                  },
                  {
                    label: "Page",
                    beginValue: dsBegin?.page || "N/A",
                    endValue: dsEnd?.page || "N/A",
                  },
                  {
                    label: "Target",
                    beginValue: dsBegin?.target || "N/A",
                    endValue: dsEnd?.target || "N/A",
                  },
                  {
                    label: "Dua #",
                    beginValue: dsBegin?.dua_number || "N/A",
                    endValue: dsEnd?.dua_number || "N/A",
                  },
                  {
                    label: "Lesson",
                    beginValue: dsBegin?.lesson_name || "N/A",
                    endValue: dsEnd?.lesson_name || "N/A",
                  }
                );
              } else if (subjectKey === "gift_for_muslim") {
                const gmBegin = beginSubject;
                const gmEnd = endSubject;
                fields.push(
                  {
                    label: "Level",
                    beginValue: gmBegin?.level || "N/A",
                    endValue: gmEnd?.level || "N/A",
                  },
                  {
                    label: "Lesson",
                    beginValue: gmBegin?.lesson_name || "N/A",
                    endValue: gmEnd?.lesson_name || "N/A",
                  },
                  {
                    label: "Page",
                    beginValue: gmBegin?.page || "N/A",
                    endValue: gmEnd?.page || "N/A",
                  },
                  {
                    label: "Target",
                    beginValue: gmBegin?.target || "N/A",
                    endValue: gmEnd?.target || "N/A",
                  }
                );
              }

              return fields;
            };

            const subjectFields = getFieldData();
            if (subjectFields.length === 0) return null;

            return (
              <View
                key={subjectKey}
                style={[
                  styles.subjectComparisonCard,
                  {
                    backgroundColor: colors.surfaceSoft,
                    borderColor: colors.border,
                    borderLeftColor: getSubjectColor(subjectKey),
                  },
                ]}
              >
                <View style={styles.subjectHeader}>
                  <Text style={styles.subjectIcon}>
                    {getSubjectIcon(subjectKey)}
                  </Text>
                  <Text
                    style={[styles.subjectTitle, { color: colors.textStrong }]}
                  >
                    {getSubjectDisplayName(subjectKey)}
                  </Text>
                </View>

                <View style={styles.comparisonTable}>
                  <View style={styles.comparisonHeader}>
                    <Text
                      style={[
                        styles.comparisonHeaderText,
                        { color: colors.textMuted },
                      ]}
                    >
                      Subject
                    </Text>
                    <Text
                      style={[
                        styles.comparisonHeaderText,
                        { color: colors.textMuted },
                      ]}
                    >
                      Beginning
                    </Text>
                    <Text
                      style={[
                        styles.comparisonHeaderText,
                        { color: colors.textMuted },
                      ]}
                    >
                      →
                    </Text>
                    <Text
                      style={[
                        styles.comparisonHeaderText,
                        { color: colors.textMuted },
                      ]}
                    >
                      End
                    </Text>
                  </View>

                  {subjectFields.map((field, idx) => {
                    const hasBegin =
                      field.beginValue && field.beginValue !== "N/A";
                    const hasEnd = field.endValue && field.endValue !== "N/A";

                    if (!hasBegin && !hasEnd) return null;

                    return (
                      <View
                        key={idx}
                        style={[
                          styles.comparisonRow,
                          idx % 2 === 0 && {
                            backgroundColor: "rgba(0,0,0,0.03)",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.comparisonLabel,
                            { color: colors.textMuted },
                          ]}
                        >
                          {field.label}:
                        </Text>
                        <Text
                          style={[
                            styles.comparisonValue,
                            {
                              color: hasBegin
                                ? colors.textStrong
                                : colors.textMuted,
                            },
                          ]}
                        >
                          {field.beginValue || "N/A"}
                        </Text>
                        <Text
                          style={[
                            styles.comparisonArrow,
                            { color: colors.textMuted },
                          ]}
                        >
                          →
                        </Text>
                        <Text
                          style={[
                            styles.comparisonValue,
                            {
                              color: hasEnd
                                ? colors.textStrong
                                : colors.textMuted,
                            },
                          ]}
                        >
                          {field.endValue || "N/A"}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                <View style={styles.statusBadges}>
                  {hasBeginning && (
                    <View
                      style={[styles.statusBadge, { backgroundColor: "#3498db" }]}
                    >
                      <Text style={styles.statusBadgeText}>📘 Beginning</Text>
                    </View>
                  )}
                  {hasEnding && (
                    <View
                      style={[styles.statusBadge, { backgroundColor: "#e67e22" }]}
                    >
                      <Text style={styles.statusBadgeText}>📗 End</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}

        {/* ===== Term progress section ===== */}
        {hasTerms && (
          <View style={styles.termSection}>
            <Text
              style={[styles.termSectionTitle, { color: colors.textStrong }]}
            >
              📅 Term Progress
            </Text>
            {renderTermProgress(yearData.terms)}
          </View>
        )}

        {/* Notes */}
        {renderNotes(yearData.notes)}
      </View>
    );
  };

  const attendanceData = {
    present:
      typeof attendanceSummary?.present === "number"
        ? attendanceSummary.present
        : attendanceSummary?.present?.count ||
          attendanceSummary?.presentCount ||
          0,
    absent:
      typeof attendanceSummary?.absent === "number"
        ? attendanceSummary.absent
        : attendanceSummary?.absent?.count ||
          attendanceSummary?.absentCount ||
          0,
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

  const hasPublishedReports = groupedReportsArray.length > 0;

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
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
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
                <Ionicons
                  color={colors.textStrong}
                  name="chevron-back"
                  size={22}
                />
              </TouchableOpacity>

              <Text
                style={[styles.screenHeaderTitle, { color: colors.textStrong }]}
              >
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
                <Ionicons
                  color={colors.textMuted}
                  name="options-outline"
                  size={20}
                />
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
                        backgroundColor: isActive
                          ? colors.gold
                          : colors.surfaceSoft,
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
                        <Text
                          style={[
                            styles.statsLabel,
                            { color: colors.textMuted },
                          ]}
                        >
                          {stat.label}
                        </Text>
                        <Text
                          style={[styles.statsValue, { color: stat.color }]}
                        >
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
                        <Text
                          style={[
                            styles.panelTitle,
                            { color: colors.textStrong },
                          ]}
                        >
                          {
                            MONTH_OPTIONS.find(
                              (item) => item.value === attendanceMonth
                            )?.label
                          }{" "}
                          {attendanceYear}
                        </Text>
                        <Text
                          style={[
                            styles.panelSubtitle,
                            { color: colors.textMuted },
                          ]}
                        >
                          Attendance rate {attendanceRate}% across{" "}
                          {attendanceData.total} classes
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
                          <Ionicons
                            color={colors.textStrong}
                            name="chevron-back"
                            size={18}
                          />
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
                          <Ionicons
                            color={colors.textStrong}
                            name="chevron-forward"
                            size={18}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.weekdayRow}>
                      {WEEKDAY_LABELS.map((label, index) => (
                        <Text
                          key={`${label}-${index}`}
                          style={[
                            styles.weekdayLabel,
                            { color: colors.textMuted },
                          ]}
                        >
                          {label}
                        </Text>
                      ))}
                    </View>

                    <View style={styles.calendarGrid}>
                      {calendarCells.map((cell) => {
                        if (cell.type === "empty") {
                          return (
                            <View
                              key={cell.key}
                              style={styles.calendarCell}
                            />
                          );
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
                        const activeStatus = cell.status
                          ? statusColors[cell.status]
                          : null;

                        return (
                          <View key={cell.key} style={[styles.calendarCell]}>
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
                          style={[
                            styles.legendDot,
                            { backgroundColor: "#0C6A43" },
                          ]}
                        />
                        <Text
                          style={[
                            styles.legendText,
                            { color: colors.textMuted },
                          ]}
                        >
                          Present
                        </Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View
                          style={[
                            styles.legendDot,
                            { backgroundColor: "#D9A147" },
                          ]}
                        />
                        <Text
                          style={[
                            styles.legendText,
                            { color: colors.textMuted },
                          ]}
                        >
                          Late
                        </Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View
                          style={[
                            styles.legendDot,
                            { backgroundColor: "#D9413A" },
                          ]}
                        />
                        <Text
                          style={[
                            styles.legendText,
                            { color: colors.textMuted },
                          ]}
                        >
                          Absent
                        </Text>
                      </View>
                    </View>
                  </View>
                </>
              )
            ) : null}

            {activeDetailTab === "performance" ? (
              reportsLoading ? (
                <LoadingSpinner label="Loading reports..." />
              ) : reportsError ? (
                <ErrorState
                  title="Couldn't load reports"
                  message="Try again to see performance details."
                  onRetry={refetchReports}
                />
              ) : (
                <>
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
                    <Text
                      style={[styles.panelTitle, { color: colors.textStrong }]}
                    >
                      Academic profile
                    </Text>

                    <View style={styles.kvList}>
                      <View style={styles.kvRow}>
                        <Text
                          style={[styles.kvLabel, { color: colors.textMuted }]}
                        >
                          Department
                        </Text>
                        <Text
                          style={[styles.kvValue, { color: colors.textStrong }]}
                        >
                          {selectedAcademicDisplay.departments.join(", ")}
                        </Text>
                      </View>
                      <View style={styles.kvRow}>
                        <Text
                          style={[styles.kvLabel, { color: colors.textMuted }]}
                        >
                          Class
                        </Text>
                        <Text
                          style={[styles.kvValue, { color: colors.textStrong }]}
                        >
                          {selectedAcademicDisplay.classes.join(", ")}
                        </Text>
                      </View>
                      <View style={styles.kvRow}>
                        <Text
                          style={[styles.kvLabel, { color: colors.textMuted }]}
                        >
                          Session
                        </Text>
                        <Text
                          style={[styles.kvValue, { color: colors.textStrong }]}
                        >
                          {selectedAcademicDisplay.sessions.join(", ")}
                        </Text>
                      </View>
                      <View style={styles.kvRow}>
                        <Text
                          style={[styles.kvLabel, { color: colors.textMuted }]}
                        >
                          Monthly fee
                        </Text>
                        <Text
                          style={[styles.kvValue, { color: colors.textStrong }]}
                        >
                          {formatCurrency(selectedChild.monthly_fee)}
                        </Text>
                      </View>
                    </View>
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
                    <Text
                      style={[styles.panelTitle, { color: colors.textStrong }]}
                    >
                      📊 Progress Reports
                    </Text>

                    {hasPublishedReports ? (
                      groupedReportsArray.map((yearData) =>
                        renderYearReport(yearData)
                      )
                    ) : (
                      <EmptyState
                        title="No published reports"
                        message="Progress reports will appear here once published by the teacher."
                        icon="document-text-outline"
                      />
                    )}
                  </View>
                </>
              )
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
                  <Text
                    style={[styles.panelTitle, { color: colors.textStrong }]}
                  >
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
                            <Text
                              style={[
                                styles.awardTitle,
                                { color: colors.textStrong },
                              ]}
                            >
                              {item?.title ||
                                item?.reason ||
                                item?.type ||
                                "Achievement"}
                            </Text>
                            <Text
                              style={[
                                styles.awardDate,
                                { color: colors.textMuted },
                              ]}
                            >
                              {item?.date || item?.createdAt || "Recently"}
                            </Text>
                          </View>
                        </View>

                        {item?.description || item?.reason ? (
                          <Text
                            style={[
                              styles.awardDescription,
                              { color: colors.textMuted },
                            ]}
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

  // ===== YEARLY REPORTS STYLES =====
  yearCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    gap: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  yearTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  subjectComparisonCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 4,
  },
  subjectHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  subjectIcon: {
    fontSize: 16,
  },
  subjectTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  comparisonTable: {
    marginTop: 4,
  },
  comparisonHeader: {
    flexDirection: "row",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginBottom: 4,
  },
  comparisonHeaderText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    flex: 1,
    textAlign: "center",
  },
  comparisonRow: {
    flexDirection: "row",
    paddingVertical: 4,
    borderRadius: 4,
  },
  comparisonLabel: {
    fontSize: 12,
    flex: 1.2,
    paddingLeft: 4,
  },
  comparisonValue: {
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
    textAlign: "center",
  },
  comparisonArrow: {
    fontSize: 12,
    width: 30,
    textAlign: "center",
  },
  statusBadges: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  noDataText: {
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 8,
  },

  // ===== TERM PROGRESS STYLES (NEW) =====
  termSection: {
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  termSectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  termCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 4,
    gap: 8,
  },
  termHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  termTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  gfmBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  gfmBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  termSubject: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
    gap: 3,
  },
  termSubjectLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 3,
  },
  termRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  termRowLabel: {
    fontSize: 11,
    minWidth: 62,
  },
  termRowValue: {
    flex: 1,
    fontSize: 11,
    fontWeight: "500",
  },

  // ===== NOTES STYLES =====
  notesContainer: {
    marginTop: 6,
    gap: 6,
  },
  notesTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 2,
  },
  noteItem: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    gap: 2,
  },
  noteText: {
    fontSize: 13,
  },
  noteDate: {
    fontSize: 11,
  },
  notesMore: {
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "center",
  },
});