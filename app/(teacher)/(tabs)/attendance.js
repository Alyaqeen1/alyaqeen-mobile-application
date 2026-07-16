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
import Toast from "react-native-toast-message";
import { useTheme } from "../../../contexts";
import useAuth from "../../../hooks/useAuth";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import EmptyState from "../../../components/common/EmptyState";
import ErrorState from "../../../components/common/ErrorState";
import {
  useAddAttendanceMutation,
  useDeleteAttendanceMutation,
  useGetFilteredAttendancesQuery,
  useUpdateAttendanceMutation,
} from "../../../redux/features/attendances/attendancesApi";
import { useGetTeacherByEmailQuery, useGetTeacherWithDetailsQuery } from "../../../redux/features/teachers/teachersApi";
import { useGetStudentsByGroupQuery } from "../../../redux/features/students/studentsApi";
import { useGetClassByParamsQuery } from "../../../redux/features/classes/classesApi";

const EMPTY_ATTENDANCE = [];
const STATUS_ORDER = ["present", "late", "absent"];
const STATUS_META = {
  present: { label: "Present", short: "P", color: "#0C6A43" },
  late: { label: "Late", short: "L", color: "#D9A147" },
  absent: { label: "Absent", short: "A", color: "#D9413A" },
};
const SESSION_LABELS = {
  weekdays: "Weekday",
  weekend: "Weekend",
};
const TIME_LABELS = {
  S1: "Early",
  S2: "Late",
  WM: "Morning",
  WA: "Afternoon",
};
const TIME_RANGE_LABELS = {
  S1: "4:30 PM - 6:00 PM",
  S2: "5:45 PM - 7:15 PM",
  WM: "10:00 AM - 12:30 PM",
  WA: "12:30 PM - 2:30 PM",
};

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatHeaderDate(date) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

function getInitials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) return "ST";
  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}

function normalizeAttendanceStatus(value) {
  const normalized = String(value || "").toLowerCase();

  if (normalized.includes("late")) return "late";
  if (normalized.includes("absent")) return "absent";
  if (normalized.includes("present")) return "present";
  return null;
}

function getAssignmentClassId(item) {
  return item?.class_id || item?._id || item?.classId || item?.class?._id || "";
}

function buildTeacherAssignments(teacherWithDetails) {
  const departmentsById = new Map(
    (teacherWithDetails?.departments_info || []).map((department) => [
      department._id,
      department.dept_name,
    ])
  );

  return (teacherWithDetails?.classes_info || [])
    .map((item, index) => {
      const classId = getAssignmentClassId(item);
      const deptId = item?.dept_id || item?.department_id || item?.dept?._id || "";
      const session = item?.session || item?.group_session || "";
      const sessionTime = item?.session_time || item?.time || "";
      const className =
        item?.class_name ||
        item?.className ||
        item?.class?.class_name ||
        "Class";
      const departmentName =
        departmentsById.get(deptId) || item?.department || item?.dept_name || "";

      return {
        key: `${deptId}-${classId}-${session}-${sessionTime}-${index}`,
        deptId,
        classId,
        session,
        sessionTime,
        className,
        title: `${SESSION_LABELS[session] || "Session"} ${TIME_LABELS[sessionTime] || ""} - ${className}`.trim(),
        subtitle: `${TIME_RANGE_LABELS[sessionTime] || "Time not set"}${departmentName ? ` - ${departmentName}` : ""}`,
      };
    })
    .filter(
      (item) => item.deptId && item.classId && item.session && item.sessionTime
    );
}

function buildAttendanceRecordMap(records) {
  const map = new Map();

  (records || []).forEach((record) => {
    const studentId =
      typeof record?.student_id === "string"
        ? record.student_id
        : record?.student_id?._id ||
          record?.studentId ||
          record?.student?._id ||
          record?.student?._id;
    const status = normalizeAttendanceStatus(
      record?.status || record?.attendanceStatus || record?.attendance
    );

    if (!studentId || !status) return;

    map.set(String(studentId), {
      id: record?._id || record?.id,
      status,
    });
  });

  return map;
}

function getEffectiveStatus(studentId, editedStatuses, attendanceRecordMap) {
  if (Object.prototype.hasOwnProperty.call(editedStatuses, studentId)) {
    return editedStatuses[studentId];
  }

  return attendanceRecordMap.get(String(studentId))?.status || null;
}

