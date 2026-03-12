import { apiSlice } from "./appSlice";
import { User } from "../../../types/user.type";
import { ApiSuccess } from "@/types/api.type";
// import { ApiSuccess } from "../../../types/api.type";


export const authApi = apiSlice.injectEndpoints({
    endpoints: (builder)=> ({
        registerUser: builder.mutation<ApiSuccess<User>, Partial<User>>({
            query: (body)=>{
                return {
                url: "/users/register",
                method: "POST",
                body
            }},
            // providesTags: "users"
            invalidatesTags: ["Users"]
        }),
        loginUser: builder.mutation<ApiSuccess<string>, Partial<User>>({
            query: (body)=>{
                return {
                url: "/users/login",
                method: "POST",
                body
            }},
            // providesTags: "users"
            invalidatesTags: ["Users"]
        }),
        getUser: builder.query<ApiSuccess<User>, void>({
            query: ()=> "/users/get-account",
            // providesTags: "users"
            providesTags: ["Users"]
        }),
    })
})

export const {useRegisterUserMutation, useLoginUserMutation, useGetUserQuery, useLazyGetUserQuery} = authApi