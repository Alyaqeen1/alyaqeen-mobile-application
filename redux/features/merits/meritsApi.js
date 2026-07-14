import { apiSlice } from "../../api/apiSlice";

export const meritsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    
    // ⚠️ PARTIAL - Keep for Admin/Teacher only (all merits)
    getMerits: builder.query({
      query: () => "/merits",
      providesTags: ["Merit"],
    }),

    // ✅ KEEP - Parent views child's merits/achievements
    getMeritsOfStudent: builder.query({
      query: ({ studentId, month, year }) => {
        const params = new URLSearchParams();
        if (month) params.append("month", month);
        if (year) params.append("year", year);

        return `/merits/student/${studentId}?${params.toString()}`;
      },
      providesTags: (result, error, { studentId }) => [
        { type: "Merit", id: studentId },
        "Merit",
      ],
    }),

    // ✅ KEEP - Parent/Community views top merit students
    getTopMerits: builder.query({
      query: (searchTerm) =>
        searchTerm
          ? `/merits/top-merit-students?search=${encodeURIComponent(
              searchTerm
            )}`
          : "/merits/top-merit-students",
      providesTags: ["Merit"],
    }),

    // ✅ KEEP - Teacher awards merits to students (mobile friendly)
    addMerit: builder.mutation({
      query: (merit) => ({
        url: "/merits",
        method: "POST",
        body: merit,
      }),
      invalidatesTags: ["Merit"],
    }),
  }),
});

export const {
  // Query hooks
  useGetMeritsQuery,              // ⚠️ Admin/Teacher only
  useGetMeritsOfStudentQuery,     // ✅ Parent/Teacher
  useGetTopMeritsQuery,           // ✅ All users (community feature)
  
  // Mutation hooks
  useAddMeritMutation,            // ✅ Teacher
} = meritsApi;
