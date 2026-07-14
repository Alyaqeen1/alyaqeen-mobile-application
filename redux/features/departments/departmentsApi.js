import { apiSlice } from "../../api/apiSlice";

export const departmentsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    
    // ✅ KEEP - Get all departments (for dropdown/selection)
    getDepartments: builder.query({
      query: () => "/departments",
      providesTags: ["Department"],
    }),
    
    // ✅ KEEP - Get single department details
    getDepartment: builder.query({
      query: (id) => `/departments/${id}`,
      providesTags: ["Department"],
    }),
    
    // ⚠️ PARTIAL - Keep for Admin only (add new department)
    addDepartment: builder.mutation({
      query: (dept) => ({
        url: "/departments",
        method: "POST",
        body: dept,
      }),
      invalidatesTags: ["Department"],
    }),
    
    // ⚠️ PARTIAL - Keep for Admin only (update department)
    updateDepartment: builder.mutation({
      query: ({ id, ...dept }) => ({
        url: `/departments/${id}`,
        method: "PUT",
        body: dept,
      }),
      invalidatesTags: ["Department"],
    }),
    
    // ⚠️ PARTIAL - Keep for Admin only (delete department)
    removeDepartment: builder.mutation({
      query: (id) => ({
        url: `/departments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Department"],
    }),
    
  }),
});

export const {
  // Query hooks - Available for all users (read-only)
  useGetDepartmentsQuery,
  useGetDepartmentQuery,
  
  // Mutation hooks - Admin only
  useAddDepartmentMutation,
  useUpdateDepartmentMutation,
  useRemoveDepartmentMutation,
} = departmentsApi;
