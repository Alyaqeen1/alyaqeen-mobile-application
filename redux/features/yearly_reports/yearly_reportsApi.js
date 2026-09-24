import { apiSlice } from "../../api/apiSlice";

export const yearlyReportsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== GET ALL REPORTS ====================
    getYearlyReports: builder.query({
      query: () => "/yearly-reports",
      providesTags: ["YearlyReport"],
    }),

    // ==================== GET STUDENT'S YEARLY REPORTS ====================
    getStudentYearlyReports: builder.query({
      query: ({ studentId, academic_year }) => {
        const params = new URLSearchParams();
        if (academic_year) params.set("academic_year", academic_year);

        return {
          url: `/yearly-reports/student/${studentId}`,
          params: params,
        };
      },
      providesTags: (result, error, { studentId }) => [
        { type: "YearlyReport", id: `student-${studentId}` },
      ],
    }),

    // ==================== GET BEGINNING OF YEAR ====================
    getBeginningOfYear: builder.query({
      query: ({ studentId, academic_year }) => ({
        url: `/yearly-reports/student/${studentId}/beginning`,
        params: { academic_year },
      }),
      providesTags: (result, error, { studentId, academic_year }) => [
        {
          type: "YearlyReport",
          id: `beginning-${studentId}-${academic_year}`,
        },
      ],
      transformErrorResponse: (response) => {
        if (response.status === 404) {
          return { message: "Beginning of year report not found" };
        }
        return response.data;
      },
    }),

    // ==================== GET END OF YEAR ====================
    getEndOfYear: builder.query({
      query: ({ studentId, academic_year }) => ({
        url: `/yearly-reports/student/${studentId}/ending`,
        params: { academic_year },
      }),
      providesTags: (result, error, { studentId, academic_year }) => [
        {
          type: "YearlyReport",
          id: `ending-${studentId}-${academic_year}`,
        },
      ],
      transformErrorResponse: (response) => {
        if (response.status === 404) {
          return { message: "End of year report not found" };
        }
        return response.data;
      },
    }),

    // ==================== GET TERM PROGRESS ====================  ✅ NEW
    getTermProgress: builder.query({
      query: ({ studentId, year, term }) => {
        const params = new URLSearchParams();
        if (year) params.set("year", year);
        if (term) params.set("term", term);

        return {
          url: `/yearly-reports/student/${studentId}/term`,
          params: params,
        };
      },
      providesTags: (result, error, { studentId }) => [
        { type: "YearlyReport", id: `term-${studentId}` },
      ],
    }),

    // ==================== CREATE NEW REPORT ====================
    createYearlyReport: builder.mutation({
      query: (reportData) => ({
        url: "/yearly-reports",
        method: "POST",
        body: reportData,
      }),
      invalidatesTags: ["YearlyReport"],
      transformResponse: (response) => response,
      transformErrorResponse: (response) => response.data,
    }),

    // ==================== UPDATE REPORT ====================
    updateYearlyReport: builder.mutation({
      query: ({ id, data }) => ({
        url: `/yearly-reports/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "YearlyReport", id: id },
        "YearlyReport",
      ],
    }),

    // ==================== ADD NOTE TO REPORT ====================
    addNoteToYearlyReport: builder.mutation({
      query: ({ id, text, teacher_id }) => ({
        url: `/yearly-reports/${id}/notes`,
        method: "PATCH",
        body: { text, teacher_id },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "YearlyReport", id: id },
        "YearlyReport",
      ],
    }),

    // ==================== DELETE NOTE FROM REPORT ====================
    deleteNoteFromYearlyReport: builder.mutation({
      query: ({ id, noteId }) => ({
        url: `/yearly-reports/${id}/notes/${noteId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "YearlyReport", id: id },
        "YearlyReport",
      ],
    }),

    // ==================== DELETE REPORT ====================
    deleteYearlyReport: builder.mutation({
      query: (id) => ({
        url: `/yearly-reports/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["YearlyReport"],
    }),

    // ==================== GET STUDENTS WITHOUT BEGINNING REPORT ====================
    getStudentsMissingBeginningReport: builder.query({
      query: ({ classId, academic_year }) => ({
        url: `/yearly-reports/missing-beginning/${classId}`,
        params: { academic_year },
      }),
      providesTags: ["YearlyReport"],
    }),
  }),
});

// ==================== EXPORT HOOKS ====================
export const {
  // Queries
  useGetYearlyReportsQuery,
  useGetStudentYearlyReportsQuery,
  useGetBeginningOfYearQuery,
  useGetEndOfYearQuery,
  useGetTermProgressQuery, // ✅ NEW
  useGetStudentsMissingBeginningReportQuery,

  // Mutations
  useCreateYearlyReportMutation,
  useUpdateYearlyReportMutation,
  useAddNoteToYearlyReportMutation,
  useDeleteNoteFromYearlyReportMutation,
  useDeleteYearlyReportMutation,
} = yearlyReportsApi;
