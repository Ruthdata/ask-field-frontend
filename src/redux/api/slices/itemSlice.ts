import { apiSlice } from "./appSlice";

export interface Item {
  id: string;
  name: string;
}

export const itemsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getItems: builder.query<Item[], void>({
      query: () => "/items",
      providesTags: ["Items"],
    }),
    addItem: builder.mutation<Item, Partial<Item>>({
      query: (body) => ({
        url: "/items",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Items"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetItemsQuery, useAddItemMutation } = itemsApi;
