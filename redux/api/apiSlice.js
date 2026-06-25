import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
 baseQuery: fetchBaseQuery({
  baseUrl: process.env.EXPO_PUBLIC_URL,
  credentials: "include",
}),
  // tagTypes: ["Reviews"],
  tagTypes: [
    "Student",
    "Family",
    "Fee",
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
