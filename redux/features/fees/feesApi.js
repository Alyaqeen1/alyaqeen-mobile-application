import { apiSlice } from "../../api/apiSlice";

export const feesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    
    // ⚠️ PARTIAL - Keep for Admin only (all fees)
    getFees: builder.query({
      query: () => `/fees`,
      providesTags: ["Fee"],
    }),
    
    // ✅ KEEP - View single fee record
    getFee: builder.query({
      query: (id) => `/fees/${id}`,
      providesTags: ["Fee"],
    }),
    
    // ⚠️ PARTIAL - Keep for Admin only (revenue summary)
    getRevenueSummary: builder.query({
      query: (year) => `/fees/revenue-summary/${year}`,
      providesTags: ["Fee"],
    }),
    
    // ⚠️ PARTIAL - Keep for Admin only (fees by status)
    getFeesByStatus: builder.query({
      query: (status) => `/fees/by-status/${status}`,
      providesTags: ["Fee"],
    }),
    
    // ✅ KEEP - View fee by ID
    getFeesById: builder.query({
      query: (id) => `/fees/by-id/${id}`,
      providesTags: ["Fee"],
    }),
    
    // ✅ KEEP - Parent views fees for specific student
    getFeesByStudentId: builder.query({
      query: (id) => `/fees/by-student-id/${id}`,
      providesTags: ["Fee"],
    }),
    
    // ✅ KEEP - View fee by fee ID
    getFeesByFeeId: builder.query({
      query: (id) => `/fees/by-fee-id/${id}`,
      providesTags: ["Fee"],
    }),
    
    // ✅ KEEP - Parent views student fee summary
    getFeesSummary: builder.query({
      query: (id) => `/fees/student-summary/${id}`,
      providesTags: ["Fee"],
    }),
    
    // ✅ KEEP - Dashboard fee summary (Parent/Admin)
    getDashboardFeeSummary: builder.query({
      query: ({ month, year }) => `/fees/fee-summary/${month}/${year}`,
      providesTags: ["Fee", "Family"],
    }),
    
    // ⚠️ PARTIAL - Keep for Admin only (filtered fees by date)
    getFeesByDate: builder.query({
      query: (params = {}) => {
        const { paymentType, month, year } = params;
        let url = "/fees/with-payments";

        const queryParams = new URLSearchParams();
        if (paymentType) queryParams.append("paymentType", paymentType);
        if (month) queryParams.append("month", month);
        if (year) queryParams.append("year", year);

        if (queryParams.toString()) {
          url += `?${queryParams.toString()}`;
        }

        return url;
      },
      providesTags: ["Fee"],
    }),
    
    // ✅ KEEP - Parent views unpaid fees for student
    getUnpaidFees: builder.query({
      query: (id) => `/fees/unpaid-months/${id}`,
      providesTags: ["Fee"],
    }),
    
    // ⚠️ PARTIAL - Keep for Admin only (update fee data)
    updateFeeData: builder.mutation({
      query: ({ id, data }) => ({
        url: `/fees/update-status-mode/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Family", "Fee"],
    }),
    
    // ⚠️ PARTIAL - Keep for Admin only (update fee)
    updateFee: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/fees/update/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Family", "Fee"],
    }),
    
    // ⚠️ PARTIAL - Keep for Admin only (update payment)
    updatePayment: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/fees/update-payment/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Fee"],
    }),
    
    // ⚠️ PARTIAL - Keep for Admin only (create fee)
    createFeeData: builder.mutation({
      query: (data) => ({
        url: `/fees`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Family", "Fee"],
    }),
    
    // ⚠️ PARTIAL - Keep for Admin only (delete fee)
    deleteFee: builder.mutation({
      query: (id) => ({
        url: `/fees/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        "Family",
        "Fee",
        { type: "UnpaidFamily", id: "PARTIAL" },
      ],
    }),
    
  }),
});

export const {
  // Query hooks
  useGetFeesQuery,                       // ⚠️ Admin only
  useGetFeeQuery,                        // ✅ All roles
  useGetRevenueSummaryQuery,             // ⚠️ Admin only
  useGetFeesByStatusQuery,               // ⚠️ Admin only
  useGetFeesSummaryQuery,                // ✅ Parent
  useGetDashboardFeeSummaryQuery,        // ✅ Parent/Admin
  useGetFeesByDateQuery,                 // ⚠️ Admin only
  useGetFeesByIdQuery,                   // ✅ All roles
  useGetUnpaidFeesQuery,                 // ✅ Parent
  useGetFeesByStudentIdQuery,            // ✅ Parent
  useGetFeesByFeeIdQuery,                // ✅ All roles
  
  // Mutation hooks
  useUpdateFeeDataMutation,              // ⚠️ Admin only
  useUpdateFeeMutation,                  // ⚠️ Admin only
  useUpdatePaymentMutation,              // ⚠️ Admin only
  useCreateFeeDataMutation,              // ⚠️ Admin only
  useDeleteFeeMutation,                  // ⚠️ Admin only
} = feesApi;
