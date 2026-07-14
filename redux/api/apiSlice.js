import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
 baseQuery: fetchBaseQuery({
  baseUrl: "https://alyaqeen-server-two.vercel.app",
  credentials: "include",
}),
  // tagTypes: ["Reviews"],
  tagTypes: [
    "Student",
    "Family",
    "Fee",
    "Announcements",
    "Attendance",
    "Teacher",
    "Department",
    "Class",
    "Subject",
    "PrayerTime",
    "Merit",
    "WebsiteSettings",
    "Blog",
    "Complaint",
    "Search",
  ], // Add both Student & Family tags here
  endpoints: (builder) => ({}),
});
