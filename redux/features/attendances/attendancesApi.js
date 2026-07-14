import { apiSlice } from "../../api/apiSlice";

export const attendancesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // ⚠️ PARTIAL - Keep for Admin only (view all attendance records)
    getAttendances: builder.query({
      query: () => "/attendances",
      providesTags: ["Attendance"],
    }),

    // ✅ KEEP - Parent view child's attendance
    getStudentAttendance: builder.query({
      query: (studentId) => `/attendances/student/${studentId}`,
      providesTags: ["Attendance"],
    }),

    // ✅ KEEP - Teacher/Admin view today's summary
    getTodayBasicSummary: builder.query({
      query: () => `/attendances/today-basic-summary`,
      providesTags: ["Attendance"],
    }),

    // ✅ KEEP - Admin dashboard stats
    getDashboardStats: builder.query({
      query: () => `/attendances/dashboard-stats`,
      providesTags: ["Attendance"],
    }),

    // ⚠️ PARTIAL - Keep for Teacher/Admin (attendance reports)
    getAttendanceStats: builder.query({
      query: (params = {}) => ({
        url: "/attendances/attendance-stats",
        params,
      }),
      providesTags: ["Attendance"],
    }),

    // ✅ KEEP - View single attendance record
    getAttendance: builder.query({
      query: (id) => `/attendances/${id}`,
      providesTags: ["Attendance"],
    }),

    // ⚠️ PARTIAL - Keep for Admin/Teacher (present count today)
    getAttendancePresentCount: builder.query({
      query: (type) => `/attendances/present-today/${type}`,
      providesTags: ["Attendance"],
    }),

    // ✅ KEEP - Teacher marks attendance by date
    getAttendanceByTeacherAndDate: builder.query({
      query: ({ teacherId, date }) =>
        `/attendances/teacher/${teacherId}/date/${date}`,
      providesTags: ["Attendance"],
    }),

    // ✅ KEEP - Parent views child's monthly attendance summary
    getAttendanceByStudentSummary: builder.query({
      query: ({ studentId, month, year }) => {
        const params = new URLSearchParams();
        if (month) params.append("month", month);
        if (year) params.append("year", year);

        return `/attendances/student/${studentId}/summary?${params.toString()}`;
      },
      providesTags: ["Attendance"],
    }),

    // ✅ KEEP - Admin/Parent dashboard summary
    getDashboardAttendanceSummary: builder.query({
      query: () => "/attendances/dashboard-summary-today",
      providesTags: ["Attendance"],
    }),

    // ⚠️ PARTIAL - Keep for Admin/Teacher (filtered reports)
    getFilteredAttendances: builder.query({
      query: ({ studentIds, startDate, endDate, classId }) => {
        const params = new URLSearchParams();
        params.append("studentIds", studentIds);
        params.append("startDate", startDate);
        params.append("endDate", endDate);
        params.append("classId", classId);

        return `/attendances/filtered?${params.toString()}`;
      },
      providesTags: ["Attendance", "Merit"],
    }),

    // ✅ KEEP - Teacher marks attendance (mobile friendly)
    addAttendance: builder.mutation({
      query: (attendanceData) => ({
        url: "/attendances",
        method: "POST",
        body: attendanceData,
      }),
      invalidatesTags: ["Attendance"],
    }),

    // ✅ KEEP - Teacher bulk mark all present
    presentAllStudents: builder.mutation({
      query: (data) => ({
        url: "/attendances/present-all",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Attendance"],
    }),

    // ✅ KEEP - Teacher remove all attendance for a class
    removeAllAttendance: builder.mutation({
      query: (data) => ({
        url: "/attendances/remove-all",
        method: "DELETE",
        body: data,
      }),
      invalidatesTags: ["Attendance"],
    }),

    // ✅ KEEP - Teacher updates attendance status
    updateAttendance: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/attendances/${id}`,
        method: "PATCH",
        body: patch,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Attendance"],
    }),

    // ⚠️ PARTIAL - Keep for Admin/Teacher (timeout tracking)
    timeoutAttendance: builder.mutation({
      query: (id) => ({
        url: `/attendances/${id}/timeout`,
        method: "PATCH",
      }),
      invalidatesTags: ["Attendance"],
    }),

    // ⚠️ PARTIAL - Keep for Admin only
    deleteAttendance: builder.mutation({
      query: (id) => ({
        url: `/attendances/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Attendance"],
    }),

  }),
});

export const {
  // Query hooks
  useGetAttendancesQuery,              // ⚠️ Admin only
  useGetStudentAttendanceQuery,        // ✅ Parent
  useGetTodayBasicSummaryQuery,        // ✅ Teacher/Admin
  useGetDashboardStatsQuery,           // ✅ Admin
  useGetAttendanceStatsQuery,          // ⚠️ Teacher/Admin
  useGetAttendanceQuery,               // ✅ All roles
  useGetAttendancePresentCountQuery,   // ⚠️ Admin/Teacher
  useGetAttendanceByTeacherAndDateQuery, // ✅ Teacher
  useGetAttendanceByStudentSummaryQuery, // ✅ Parent/Teacher
  useGetDashboardAttendanceSummaryQuery, // ✅ Parent/Admin
  useGetFilteredAttendancesQuery,      // ⚠️ Admin/Teacher

  // Mutation hooks
  useAddAttendanceMutation,            // ✅ Teacher
  usePresentAllStudentsMutation,       // ✅ Teacher
  useRemoveAllAttendanceMutation,      // ✅ Teacher
  useUpdateAttendanceMutation,         // ✅ Teacher
  useTimeoutAttendanceMutation,        // ⚠️ Admin/Teacher
  useDeleteAttendanceMutation,         // ⚠️ Admin only
} = attendancesApi;