export default function TeacherAttendanceScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedAssignmentKey, setSelectedAssignmentKey] = useState("");
  const [editedStatuses, setEditedStatuses] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const { data: teacher, isLoading: teacherLoading } = useGetTeacherByEmailQuery(user?.email, {
    skip: !user?.email,
  });
  const {
    data: teacherWithDetails,
    isLoading: teacherDetailsLoading,
    isError: teacherDetailsError,
    refetch: refetchTeacherDetails,
  } = useGetTeacherWithDetailsQuery(teacher?._id, {
    skip: !teacher?._id,
  });

  const assignments = useMemo(
    () => buildTeacherAssignments(teacherWithDetails),
    [teacherWithDetails]
  );

  useEffect(() => {
    if (!assignments.length) {
      setSelectedAssignmentKey("");
      return;
    }

    const stillExists = assignments.some((item) => item.key === selectedAssignmentKey);
    if (!stillExists) {
      setSelectedAssignmentKey(assignments[0].key);
    }
  }, [assignments, selectedAssignmentKey]);

  const selectedAssignment =
    assignments.find((item) => item.key === selectedAssignmentKey) || null;

  const {
    data: selectedGroup,
    isLoading: groupLoading,
  } = useGetClassByParamsQuery(
    selectedAssignment
      ? {
          dept_id: selectedAssignment.deptId,
          class_id: selectedAssignment.classId,
          session: selectedAssignment.session,
          time: selectedAssignment.sessionTime,
        }
      : undefined,
    {
      skip: !selectedAssignment,
    }
  );

  const groupId = selectedGroup?._id;
  const {
    data: students = [],
    isLoading: studentsLoading,
    isError: studentsError,
    refetch: refetchStudents,
  } = useGetStudentsByGroupQuery(groupId, {
    skip: !groupId,
  });

  const selectedDateKey = useMemo(() => formatDateKey(selectedDate), [selectedDate]);
  const studentIds = useMemo(
    () => students.map((student) => student._id).filter(Boolean),
    [students]
  );

  const {
    data: filteredAttendanceData,
    isLoading: attendanceLoading,
    isError: attendanceError,
    refetch: refetchAttendance,
  } = useGetFilteredAttendancesQuery(
    groupId && studentIds.length > 0
      ? {
          studentIds: studentIds.join(","),
          startDate: selectedDateKey,
          endDate: selectedDateKey,
          classId: selectedAssignment?.classId,
        }
      : undefined,
    {
      skip: !groupId || studentIds.length === 0,
      refetchOnMountOrArgChange: true,
    }
  );

  const [addAttendance] = useAddAttendanceMutation();
  const [updateAttendance] = useUpdateAttendanceMutation();
  const [deleteAttendance] = useDeleteAttendanceMutation();
  const attendanceRecords = filteredAttendanceData?.attendance || EMPTY_ATTENDANCE;

  const attendanceRecordMap = useMemo(
    () => buildAttendanceRecordMap(attendanceRecords),
    [attendanceRecords]
  );

  useEffect(() => {
    setEditedStatuses((current) =>
      Object.keys(current).length > 0 ? {} : current
    );
  }, [selectedAssignmentKey, selectedDateKey, attendanceRecords]);

  const effectiveStatusCounts = useMemo(() => {
    const counts = { present: 0, late: 0, absent: 0 };

    students.forEach((student) => {
      const status = getEffectiveStatus(student._id, editedStatuses, attendanceRecordMap);
      if (status && counts[status] !== undefined) {
        counts[status] += 1;
      }
    });

    return counts;
  }, [students, editedStatuses, attendanceRecordMap]);

  const hasPendingChanges = useMemo(
    () =>
      Object.keys(editedStatuses).some((studentId) => {
        const original = attendanceRecordMap.get(String(studentId))?.status || null;
        return editedStatuses[studentId] !== original;
      }),
    [editedStatuses, attendanceRecordMap]
  );

  const handleSetStatus = (studentId, status) => {
    const currentStatus = getEffectiveStatus(studentId, editedStatuses, attendanceRecordMap);
    const nextStatus = currentStatus === status ? null : status;

    setEditedStatuses((prev) => ({
      ...prev,
      [studentId]: nextStatus,
    }));
  };

  const handleSave = async () => {
    if (!groupId || !selectedAssignment) {
      Toast.show({
        type: "error",
        text1: "Select a group first",
        text2: "Choose a teacher group before saving attendance.",
      });
      return;
    }

    const changes = Object.entries(editedStatuses).filter(([studentId, nextStatus]) => {
      const original = attendanceRecordMap.get(String(studentId))?.status || null;
      return nextStatus !== original;
    });

    if (changes.length === 0) {
      Toast.show({
        type: "info",
        text1: "No changes to save",
      });
      return;
    }

    setIsSaving(true);

    try {
      await Promise.all(
        changes.map(async ([studentId, nextStatus]) => {
          const existingRecord = attendanceRecordMap.get(String(studentId));

          if (existingRecord?.id) {
            if (nextStatus) {
              await updateAttendance({
                id: existingRecord.id,
                status: nextStatus,
              }).unwrap();
            } else {
              await deleteAttendance(existingRecord.id).unwrap();
            }
            return;
          }

          if (nextStatus) {
            await addAttendance({
              class_id: groupId,
              student_id: studentId,
              date: selectedDateKey,
              status: nextStatus,
              attendance: "student",
            }).unwrap();
          }
        })
      );

      setEditedStatuses({});
      refetchAttendance();
      Toast.show({
        type: "success",
        text1: "Attendance saved",
        text2: "The attendance sheet has been updated.",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Save failed",
        text2: error?.data?.message || "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const moveDate = (days) => {
    setSelectedDate((current) => {
      const next = new Date(current);
      next.setDate(next.getDate() + days);
      return next;
    });
  };

  if (teacherLoading || teacherDetailsLoading) {
    return (
      <SafeAreaView edges={["left", "right"]} style={styles.container}>
        <LoadingSpinner label="Loading attendance..." />
      </SafeAreaView>
    );
  }

  if (teacherDetailsError) {
    return (
      <SafeAreaView edges={["left", "right"]} style={styles.container}>
        <View style={styles.stateWrapper}>
          <ErrorState
            title="Couldn't load teacher groups"
            message="Please try again to load your attendance groups."
            onRetry={refetchTeacherDetails}
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
        <View style={styles.topRow}>
          <View style={styles.topLeft}>
            <Text style={[styles.title, { color: colors.textStrong }]}>Attendance</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              {formatHeaderDate(selectedDate)} -{" "}
              {selectedAssignment?.subtitle?.split(" - ")[0] || "Select a group"}
            </Text>
          </View>

          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.85}
            disabled={!hasPendingChanges || isSaving}
            onPress={handleSave}
          >
            <Text
              style={[
                styles.saveText,
                {
                  color:
                    hasPendingChanges && !isSaving ? colors.gold : colors.textSubtle,
                },
              ]}
            >
              {isSaving ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.groupCard,
            {
              backgroundColor: "#0C6A43",
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.groupCardHeader}>
            <Text style={styles.groupLabel}>GROUP</Text>
            <Ionicons color="#FFFFFF" name="chevron-down" size={20} />
          </View>
          <Text style={styles.groupTitle}>
            {selectedAssignment?.title || "Choose a group"}
          </Text>
          <Text style={styles.groupSubtitle}>
            {selectedAssignment?.subtitle || "Your assigned groups will appear here"}
          </Text>
        </View>

        {assignments.length > 1 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.assignmentRow}
          >
            {assignments.map((assignment) => {
              const isActive = assignment.key === selectedAssignmentKey;

              return (
                <TouchableOpacity
                  key={assignment.key}
                  activeOpacity={0.85}
                  onPress={() => setSelectedAssignmentKey(assignment.key)}
                  style={[
                    styles.assignmentChip,
                    {
                      backgroundColor: isActive ? colors.gold : colors.surfaceSoft,
                      borderColor: isActive ? colors.gold : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.assignmentChipText,
                      {
                        color: isActive ? "#0B1220" : colors.textStrong,
                      },
                    ]}
                  >
                    {assignment.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : null}

        <View style={styles.dateNavRow}>
          <TouchableOpacity
            accessibilityLabel="Previous day"
            activeOpacity={0.85}
            onPress={() => moveDate(-1)}
            style={[
              styles.iconButton,
              {
                backgroundColor: colors.surfaceSoft,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons color={colors.textStrong} name="chevron-back" size={18} />
          </TouchableOpacity>

          <Text style={[styles.dateNavText, { color: colors.textStrong }]}>
            {formatHeaderDate(selectedDate)}
          </Text>

          <TouchableOpacity
            accessibilityLabel="Next day"
            activeOpacity={0.85}
            onPress={() => moveDate(1)}
            style={[
              styles.iconButton,
              {
                backgroundColor: colors.surfaceSoft,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons color={colors.textStrong} name="chevron-forward" size={18} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          {STATUS_ORDER.map((statusKey) => (
            <View
              key={statusKey}
              style={[
                styles.statsCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.statsLabel, { color: colors.textMuted }]}>
                {STATUS_META[statusKey].label}
              </Text>
              <Text
                style={[
                  styles.statsValue,
                  { color: STATUS_META[statusKey].color },
                ]}
              >
                {effectiveStatusCounts[statusKey]}
              </Text>
            </View>
          ))}
        </View>

        {groupLoading || studentsLoading || attendanceLoading ? (
          <LoadingSpinner label="Loading group attendance..." />
        ) : studentsError || attendanceError ? (
          <ErrorState
            title="Couldn't load attendance sheet"
            message="Please try again to load the selected group."
            onRetry={() => {
              refetchStudents();
              refetchAttendance();
            }}
          />
        ) : !selectedAssignment ? (
          <EmptyState
            title="No teacher groups found"
            message="Assign a teacher group to start taking attendance."
            icon="school-outline"
          />
        ) : students.length === 0 ? (
          <EmptyState
            title="No students in this group"
            message="Students assigned to the selected group will appear here."
            icon="people-outline"
          />
        ) : (
          <View style={styles.studentList}>
            {students.map((student) => {
              const currentStatus = getEffectiveStatus(
                student._id,
                editedStatuses,
                attendanceRecordMap
              );

              return (
                <View
                  key={student._id}
                  style={[
                    styles.studentCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      shadowColor: colors.shadowColor,
                    },
                  ]}
                >
                  <View style={styles.studentLeft}>
                    <View
                      style={[
                        styles.initialsBubble,
                        { backgroundColor: colors.surfaceSoft },
                      ]}
                    >
                      <Text style={[styles.initialsText, { color: colors.textStrong }]}>
                        {getInitials(student.name)}
                      </Text>
                    </View>

                    <Text style={[styles.studentName, { color: colors.textStrong }]}>
                      {student.name}
                    </Text>
                  </View>

                  <View style={styles.statusOptions}>
                    {STATUS_ORDER.map((statusKey) => {
                      const isActive = currentStatus === statusKey;

                      return (
                        <TouchableOpacity
                          key={statusKey}
                          activeOpacity={0.85}
                          onPress={() => handleSetStatus(student._id, statusKey)}
                          style={[
                            styles.statusButton,
                            {
                              backgroundColor: isActive
                                ? STATUS_META[statusKey].color
                                : colors.surfaceSoft,
                              borderColor: isActive
                                ? STATUS_META[statusKey].color
                                : colors.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusButtonText,
                              {
                                color: isActive ? "#FFFFFF" : colors.textMuted,
                              },
                            ]}
                          >
                            {STATUS_META[statusKey].short}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}
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
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  topLeft: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "700",
  },
  groupCard: {
    marginTop: 18,
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
  },
  groupCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  groupLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  groupTitle: {
    marginTop: 8,
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
  },
  groupSubtitle: {
    marginTop: 6,
    color: "rgba(255,255,255,0.82)",
    fontSize: 14,
  },
  assignmentRow: {
    paddingTop: 12,
    gap: 10,
  },
  assignmentChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  assignmentChipText: {
    fontSize: 13,
    fontWeight: "700",
  },
  dateNavRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dateNavText: {
    fontSize: 16,
    fontWeight: "700",
  },
  statsRow: {
    marginTop: 18,
    flexDirection: "row",
    gap: 12,
  },
  statsCard: {
    flex: 1,
    minHeight: 102,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  statsLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  statsValue: {
    marginTop: 10,
    fontSize: 36,
    fontWeight: "800",
  },
  studentList: {
    marginTop: 18,
    gap: 12,
  },
  studentCard: {
    borderRadius: 26,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  studentLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginRight: 10,
  },
  initialsBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  initialsText: {
    fontSize: 14,
    fontWeight: "800",
  },
  studentName: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
  },
  statusOptions: {
    flexDirection: "row",
    gap: 8,
  },
  statusButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statusButtonText: {
    fontSize: 13,
    fontWeight: "800",
  },
});
