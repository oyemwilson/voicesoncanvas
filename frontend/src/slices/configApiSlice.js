import { apiSlice } from './apiSlice';

export const configApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPaystackPublicKey: builder.query({
      query: () => '/api/config/paystack',
    }),
  }),
});

export const { useGetPaystackPublicKeyQuery } = configApiSlice;
