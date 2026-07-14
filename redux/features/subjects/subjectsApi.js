import { apiSlice } from "../../api/apiSlice";

export const subjectsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // ✅ KEEP - Get all subjects (for dropdown/selection)
    getSubjects: builder.query({
      query: () => "/subjects",
      providesTags: ["Subject"],
    }),

    // ✅ KEEP - Get single subject details
    getSubject: builder.query({
      query: (id) => `/subjects/${id}`,
      providesTags: ["Subject"],
    }),

    // ⚠️ PARTIAL - Keep for Admin only (add new subject)
    addSubject: builder.mutation({
      query: (subjectData) => ({
        url: "/subjects",
        method: "POST",
        body: subjectData,
      }),
      invalidatesTags: ["Subject"],
    }),

    // ⚠️ PARTIAL - Keep for Admin only (update subject)
    updateSubject: builder.mutation({
      query: ({ id, ...subjectData }) => ({
        url: `/subjects/${id}`,
        method: "PUT",
        body: subjectData,
      }),
      invalidatesTags: ["Subject"],
    }),

    // ⚠️ PARTIAL - Keep for Admin only (remove subject)
    removeSubject: builder.mutation({
      query: (id) => ({
        url: `/subjects/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Subject"],
    }),

  }),
});

export const {
  // Query hooks - Available for all users
  useGetSubjectsQuery,
  useGetSubjectQuery,

  // Mutation hooks - Admin only
  useAddSubjectMutation,
  useUpdateSubjectMutation,
  useRemoveSubjectMutation,
} = subjectsApi;
