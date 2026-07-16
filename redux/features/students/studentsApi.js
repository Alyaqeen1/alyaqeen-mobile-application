import { apiSlice } from "../../api/apiSlice";

export const studentsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // ✅ KEEP - View specific student (Parent sees child)
    getStudent: builder.query({
      query: (id) => `/students/by-id/${id}`,
      providesTags: ["Student"],
    }),

    // âœ… KEEP - Teacher loads students for a selected group/class
    getStudentsByGroup: builder.query({
      query: (groupId) => `/students/by-group/${groupId}`,
      providesTags: ["Student"],
    }),

    // ✅ KEEP - Student count on Admin dashboard
    getStudentCount: builder.query({
      query: () => `/students/count`,
      providesTags: ["Student"],
    }),

    // ✅ KEEP - Lightweight activity tracking
    getStudentByActivity: builder.query({
      query: ({ activity, search }) => {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        return `/students/by-activity/${activity}?${params.toString()}`;
      },
      providesTags: ["Student"],
    }),

    // ✅ KEEP - Lightweight dashboard stats for Admin
    getCurrentMonthStats: builder.query({
      query: () => `/students/current-month-stats`,
      providesTags: ["Student"],
    }),

    // ✅ KEEP - Teacher updates status
    updateStudentStatus: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/students/${id}`,
        method: "PATCH",
        body: patch,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Family", "Student", "Fee"],
    }),

    // ✅ KEEP - Generate report (important for parents/teachers)
    generateReport: builder.mutation({
      query: ({ id }) => ({
        url: `/students/generate-student-report/${id}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Family", "Student", "Fee"],
    }),

    // ✅ KEEP - Teacher tracks student activity
    updateStudentActivity: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/students/update-activity/${id}`,
        method: "PATCH",
        body: patch,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Family", "Student", "Fee"],
    }),

  }),
});

export const {
  // Query hooks
  useGetStudentQuery,
  useGetStudentsByGroupQuery,
  useGetStudentCountQuery,
  useGetStudentByActivityQuery,
  useGetCurrentMonthStatsQuery,

  // Mutation hooks
  useUpdateStudentStatusMutation,
  useGenerateReportMutation,
  useUpdateStudentActivityMutation,
} = studentsApi;
