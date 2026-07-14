import { apiSlice } from "../../api/apiSlice";

export const announcementsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // ✅ KEEP - Get all announcements for community feed
    getAnnouncements: builder.query({
      query: () => "/announcements",
      providesTags: ["Announcements"],
    }),

    // ✅ KEEP - Get single announcement details
    getAnnouncement: builder.query({
      query: (id) => `/announcements/${id}`,
      providesTags: ["Announcements"],
    }),

    // ✅ KEEP - Filter announcements by type (events, notices, etc.)
    getAnnouncementByType: builder.query({
      query: (type) => `/announcements/by-type/${type}`,
      providesTags: ["Announcements"],
    }),

    // ✅ KEEP - Show latest announcement on dashboard
    getAnnouncementPublicLatest: builder.query({
      query: (type) => `/announcements/public/latest`,
      providesTags: ["Announcements"],
    }),

    // ✅ KEEP - Public announcements for community section
    getPublicAnnouncements: builder.query({
      query: () => "/announcements?type=public",
      providesTags: ["Announcements"],
    }),

    // ⚠️ KEEP (Admin only) - Add new announcement
    addAnnouncement: builder.mutation({
      query: (announcement) => ({
        url: "/announcements",
        method: "POST",
        body: announcement,
      }),
      invalidatesTags: ["Announcements"],
    }),

    // ⚠️ KEEP (Admin only) - Update announcement
    updateAnnouncement: builder.mutation({
      query: ({ id, ...announcement }) => ({
        url: `/announcements/${id}`,
        method: "PUT",
        body: announcement,
      }),
      invalidatesTags: ["Announcements"],
    }),

    // ⚠️ KEEP (Admin only) - Delete announcement
    deleteAnnouncement: builder.mutation({
      query: (id) => ({
        url: `/announcements/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Announcements"],
    }),

  }),
});

export const {
  // Query hooks - Available for all users
  useGetAnnouncementsQuery,
  useGetAnnouncementQuery,
  useGetAnnouncementByTypeQuery,
  useGetAnnouncementPublicLatestQuery,
  useGetPublicAnnouncementsQuery,
  
  // Mutation hooks - Only for Admin role
  useAddAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
} = announcementsApi;
