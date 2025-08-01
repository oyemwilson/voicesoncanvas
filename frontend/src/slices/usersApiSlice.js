import { apiSlice } from './apiSlice';
import { USERS_URL } from '../constants';

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/auth`,
        method: 'POST',
        body: data,
      }),
    }),
    register: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}`,
        method: 'POST',
        body: data,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/logout`,
        method: 'POST',
      }),
    }),
    profile: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/profile`,
        method: 'PUT',
        body: data,
      }),
    }),
    getUsers: builder.query({
      query: () => ({
        url: USERS_URL,
      }),
      providesTags: ['User'],
      keepUnusedDataFor: 5,
    }),
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `${USERS_URL}/${userId}`,
        method: 'DELETE',
      }),
    }),
    getUserDetails: builder.query({
      query: (id) => ({
        url: `${USERS_URL}/${id}`,
      }),
      keepUnusedDataFor: 5,
    }),
    updateUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/${data.userId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // ✅ NEW ENDPOINTS
    verifyEmail: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/verify-email`,
        method: 'POST',
        body: data, // expects { email, otp }
      }),
    }),

    resendOtp: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/resend-otp`,
        method: 'POST',
        body: data, // expects { email }
      }),
    }),

    forgotPassword: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/forgot-password`,
        method: 'POST',
        body: data, // expects { email }
      }),
    }),

    verifyResetOtp: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/verify-reset-otp`,
        method: 'POST',
        body: data, // expects { email, otp }
      }),
    }),

    resetPassword: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/reset-password`,
        method: 'POST',
        body: data, // expects { resetToken, newPassword }
      }),
    }),
requestSeller: builder.mutation({
  query: (formData) => ({
     url: `/api/upload/request-seller`, // 🔥 call the upload route
    method: 'POST',
    body: formData,
  }),
}),

    approveSeller: builder.mutation({
      query: (id) => ({
        url: `${USERS_URL}/${id}/approve-seller`,
        method: 'PUT',
      }),
    }),


    // NEW: declineSeller mutation
    declineSeller: builder.mutation({
      query: (id) => ({
        url: `${USERS_URL}/${id}/decline-seller`, // your DELETE route
        method: 'DELETE',
      }),
      invalidatesTags: ['SellerRequests'],
    }),
toggleFeaturedArtist: builder.mutation({
  query: (id) => ({
    url: `${USERS_URL}/${id}/feature-artist`,
    method: 'PUT',
  }),
  // 🔥 This will trigger useGetUsersQuery to refetch after toggle
  invalidatesTags: ['User'],
}),

    getFeaturedArtists: builder.query({
      query: () => ({
        url: `${USERS_URL}/featured-artists`,
        method: 'GET',
      }),
      providesTags: ['User'],
    }),
    getMyProducts: builder.query({
      query: () => ({
        url: `${USERS_URL}/my-products`,
        method: 'GET',
      }),
      providesTags: ['Products'],
    }),
    getArtistProfile: builder.query({
      query: (id) => ({
        url: `${USERS_URL}/${id}/artist-profile`,
        method: 'GET',
      }),
    }),
    getSellerRequests: builder.query({
  query: () => ({
    url: `${USERS_URL}/seller-requests`,
    method: 'GET',
  }),
}),
updateArtistProfile: builder.mutation({
  query: (formData) => ({
    url: `/api/upload/artist-profile`, // ✅ your new route
    method: 'PUT',
    body: formData,
  }),
}),
// slices/userApiSlice.js

getSellers: builder.query({
  query: () => ({
    url: `${USERS_URL}/sellers`,
    method: 'GET',
  }),
  providesTags: ['User'],
  keepUnusedDataFor: 60,
}),






  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useProfileMutation,
  useGetUsersQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useGetUserDetailsQuery,
  useGetSellerRequestsQuery,
    useDeclineSellerMutation,

    useGetSellersQuery,

  // ✅ Export new hooks
  useVerifyEmailMutation,
  useResendOtpMutation,
  useForgotPasswordMutation,
  useVerifyResetOtpMutation,
  useResetPasswordMutation,

   // ✅ Artist / Seller management
  useRequestSellerMutation,
  useApproveSellerMutation,
  useToggleFeaturedArtistMutation,
  useGetFeaturedArtistsQuery,
  useGetMyProductsQuery,
  useGetArtistProfileQuery,
  useUpdateArtistProfileMutation
} = userApiSlice;
