import { apiSlice } from "../../api/apiSlice";

export const prayer_timesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    
    // ✅ KEEP - Get prayer times (Community feature)
    // Shows daily prayer times, next prayer countdown
    getPrayerTimes: builder.query({
      query: () => "/prayer-times",
      providesTags: ["PrayerTime"],
    }),
    
    // ⚠️ PARTIAL - Keep for Admin only (update prayer times)
    // Admin can update prayer timings from mobile if needed
    updatePrayerTimes: builder.mutation({
      query: (time) => ({
        url: `/prayer-times/update`,
        method: "PUT",
        body: time,
      }),
      invalidatesTags: ["PrayerTime"],
    }),
    
  }),
});

export const {
  // Query hooks - Available for all users (Community feature)
  useGetPrayerTimesQuery,
  
  // Mutation hooks - Admin only
  useUpdatePrayerTimesMutation,
} = prayer_timesApi;
