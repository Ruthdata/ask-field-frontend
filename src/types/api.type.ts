export type ApiSuccess<T> = {
    success: boolean;
    data: T;
    message?: string;
  };

  export type ApiError = {
    success: false;
    error: string;
  };