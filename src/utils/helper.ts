import { FetchBaseQueryError } from "@reduxjs/toolkit/query";


export const formatApiError = (err: any)=>{
    const message =
    ((err as FetchBaseQueryError).data as { error: string })?.error ??
    "Network error.";
    return message
}