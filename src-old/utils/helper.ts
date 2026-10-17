import { FetchBaseQueryError } from "@reduxjs/toolkit/query";


export const formatApiError = (err: any)=>{
    if (err instanceof Error && err.message) {
        return err.message;
    }

    const errorData = (err as FetchBaseQueryError)?.data as
      | { error?: string; message?: string }
      | undefined;

    const message =
      errorData?.error ??
      errorData?.message ??
      "Network error.";

    return message
} 
