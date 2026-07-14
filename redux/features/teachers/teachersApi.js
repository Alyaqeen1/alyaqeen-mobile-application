import { apiSlice } from "../../api/apiSlice";

export const teachersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // ⚠️ PARTIAL - Keep for Admin only (all teachers list)
    getTeachers: builder.query({
      query: () => "/teachers",
      providesTags: ["Teacher"],
    }),

    // ✅ KEEP - View specific teacher details
    getTeacherById: builder.query({
      query: (id) => `/teachers/by-id/${id}`,
      providesTags: ["Teacher"],
    }),

    // ✅ KEEP - Teacher count on Admin dashboard
    getTeacherCount: builder.query({
      query: () => `/teachers/count`,
      providesTags: ["Teacher"],
    }),

    // ⚠️ PARTIAL - Keep for Admin only
    getTeacherByStatus: builder.query({
      query: (status) => `/teachers/by-status/${status}`,
      providesTags: ["Teacher"],
    }),

    // ⚠️ PARTIAL - Keep for Admin only
    getTeacherByEmail: builder.query({
      query: (email) => `/teachers/by-email/${email}`,
      providesTags: ["Teacher"],
    }),

    // ✅ KEEP - Filter teachers by activity
    getTeacherByActivity: builder.query({
      query: ({ activity, search }) => {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        return `/teachers/by-activity/${activity}?${params.toString()}`;
      },
      providesTags: ["Teacher"],
    }),

    // ⚠️ PARTIAL - Keep for Admin only
    getPendingRejectedTeacher: builder.query({
      query: () => `/teachers/pending-rejected`,
      providesTags: ["Teacher"],
    }),

    // ✅ KEEP - View teacher with full details
    getTeacherWithDetails: builder.query({
      query: (id) => `/teachers/with-details/${id}`,
      providesTags: ["Teacher"],
    }),

    // ⚠️ PARTIAL - Keep for Admin only (add teacher)
    addTeacher: builder.mutation({
      query: (teacher) => ({
        url: "/teachers",
        method: "POST",
        body: teacher,
      }),
      invalidatesTags: ["Teacher"],
    }),

    // ⚠️ PARTIAL - Keep for Admin only (delete teacher)
    deleteTeacher: builder.mutation({
      query: (id) => ({
        url: `/teachers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Teacher"],
    }),

    // ✅ KEEP - Update teacher status (Admin)
    updateTeacherStatus: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/teachers/update-status/${id}`,
        method: "PATCH",
        body: patch,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Teacher"],
    }),

    // ✅ KEEP - Update teacher activity (Admin)
    updateTeacherActivity: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/teachers/update-activity/${id}`,
        method: "PATCH",
        body: patch,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Teacher"],
    }),

    // ⚠️ PARTIAL - Keep for Admin only (full update)
    updateTeacher: builder.mutation({
      query: ({ id, teacherData }) => ({
        url: `/teachers/${id}`,
        method: "PUT",
        body: teacherData,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Teacher"],
    }),

  }),
});

export const {
  // Query hooks
  useGetTeachersQuery,                 // ⚠️ Admin only
  useGetTeacherByIdQuery,              // ✅ All roles
  useGetTeacherCountQuery,             // ✅ Admin
  useGetTeacherByStatusQuery,          // ⚠️ Admin only
  useGetTeacherByEmailQuery,           // ⚠️ Admin only
  useGetTeacherByActivityQuery,        // ✅ Admin/Teacher
  useGetTeacherWithDetailsQuery,       // ✅ Admin/Teacher
  useGetPendingRejectedTeacherQuery,   // ⚠️ Admin only

  // Mutation hooks
  useAddTeacherMutation,               // ⚠️ Admin only
  useUpdateTeacherStatusMutation,      // ✅ Admin
  useUpdateTeacherActivityMutation,    // ✅ Admin
  useUpdateTeacherMutation,            // ⚠️ Admin only
  useDeleteTeacherMutation,            // ⚠️ Admin only
} = teachersApi;
